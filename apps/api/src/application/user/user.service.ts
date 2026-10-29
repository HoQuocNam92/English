import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import * as bcrypt from 'bcrypt'
import { normalizePhone, identityConflict } from './identity-fields'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100)
    const { search, role, status } = params
    const skip = (page - 1) * limit

    const where: any = { deletedAt: status === 'deleted' ? { not: null } : null }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userDetail: { displayName: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (role) {
      where.userRoles = { some: { role: { code: role } } }
    }
    if (status && status !== 'deleted') {
      where.status = status
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userDetail: true,
          userRoles: { include: { role: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ])

    return {
      data: users.map(u => this.toResponse(u)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        userDetail: true,
        userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
        learnerProfile: { include: { level: true, domains: { include: { domain: true } }, certGoals: { include: { certificate: true } }, careerGoals: { include: { careerGoal: true } } } }
      }
    })
    if (!user) throw new NotFoundException('Không tìm thấy người dùng')
    return this.toDetailResponse(user)
  }

  async create(dto: any) {
    const email = dto.email.trim().toLowerCase()
    const exists = await this.prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
    if (exists) throw new ConflictException('Email này đã được sử dụng')

    const phoneNumber = normalizePhone(dto.phoneNumber)
    const passwordHash = await bcrypt.hash(dto.password, 12)
    const roleToAssign = dto.roleCode || dto.role || 'learner'
    const role = await this.prisma.role.findUnique({ where: { code: roleToAssign } })
    if (!role) throw new BadRequestException('Vai trò không tồn tại')
    const defaultLevel = roleToAssign === 'learner'
      ? await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
      : null
    if (roleToAssign === 'learner' && !defaultLevel) throw new BadRequestException('Hệ thống chưa cấu hình cấp độ mặc định')

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        status: dto.status ?? 'active',
        userDetail: {
          create: {
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl,
            phoneNumber,
            bio: dto.bio,
            locale: dto.locale ?? 'vi',
            timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
          }
        },
        userRoles: { create: { roleId: role.id } },
        ...(roleToAssign === 'learner' && defaultLevel && {
          learnerProfile: { create: { levelId: defaultLevel.id, weeklyStudyTargetMinutes: 180, onboardingCompleted: false } },
        }),
      },
      include: { userDetail: true, userRoles: { include: { role: true } } }
    }).catch(identityConflict)

    return this.toResponse(await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { userDetail: true, userRoles: { include: { role: true } } }
    }))
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    if (dto.status !== undefined) throw new BadRequestException('Dùng chức năng khóa hoặc mở khóa riêng để thay đổi trạng thái tài khoản.')
    const phoneNumber = dto.phoneNumber === undefined ? undefined : normalizePhone(dto.phoneNumber)
    if (phoneNumber) {
      const occupied = await this.prisma.userDetail.findFirst({ where: { phoneNumber, userId: { not: id } } })
      if (occupied) throw new ConflictException('Số điện thoại này đã được sử dụng')
    }
    if (dto.displayName !== undefined || dto.avatarUrl !== undefined || dto.bio !== undefined
        || dto.phoneNumber !== undefined || dto.locale !== undefined || dto.timezone !== undefined) {
      await this.prisma.userDetail.upsert({
        where: { userId: id },
        update: {
          ...(dto.displayName !== undefined && { displayName: dto.displayName }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(dto.locale !== undefined && { locale: dto.locale }),
          ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        },
        create: { userId: id, displayName: dto.displayName ?? '', avatarUrl: dto.avatarUrl, bio: dto.bio, phoneNumber, locale: dto.locale, timezone: dto.timezone }
      }).catch(identityConflict)
    }
    return this.findOne(id)
  }

  async changePassword(id: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('Không tìm thấy người dùng')

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!isMatch) throw new ConflictException('Mật khẩu hiện tại không đúng')

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({ where: { id }, data: { passwordHash } })
    return { success: true }
  }

  async suspend(id: string, reason: string, actorId?: string) {
    const clean = typeof reason === 'string' ? reason.trim() : ''
    if (clean.length < 3 || clean.length > 500) throw new BadRequestException('Nhập lý do khóa từ 3 đến 500 ký tự.')
    if (id === actorId) throw new BadRequestException('Không thể khóa tài khoản đang đăng nhập')
    const user = await this.findOne(id)
    if (user.roles.includes('admin')) throw new BadRequestException('Không thể khóa tài khoản quản trị viên')
    const now = new Date()
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id, deletedAt: null }, data: { status: 'suspended', suspensionReason: clean } }),
      this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: now } }),
    ])
  }

  async activate(id: string) {
    await this.findOne(id)
    await this.prisma.user.update({ where: { id, deletedAt: null }, data: { status: 'active', suspensionReason: null } })
  }

  async restore(id: string) {
    try {
      return await this.prisma.$transaction(async tx => {
        const user = await tx.user.findUnique({ where: { id } })
        if (!user?.deletedAt) throw new BadRequestException('Tài khoản không ở trạng thái đã xóa.')
        if (user.email.endsWith('@deleted.invalid')) throw new ConflictException('Email cũ đã được giải phóng để đăng ký tài khoản mới. Không thể khôi phục danh tính cũ.')
        const restored = await tx.user.updateMany({ where: { id, deletedAt: user.deletedAt, email: user.email, status: 'inactive' }, data: { status: 'active', deletedAt: null, suspensionReason: null } })
        if (restored.count !== 1) throw new ConflictException('Tài khoản vừa thay đổi. Hãy tải lại danh sách.')
        // Preserve passwords, roles and history; never revive revoked refresh tokens.
        return { success: true }
      }, { isolationLevel: 'Serializable' })
    } catch (error) {
      if (['P2002', 'P2034'].includes((error as any)?.code)) throw new ConflictException('Email hoặc tài khoản đang được xử lý bởi yêu cầu khác. Hãy tải lại danh sách.')
      throw error
    }
  }

  async softDelete(id: string, actorId: string) {
    if (id === actorId) throw new BadRequestException('Không thể xóa tài khoản đang đăng nhập')
    const user = await this.findOne(id)
    if (user.roles.includes('admin')) throw new BadRequestException('Không thể xóa tài khoản quản trị viên')
    const now = new Date()
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id }, data: { status: 'inactive', deletedAt: now } }),
      this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: now } }),
    ])
    return { success: true }
  }

  private toResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      status: user.deletedAt ? 'deleted' : user.status,
      deletedAt: user.deletedAt ?? null,
      suspensionReason: user.suspensionReason ?? null,
      canRestore: !!user.deletedAt && !user.email.endsWith('@deleted.invalid'),
      displayName: user.userDetail?.displayName,
      avatarUrl: user.userDetail?.avatarUrl,
      phoneNumber: user.userDetail?.phoneNumber,
      roles: user.userRoles?.map((ur: any) => ur.role.code) ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private toDetailResponse(user: any) {
    return {
      ...this.toResponse(user),
      bio: user.userDetail?.bio,
      timezone: user.userDetail?.timezone,
      locale: user.userDetail?.locale,
      lastLoginAt: user.userDetail?.lastLoginAt,
      permissions: [...new Set<string>(
        user.userRoles?.flatMap((ur: any) => ur.role.rolePermissions?.map((rp: any) => rp.permission.code) ?? []) ?? []
      )],
      learnerProfile: user.learnerProfile ? {
        id: user.learnerProfile.id,
        level: user.learnerProfile.level?.code,
        bio: user.learnerProfile.bio,
        weeklyStudyTargetMinutes: user.learnerProfile.weeklyStudyTargetMinutes,
        domains: user.learnerProfile.domains?.map((d: any) => d.domain.code) ?? [],
        certGoals: user.learnerProfile.certGoals?.map((cg: any) => cg.certificate.code) ?? [],
        careerGoals: user.learnerProfile.careerGoals?.map((cg: any) => cg.careerGoal.code) ?? [],
      } : null,
    }
  }
}
