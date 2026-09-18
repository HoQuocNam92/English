import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProgressResourceType, ProgressStatus } from '@prisma/client'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { TrackLessonProgressDto } from '../../presentation/http-dto/content.dto'

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(learnerId: string) {
    await this.assertLearner(learnerId)
    const [progress, recentAttempts] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where: { learnerId },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              slug: true,
              domain: { select: { id: true, name: true, code: true } },
              level: { select: { id: true, name: true, code: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.examAttempt.findMany({
        where: { learnerId, status: { in: ['graded', 'submitted'] } },
        include: { exam: { select: { id: true, title: true } } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ])

    const domainIds = progress.filter((p) => p.resourceType === 'domain').map((p) => p.resourceId)
    const certIds = progress.filter((p) => p.resourceType === 'certificate').map((p) => p.resourceId)
    const [domains, certs] = await Promise.all([
      domainIds.length ? this.prisma.domain.findMany({ where: { id: { in: domainIds } }, select: { id: true, name: true } }) : [],
      certIds.length ? this.prisma.certificate.findMany({ where: { id: { in: certIds } }, select: { id: true, name: true } }) : [],
    ])
    const domainMap = new Map<string, string>()
    domains.forEach((d: any) => domainMap.set(d.id, d.name))
    const certMap = new Map<string, string>()
    certs.forEach((c: any) => certMap.set(c.id, c.name))

    const enrichedProgress = (progress as any[]).map((item) => {
      let title: string | undefined = item.lesson?.title
      if (!title && item.resourceType === 'domain') title = domainMap.get(item.resourceId)
      if (!title && item.resourceType === 'certificate') title = certMap.get(item.resourceId)
      return {
        ...item,
        title: title ?? (item.resourceType === 'lesson' ? 'Bài học' : item.resourceType),
      }
    })

    const lessonProgress = enrichedProgress.filter((item) => item.resourceType === 'lesson')
    const completedLessons = lessonProgress.filter((item) => item.status === 'completed').length
    const scoredAttempts = recentAttempts.filter((item) => item.scorePercent !== null)
    const summary = {
      overallCompletionPercent: lessonProgress.length ? Math.round(lessonProgress.reduce((sum, item) => sum + item.completionPercent, 0) / lessonProgress.length) : 0,
      completedLessons,
      totalAttempts: recentAttempts.length,
      averageScorePercent: scoredAttempts.length ? scoredAttempts.reduce((sum, item) => sum + (item.scorePercent ?? 0), 0) / scoredAttempts.length : null,
      weakTopics: [],
      calculatedAt: new Date(),
    }
    // Certificate-specific progress
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: learnerId },
      include: { certGoals: { include: { certificate: true } } },
    })
    const certProgress = await Promise.all(
      (profile?.certGoals ?? []).map(async (cg) => {
        // Find lessons linked to this certificate
        const certLessons = await this.prisma.lessonCertificate.findMany({
          where: { certificateId: cg.certificateId },
          select: { lessonId: true },
        })
        const lessonIds = certLessons.map((cl) => cl.lessonId)
        // Find learner's progress on those lessons
        const certLessonProgress = lessonIds.length > 0
          ? await this.prisma.learningProgress.findMany({
              where: { learnerId, resourceType: 'lesson', resourceId: { in: lessonIds } },
            })
          : []
        const completedCount = certLessonProgress.filter((p) => p.status === 'completed').length
        const completionPercent = lessonIds.length > 0
          ? Math.round((completedCount / lessonIds.length) * 100)
          : 0
        // Exam scores for this certificate
        const certAttempts = await this.prisma.examAttempt.findMany({
          where: { learnerId, exam: { certificateId: cg.certificateId }, status: { in: ['graded', 'submitted'] } },
          select: { scorePercent: true, passed: true },
        })
        const avgScore = certAttempts.length > 0
          ? Math.round(certAttempts.reduce((sum, a) => sum + Number(a.scorePercent ?? 0), 0) / certAttempts.length)
          : null
        return {
          certificateId: cg.certificateId,
          certificateCode: cg.certificate.code,
          certificateName: cg.certificate.name,
          totalLessons: lessonIds.length,
          completedLessons: completedCount,
          completionPercent,
          examAttempts: certAttempts.length,
          avgScore,
        }
      })
    )
    return { progress: enrichedProgress, summary, recentAttempts, certProgress }
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
