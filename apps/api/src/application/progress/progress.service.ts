import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProgressResourceType, ProgressStatus } from '@prisma/client'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { TrackLessonProgressDto } from '../../presentation/http-dto/content.dto'

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(learnerId: string) {
    await this.assertLearner(learnerId)
    const [progress, summary, recentAttempts] = await Promise.all([
      this.prisma.learningProgress.findMany({ where: { learnerId }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.progressSummaryCache.findUnique({ where: { learnerId } }),
      this.prisma.examAttempt.findMany({ where: { learnerId, status: { in: ['graded', 'submitted'] } }, include: { exam: { select: { title: true } } }, orderBy: { startedAt: 'desc' }, take: 10 }),
    ])
    return { progress, summary, recentAttempts }
  }

  async upsertProgress(learnerId: string, dto: TrackLessonProgressDto) {
    await this.assertLearner(learnerId)
    await this.assertResourceExists(dto.resourceType, dto.resourceId)
    if (dto.completedLessonCount !== undefined && dto.totalLessonCount !== undefined && dto.completedLessonCount > dto.totalLessonCount) {
      throw new BadRequestException('So bai da hoan thanh khong duoc lon hon tong so bai')
    }
    const status = (dto.status ?? 'in_progress') as ProgressStatus
    const completedAt = status === 'completed' ? new Date() : null
    return this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId, resourceType: dto.resourceType as ProgressResourceType, resourceId: dto.resourceId } },
      update: { status, completionPercent: dto.completionPercent, completedLessonCount: dto.completedLessonCount, totalLessonCount: dto.totalLessonCount, averageScorePercent: dto.averageScorePercent, completedAt },
      create: { learnerId, resourceType: dto.resourceType as ProgressResourceType, resourceId: dto.resourceId, status, completionPercent: dto.completionPercent, completedLessonCount: dto.completedLessonCount, totalLessonCount: dto.totalLessonCount, averageScorePercent: dto.averageScorePercent, startedAt: new Date(), completedAt },
    })
  }

  async markLessonComplete(learnerId: string, lessonId: string) {
    await this.assertLearner(learnerId)
    await this.assertResourceExists('lesson', lessonId)
    return this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId, resourceType: 'lesson', resourceId: lessonId } },
      update: { status: 'completed', completionPercent: 100, completedAt: new Date() },
      create: { learnerId, resourceType: 'lesson', resourceId: lessonId, status: 'completed', completionPercent: 100, startedAt: new Date(), completedAt: new Date() },
    })
  }

  async getLearnerProgress(learnerId: string) { return this.getMyProgress(learnerId) }

  private async assertLearner(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: 'active', userRoles: { some: { role: { code: 'learner', isActive: true } } } },
      select: { id: true, learnerProfile: { select: { id: true } } },
    })
    if (!user) throw new ForbiddenException('Chi hoc vien moi co tien do hoc tap')
    if (!user.learnerProfile) throw new BadRequestException('Tai khoan hoc vien chua co learner profile')
  }

  private async assertResourceExists(type: TrackLessonProgressDto['resourceType'], id: string) {
    const exists = type === 'lesson'
      ? await this.prisma.lesson.findUnique({ where: { id }, select: { id: true } })
      : type === 'domain'
        ? await this.prisma.domain.findUnique({ where: { id }, select: { id: true } })
        : await this.prisma.certificate.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new NotFoundException(`Khong tim thay ${type} tuong ung voi resourceId`)
  }
}
