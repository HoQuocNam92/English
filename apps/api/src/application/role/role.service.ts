import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { SUPER_ADMIN, hasSuperAdminRole, protectSuperAdmin, requireSuperAdmin } from '../auth/super-admin.policy'

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return roles.map((r) => ({
      id: r.id, code: r.code, name: r.name, description: r.description,
      isSystem: r.isSystem, isActive: r.isActive,
      permissions: r.rolePermissions.map((rp) => ({
        id: rp.permission.id, code: rp.permission.code, name: rp.permission.name,
      })),
      userCount: r._count.userRoles,
    }))
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
        userRoles: { include: { user: { select: { id: true, email: true, userDetail: true, userRoles: { include: { role: true } } } } } },
      },
    })
    if (!role) throw new NotFoundException('Không tìm thấy nhóm quyền')
    return role
  }

  async create(dto: { code: string; name: string; description?: string }) {
    const code = dto.code.trim().toLowerCase()
    if (code === 'super_admin') throw new ForbiddenException('SUPER_ADMIN là vai trò hệ thống được bảo vệ')
    const exists = await this.prisma.role.findUnique({ where: { code } })
    if (exists) throw new ConflictException(`Nhóm quyền có mã "${code}" đã tồn tại`)
    return this.prisma.role.create({ data: { code, name: dto.name.trim(), description: dto.description?.trim(), isSystem: false } })
  }

  async update(id: string, dto: { name?: string; description?: string; isActive?: boolean }, actorId?: string) {
    const role = await this.findOne(id)
    if (role.code === SUPER_ADMIN) {
      await requireSuperAdmin(this.prisma, actorId)
      if (dto.isActive === false) throw new ForbiddenException('Không thể vô hiệu hóa vai trò Super Admin')
    }
    if (role.code === 'admin' && dto.isActive === false) throw new ForbiddenException('Không thể vô hiệu hóa vai trò quản trị viên')
    return this.prisma.role.update({ where: { id: role.id }, data: dto })
  }

  async delete(id: string, actorId?: string) {
    const role = await this.findOne(id)
    if (role.code === SUPER_ADMIN) throw new ForbiddenException('Không thể xóa vai trò Super Admin')
    if (role.isSystem) throw new ForbiddenException('Không thể xóa nhóm quyền mặc định của hệ thống')
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
    await this.prisma.userRole.deleteMany({ where: { roleId: id } })
    await this.prisma.role.delete({ where: { id } })
  }

  async assignPermission(roleId: string, permissionId: string, actorId?: string) {
    const role = await this.findOne(roleId)
    if (role.code === SUPER_ADMIN) await requireSuperAdmin(this.prisma, actorId)
    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } })
    if (!permission) throw new NotFoundException('Không tìm thấy quyền')
    await this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    })
  }

  async revokePermission(roleId: string, permissionId: string, actorId?: string) {
    const role = await this.findOne(roleId)
    if (role.code === SUPER_ADMIN) await requireSuperAdmin(this.prisma, actorId)
    await this.prisma.rolePermission.deleteMany({ where: { roleId, permissionId } })
  }

  async replacePermissions(roleId: string, permissionIds: string[], actorId?: string) {
    const role = await this.findOne(roleId)
    if (role.code === SUPER_ADMIN) await requireSuperAdmin(this.prisma, actorId)
    const uniqueIds = [...new Set(permissionIds)]
    const existingCount = uniqueIds.length
      ? await this.prisma.permission.count({ where: { id: { in: uniqueIds } } })
      : 0
    if (existingCount !== uniqueIds.length) throw new NotFoundException('Có quyền không tồn tại hoặc đã bị xóa')

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } })
      if (uniqueIds.length) {
        await tx.rolePermission.createMany({
          data: uniqueIds.map(permissionId => ({ roleId, permissionId })),
          skipDuplicates: true,
        })
      }
    })
    return this.findOne(roleId)
  }

  async assignRoleToUser(dto: { userId: string; roleId: string; expiresAt?: string; grantedById?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId }, include: { userRoles: { include: { role: true } } } })
    if (!user) throw new NotFoundException('Không tìm thấy người dùng')
    await protectSuperAdmin(this.prisma, user, dto.grantedById)
    const role = await this.findOne(dto.roleId)
    if (role.code === SUPER_ADMIN) {
      await requireSuperAdmin(this.prisma, dto.grantedById)
      if (dto.expiresAt) throw new ForbiddenException('Vai trò Super Admin không được có thời hạn')
      if (user.status !== 'active' || user.deletedAt) throw new ForbiddenException('Chỉ cấp Super Admin cho tài khoản đang hoạt động')
    }
    if ((!(role.code === 'admin' || role.code === SUPER_ADMIN) || dto.expiresAt) && await this.prisma.userRole.count({ where: { userId: dto.userId, role: { code: 'admin' } } })) {
      throw new ForbiddenException('Cần gỡ vai trò quản trị viên bằng chức năng phân quyền trước khi đổi vai trò')
    }
    const coreRoleCodes = ['admin', 'teacher', 'learner']
    if (dto.userId === dto.grantedById && (role.code !== 'admin' || dto.expiresAt)) {
      throw new ForbiddenException('Không thể tự thay đổi vai trò hoặc giới hạn quyền truy cập của chính mình')
    }
    const defaultLevel = role.code === 'learner'
      ? await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
      : null
    if (role.code === 'learner' && !defaultLevel) throw new ConflictException('Hệ thống chưa cấu hình cấp độ mặc định')

    await this.prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({ where: { id: dto.userId }, include: { userRoles: { include: { role: true } } } })
      await protectSuperAdmin(tx, current, dto.grantedById)
      if (role.code === SUPER_ADMIN) {
        await requireSuperAdmin(tx, dto.grantedById)
        if (!current || current.status !== 'active' || current.deletedAt) throw new ForbiddenException('Chỉ cấp Super Admin cho tài khoản đang hoạt động')
        const admin = await tx.role.findUnique({ where: { code: 'admin' } })
        if (!admin) throw new ConflictException('Hệ thống chưa cấu hình vai trò admin')
        await tx.userRole.upsert({ where: { userId_roleId: { userId: dto.userId, roleId: admin.id } }, update: { expiresAt: null }, create: { userId: dto.userId, roleId: admin.id, grantedById: dto.grantedById } })
      }
      if (hasSuperAdminRole(current) && (role.code === 'teacher' || role.code === 'learner' || (role.code === 'admin' && dto.expiresAt))) throw new ForbiddenException('Không thể hạ quyền hoặc giới hạn vai trò của Super Admin')
      if (coreRoleCodes.includes(role.code)) {
        if (role.code !== 'admin' && await tx.userRole.count({ where: { userId: dto.userId, role: { code: 'admin' } } })) throw new ForbiddenException('Không thể tự động thay thế vai trò quản trị viên')
        const otherCoreRoles = await tx.role.findMany({
          where: { code: { in: coreRoleCodes.filter(code => code !== role.code) } },
          select: { id: true },
        })
        await tx.userRole.deleteMany({
          where: { userId: dto.userId, roleId: { in: otherCoreRoles.map(item => item.id) } },
        })
      }

      await tx.userRole.upsert({
        where: { userId_roleId: { userId: dto.userId, roleId: dto.roleId } },
        update: { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null },
        create: {
          userId: dto.userId, roleId: dto.roleId,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          grantedById: dto.grantedById,
        },
      })

      if (role.code === 'learner') {
        await tx.learnerProfile.upsert({
          where: { userId: dto.userId },
          update: {},
          create: { userId: dto.userId, levelId: defaultLevel!.id, onboardingCompleted: false },
        })
      } else if (role.code === 'admin' || role.code === 'teacher') {
        await tx.learnerProfile.deleteMany({ where: { userId: dto.userId } })
      }
    }, { isolationLevel: 'Serializable' })
  }

  async revokeRoleFromUser(userId: string, roleId: string, actorId?: string) {
    if (userId === actorId) throw new ForbiddenException('Không thể tự gỡ vai trò của chính mình')
    const role = await this.findOne(roleId)
    await this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: userId }, include: { userRoles: { include: { role: true } } } })
      await protectSuperAdmin(tx, target, actorId)
      if (role.code === SUPER_ADMIN) {
        await requireSuperAdmin(tx, actorId)
        const remaining = await tx.userRole.count({ where: { roleId, userId: { not: userId }, role: { isActive: true }, user: { status: 'active', deletedAt: null }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } })
        if (!remaining) throw new ForbiddenException('Không thể gỡ Super Admin hoạt động cuối cùng')
      }
      if (role.code === 'admin' && hasSuperAdminRole(target)) throw new ForbiddenException('Không thể gỡ vai trò admin nền tảng của Super Admin')
      if (role.code === 'admin') {
        const remaining = await tx.userRole.count({ where: { roleId, userId: { not: userId }, user: { status: 'active', deletedAt: null }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } })
        if (!remaining) throw new ForbiddenException('Không thể gỡ quản trị viên hoạt động cuối cùng')
      }
      await tx.userRole.deleteMany({ where: { userId, roleId } })
      if (role.code === 'learner') await tx.learnerProfile.deleteMany({ where: { userId } })
    }, { isolationLevel: 'Serializable' })
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    })
  }

  async createPermission(dto: { code: string; name: string; resource: string; action: string; description?: string }) {
    const exists = await this.prisma.permission.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException(`Quyền có mã "${dto.code}" đã tồn tại`)
    return this.prisma.permission.create({ data: dto })
  }

  async updatePermission(id: string, dto: { code?: string; name?: string; resource?: string; action?: string; description?: string }, actorId?: string) {
    await requireSuperAdmin(this.prisma, actorId)
    const permission = await this.prisma.permission.findUnique({ where: { id } })
    if (!permission) throw new NotFoundException('Không tìm thấy quyền')
    if (dto.code && dto.code !== permission.code) {
      const duplicate = await this.prisma.permission.findUnique({ where: { code: dto.code } })
      if (duplicate) throw new ConflictException(`Quyền có mã "${dto.code}" đã tồn tại`)
    }
    return this.prisma.permission.update({ where: { id }, data: dto })
  }

  async deletePermission(id: string, actorId?: string) {
    await requireSuperAdmin(this.prisma, actorId)
    const permission = await this.prisma.permission.findUnique({ where: { id } })
    if (!permission) throw new NotFoundException('Không tìm thấy quyền')
    await this.prisma.permission.delete({ where: { id } })
  }

  async findUsersByRole(roleId: string, pageParam: any = 1, limitParam: any = 20) {
    const page = Math.max(1, Number(pageParam) || 1)
    const limit = Math.min(Math.max(1, Number(limitParam) || 20), 100)
    const skip = (page - 1) * limit
    const [userRoles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where: { roleId },
        include: { user: { select: { email: true, userDetail: true, userRoles: { include: { role: true } } } } },
        skip, take: limit,
      }),
      this.prisma.userRole.count({ where: { roleId } }),
    ])
    return {
      data: userRoles.map((ur) => ({
        userId: ur.userId, email: ur.user.email,
        displayName: ur.user.userDetail?.displayName,
        isSuperAdmin: hasSuperAdminRole(ur.user),
        grantedAt: ur.grantedAt, expiresAt: ur.expiresAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }
}
