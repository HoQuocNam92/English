import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100)
    const { search, role, status } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userDetail: { displayName: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (role) {
      where.userRoles = { some: { role: { code: role } } }
    }
    if (status) {
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
      where: { id },
      include: {
        userDetail: true,
        userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
        learnerProfile: { include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } }, certGoals: { include: { certificate: true } } } }
      }
    })
    if (!user) throw new NotFoundException('User not found')
    return this.toDetailResponse(user)
  }

  async create(dto: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Email already in use')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        status: dto.status ?? 'active',
        userDetail: {
          create: {
            displayName: dto.displayName,
            avatarUrl: dto.avatarUrl,
            phoneNumber: dto.phoneNumber,
            bio: dto.bio,
            locale: dto.locale ?? 'vi',
            timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
          }
        }
      },
      include: { userDetail: true, userRoles: { include: { role: true } } }
    })

    const roleToAssign = dto.roleCode || dto.role || 'learner'
    const role = await this.prisma.role.findUnique({ where: { code: roleToAssign } })
    if (role) {
      await this.prisma.userRole.create({ data: { userId: user.id, roleId: role.id } })
    }

    if (roleToAssign === 'learner') {
      const defaultLevel = await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
      if (defaultLevel) {
        await this.prisma.learnerProfile.create({
          data: {
            userId: user.id,
            levelId: defaultLevel.id,
            weeklyStudyTargetMinutes: 180,
            onboardingCompleted: false,
          },
        }).catch(() => {})
      }
    }

    return this.toResponse(await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { userDetail: true, userRoles: { include: { role: true } } }
    }))
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    if (dto.status !== undefined) {
      await this.prisma.user.update({ where: { id }, data: { status: dto.status } })
    }
    if (dto.displayName !== undefined || dto.avatarUrl !== undefined || dto.bio !== undefined
        || dto.phoneNumber !== undefined || dto.locale !== undefined || dto.timezone !== undefined) {
      await this.prisma.userDetail.upsert({
        where: { userId: id },
        update: {
          ...(dto.displayName !== undefined && { displayName: dto.displayName }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
          ...(dto.bio !== undefined && { bio: dto.bio }),
          ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
          ...(dto.locale !== undefined && { locale: dto.locale }),
          ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        },
        create: { userId: id, displayName: dto.displayName ?? '' }
      })
    }
    return this.findOne(id)
  }

  async changePassword(id: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!isMatch) throw new ConflictException('Mật khẩu hiện tại không đúng')

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({ where: { id }, data: { passwordHash } })
    return { success: true }
  }

  async suspend(id: string) {
    await this.findOne(id)
    await this.prisma.user.update({ where: { id }, data: { status: 'suspended' } })
  }

  async activate(id: string) {
    await this.findOne(id)
    await this.prisma.user.update({ where: { id }, data: { status: 'active' } })
  }

  private toResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
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
        careerGoals: user.learnerProfile.careerGoals?.map((cg: any) => cg.careerGoal.code) ?? [],
        certGoals: user.learnerProfile.certGoals?.map((cg: any) => cg.certificate.code) ?? [],
      } : null,
    }
  }
}
