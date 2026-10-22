import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class LearnerGroupService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerId?: string) {
    return this.prisma.learnerGroup.findMany({
      where: ownerId ? { ownerId } : {},
      include: { owner: { select: { id: true, email: true, userDetail: { select: { displayName: true } } } }, careerGoal: true, members: { include: { learner: { select: { id: true, email: true, userDetail: { select: { displayName: true } }, learnerProfile: { select: { level: true } } } } } }, _count: { select: { members: true } } },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async create(ownerId: string, dto: any) {
    if (!dto.name?.trim()) throw new BadRequestException('Tên nhóm không được để trống')
    return this.prisma.learnerGroup.create({ data: { name: dto.name.trim(), description: dto.description?.trim() || null, ownerId, careerGoalId: dto.careerGoalId || null }, include: { careerGoal: true, _count: { select: { members: true } } } })
  }

  async update(id: string, dto: any, ownerId?: string) {
    await this.assertExists(id, ownerId)
    return this.prisma.learnerGroup.update({ where: { id }, data: { ...(dto.name !== undefined && { name: dto.name.trim() }), ...(dto.description !== undefined && { description: dto.description?.trim() || null }), ...(dto.careerGoalId !== undefined && { careerGoalId: dto.careerGoalId || null }) }, include: { careerGoal: true, _count: { select: { members: true } } } })
  }

  async remove(id: string, ownerId?: string) { await this.assertExists(id, ownerId); await this.prisma.learnerGroup.delete({ where: { id } }) }

  async addMember(groupId: string, learnerId: string, ownerId?: string) {
    await this.assertExists(groupId, ownerId)
    const learner = await this.prisma.user.findFirst({ where: { id: learnerId, deletedAt: null, userRoles: { some: { role: { code: 'learner' } } } }, select: { id: true } })
    if (!learner) throw new BadRequestException('Tài khoản được chọn không phải học viên đang hoạt động')
    return this.prisma.learnerGroupMember.upsert({ where: { groupId_learnerId: { groupId, learnerId } }, update: {}, create: { groupId, learnerId } })
  }

  async removeMember(groupId: string, learnerId: string, ownerId?: string) { await this.assertExists(groupId, ownerId); await this.prisma.learnerGroupMember.deleteMany({ where: { groupId, learnerId } }) }

  private async assertExists(id: string, ownerId?: string) { if (!(await this.prisma.learnerGroup.findUnique({ where: { id, ...(ownerId ? { ownerId } : {}) }, select: { id: true } }))) throw new NotFoundException('Không tìm thấy nhóm học viên') }
}
