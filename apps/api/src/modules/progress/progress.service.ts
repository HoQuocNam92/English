import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service'

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(learnerId: string) {
    const [progress, summary, recentAttempts] = await Promise.all([
      this.prisma.learningProgress.findMany({ where: { learnerId }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.progressSummaryCache.findUnique({ where: { learnerId } }),
      this.prisma.examAttempt.findMany({ where: { learnerId, status: { in: ['graded','submitted'] } }, include: { exam: { select: { title: true } } }, orderBy: { startedAt: 'desc' }, take: 10 })
    ])
    return { progress, summary, recentAttempts }
  }

  async upsertProgress(learnerId: string, dto: any) {
    return this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId, resourceType: dto.resourceType, resourceId: dto.resourceId } },
      update: { status: dto.status, completionPercent: dto.completionPercent, completedLessonCount: dto.completedLessonCount, totalLessonCount: dto.totalLessonCount, averageScorePercent: dto.averageScorePercent, completedAt: dto.status==='completed' ? new Date() : undefined },
      create: { learnerId, resourceType: dto.resourceType, resourceId: dto.resourceId, status: dto.status??'in_progress', startedAt: new Date() }
    })
  }

  async getLearnerProgress(learnerId: string) { return this.getMyProgress(learnerId) }
}
