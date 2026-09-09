import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

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
        userRoles: { include: { user: { include: { userDetail: true } } } },
      },
    })
    if (!role) throw new NotFoundException('Role not found')
    return role
  }

  async create(dto: { code: string; name: string; description?: string }) {
    const exists = await this.prisma.role.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException('Role ' + dto.code + ' already exists')
    return this.prisma.role.create({ data: { ...dto, isSystem: false } })
  }

  async update(id: string, dto: { name?: string; description?: string; isActive?: boolean }) {
    const role = await this.findOne(id)
    return this.prisma.role.update({ where: { id: role.id }, data: dto })
  }

  async delete(id: string) {
    const role = await this.findOne(id)
    if (role.isSystem) throw new ForbiddenException('System roles cannot be deleted')
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
    await this.prisma.userRole.deleteMany({ where: { roleId: id } })
    await this.prisma.role.delete({ where: { id } })
  }

  async assignPermission(roleId: string, permissionId: string) {
    const role = await this.findOne(roleId)
    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } })
    if (!permission) throw new NotFoundException('Permission not found')
    await this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    })
  }

  async revokePermission(roleId: string, permissionId: string) {
    await this.findOne(roleId)
    await this.prisma.rolePermission.deleteMany({ where: { roleId, permissionId } })
  }

  async assignRoleToUser(dto: { userId: string; roleId: string; expiresAt?: string; grantedById?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } })
    if (!user) throw new NotFoundException('User not found')
    const role = await this.findOne(dto.roleId)
    const coreRoleCodes = ['admin', 'teacher', 'learner']
    const defaultLevel = role.code === 'learner'
      ? await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
      : null
    if (role.code === 'learner' && !defaultLevel) throw new ConflictException('Hệ thống chưa cấu hình cấp độ mặc định')

    await this.prisma.$transaction(async (tx) => {
      if (coreRoleCodes.includes(role.code)) {
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
    })
  }

  async revokeRoleFromUser(userId: string, roleId: string) {
    const role = await this.findOne(roleId)
    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId, roleId } })
      if (role.code === 'learner') await tx.learnerProfile.deleteMany({ where: { userId } })
    })
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    })
  }

  async createPermission(dto: { code: string; name: string; resource: string; action: string; description?: string }) {
    const exists = await this.prisma.permission.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException('Permission ' + dto.code + ' already exists')
    return this.prisma.permission.create({ data: dto })
  }

  async updatePermission(id: string, dto: { code?: string; name?: string; resource?: string; action?: string; description?: string }) {
    const permission = await this.prisma.permission.findUnique({ where: { id } })
    if (!permission) throw new NotFoundException('Permission not found')
    if (dto.code && dto.code !== permission.code) {
      const duplicate = await this.prisma.permission.findUnique({ where: { code: dto.code } })
      if (duplicate) throw new ConflictException('Permission ' + dto.code + ' already exists')
    }
    return this.prisma.permission.update({ where: { id }, data: dto })
  }

  async deletePermission(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } })
    if (!permission) throw new NotFoundException('Permission not found')
    await this.prisma.permission.delete({ where: { id } })
  }

  async findUsersByRole(roleId: string, pageParam: any = 1, limitParam: any = 20) {
    const page = Math.max(1, Number(pageParam) || 1)
    const limit = Math.min(Math.max(1, Number(limitParam) || 20), 100)
    const skip = (page - 1) * limit
    const [userRoles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where: { roleId },
        include: { user: { include: { userDetail: true } } },
        skip, take: limit,
      }),
      this.prisma.userRole.count({ where: { roleId } }),
    ])
    return {
      data: userRoles.map((ur) => ({
        userId: ur.userId, email: ur.user.email,
        displayName: ur.user.userDetail?.displayName,
        grantedAt: ur.grantedAt, expiresAt: ur.expiresAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }
}
