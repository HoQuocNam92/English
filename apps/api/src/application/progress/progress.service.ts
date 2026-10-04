import { vietnamPeriods } from './learning-agenda.service'
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProgressResourceType, ProgressStatus } from '@prisma/client'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { TrackProgressDto } from '../../presentation/http-dto/content.dto'

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(learnerId: string) {
    await this.assertLearner(learnerId)
    const [progress, recentAttempts, vocabularyActivity, quizActivity] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where: { learnerId },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.examAttempt.findMany({
        where: { learnerId, status: { in: ['graded', 'submitted'] }, exam: { certificateId: { not: null } } },
        include: { exam: { select: { id: true, title: true } } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
      this.prisma.vocabularyProgress.findMany({
        where: { learnerId },
        select: { createdAt: true, lastReviewAt: true },
      }),
      this.prisma.examAttempt.findMany({
        where: { learnerId, status: { in: ['graded', 'submitted'] }, exam: { certificateId: { not: null } } },
        select: { submittedAt: true, startedAt: true },
      }),
    ])

    const domainIds = progress.filter((p) => p.resourceType === 'domain').map((p) => p.resourceId)
    const certIds = progress.filter((p) => p.resourceType === 'certificate').map((p) => p.resourceId)
    const lessonIds = progress.filter((p) => p.resourceType === 'lesson').map((p) => p.resourceId)
    const [domains, certs, lessons] = await Promise.all([
      domainIds.length ? this.prisma.domain.findMany({ where: { id: { in: domainIds } }, select: { id: true, name: true } }) : [],
      certIds.length ? this.prisma.certificate.findMany({ where: { id: { in: certIds } }, select: { id: true, name: true } }) : [],
      lessonIds.length ? this.prisma.lesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, title: true } }) : [],
    ])
    const domainMap = new Map<string, string>()
    domains.forEach((d: any) => domainMap.set(d.id, d.name))
    const certMap = new Map<string, string>()
    certs.forEach((c: any) => certMap.set(c.id, c.name))
    const lessonMap = new Map<string, string>()
    lessons.forEach((lesson) => lessonMap.set(lesson.id, lesson.title))

    const enrichedProgress = (progress as any[]).map((item) => {
      let title: string | undefined = undefined
      if (item.resourceType === 'domain') title = domainMap.get(item.resourceId)
      if (!title && item.resourceType === 'certificate') title = certMap.get(item.resourceId)
      if (!title && item.resourceType === 'lesson') title = lessonMap.get(item.resourceId)
      return {
        ...item,
        title: title ?? item.resourceType,
      }
    })

    const scoredAttempts = recentAttempts.filter((item) => item.scorePercent !== null)
    const summary = {
      overallCompletionPercent: progress.length
        ? Math.round(progress.reduce((sum, item) => sum + item.completionPercent, 0) / progress.length)
        : 0,
      totalAttempts: recentAttempts.length,
      averageScorePercent: scoredAttempts.length ? scoredAttempts.reduce((sum, item) => sum + (item.scorePercent ?? 0), 0) / scoredAttempts.length : null,
      weakTopics: [],
      calculatedAt: new Date(),
    }
    // Certificate-specific progress
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: learnerId },
      include: { level: true, certGoals: { include: { certificate: true } } },
    })
    const certProgress = await Promise.all(
      (profile?.certGoals ?? []).map(async (cg) => {
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
          examAttempts: certAttempts.length,
          avgScore,
        }
      })
    )

    const activityDates = new Set<string>()
    const addActivityDate = (date?: Date | null) => {
      if (date) activityDates.add(vietnamPeriods(date).label)
    }
    progress.filter(item => item.resourceType === 'lesson' && item.status !== 'not_started').forEach(item => addActivityDate(item.completedAt ?? item.updatedAt ?? item.startedAt))
    vocabularyActivity.forEach(item => addActivityDate(item.lastReviewAt ?? item.createdAt))
    quizActivity.forEach(item => addActivityDate(item.submittedAt ?? item.startedAt))

    let studyStreak = 0
    const cursor = new Date()
    const today = vietnamPeriods(cursor).label
    if (!activityDates.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1)
    while (activityDates.has(vietnamPeriods(cursor).label)) {
      studyStreak += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    const completedDomains = progress.filter(item => item.resourceType === 'domain' && (item.status === 'completed' || item.completionPercent >= 100)).length
    const completedLessons = progress.filter(item => item.resourceType === 'lesson' && (item.status === 'completed' || item.completionPercent >= 100)).length
    const firstActivityCount = completedLessons > 0 || vocabularyActivity.length > 0 || quizActivity.length > 0 ? 1 : 0
    const learningGoal = profile?.learningGoal ?? ((profile?.certGoals.length ?? 0) > 0 ? 'certification' : 'vocabulary')
    const includesVocabulary = learningGoal === 'vocabulary' || learningGoal === 'both'
    const includesCertification = learningGoal === 'certification' || learningGoal === 'both'
    const dailyVocabularyTarget = profile?.dailyVocabularyTarget ?? 10
    const vocabularyTarget = dailyVocabularyTarget * 7
    const quizTarget = Math.max(1, profile?.weeklyExamTarget ?? 2)

    const milestoneDefinitions = [
      { id: 'first_lesson', title: 'Hoàn thành hoạt động đầu tiên', description: 'Bắt đầu hành trình học tập đầu tiên', icon: '🚀', target: 1, current: firstActivityCount, xp: 50, color: 'violet' },
      ...(includesVocabulary ? [{ id: 'learn_words', title: `Học ${vocabularyTarget} từ`, description: `Cột mốc tích lũy tương đương ${dailyVocabularyTarget} từ/ngày trong 7 ngày; trình độ ${profile?.level.name ?? 'hiện tại'}`, icon: '📚', target: vocabularyTarget, current: vocabularyActivity.length, xp: 150, color: 'blue' }] : []),
      ...(includesCertification ? [{ id: 'complete_quizzes', title: `Làm ${quizTarget} quiz`, description: 'Cột mốc tích lũy dựa trên mục tiêu Quiz mỗi tuần', icon: '🧠', target: quizTarget, current: quizActivity.length, xp: 100, color: 'fuchsia' }] : []),
      { id: 'seven_day_streak', title: 'Học 7 ngày liên tiếp', description: 'Duy trì thói quen học mỗi ngày', icon: '🔥', target: 7, current: studyStreak, xp: 250, color: 'orange' },
      ...(includesCertification ? [{ id: 'complete_domain', title: 'Hoàn thành 1 domain', description: 'Chinh phục trọn vẹn một domain chứng chỉ', icon: '🏆', target: 1, current: completedDomains, xp: 300, color: 'amber' }] : []),
    ].map(item => ({
      ...item,
      current: Math.min(item.current, item.target),
      unlocked: item.current >= item.target,
      progressPercent: Math.min(100, Math.round((item.current / item.target) * 100)),
    }))
    const totalXp = milestoneDefinitions.filter(item => item.unlocked).reduce((total, item) => total + item.xp, 0)

    return {
      progress: enrichedProgress,
      summary,
      recentAttempts,
      certProgress,
      milestones: milestoneDefinitions,
      gamification: {
        totalXp,
        unlockedCount: milestoneDefinitions.filter(item => item.unlocked).length,
        totalMilestones: milestoneDefinitions.length,
        studyStreak,
        learningGoal,
        levelCode: profile?.level.code ?? null,
      },
    }
  }

  async upsertProgress(learnerId: string, dto: TrackProgressDto) {
    await this.assertLearner(learnerId)
    await this.assertResourceExists(dto.resourceType, dto.resourceId)
    const resolvedStatus = (dto.completionPercent !== undefined && dto.completionPercent >= 100)
      ? ('completed' as ProgressStatus)
      : ((dto.status ?? 'in_progress') as ProgressStatus)
    const completedAt = resolvedStatus === 'completed' ? new Date() : null
    return this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId, resourceType: dto.resourceType as ProgressResourceType, resourceId: dto.resourceId } },
      update: { status: resolvedStatus, completionPercent: dto.completionPercent, averageScorePercent: dto.averageScorePercent, completedAt },
      create: { learnerId, resourceType: dto.resourceType as ProgressResourceType, resourceId: dto.resourceId, status: resolvedStatus, completionPercent: dto.completionPercent, averageScorePercent: dto.averageScorePercent, startedAt: new Date(), completedAt },
    })
  }

  async getLearnerProgress(learnerId: string) {
    try {
      return await this.getMyProgress(learnerId)
    } catch {
      return {
        progress: [],
        summary: {
          overallCompletionPercent: 0,
          totalAttempts: 0,
          averageScorePercent: null,
          weakTopics: [],
          calculatedAt: new Date(),
        },
        recentAttempts: [],
        certProgress: [],
      }
    }
  }

  private async assertLearner(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: 'active', userRoles: { some: { role: { code: 'learner', isActive: true } } } },
      select: { id: true, learnerProfile: { select: { id: true } } },
    })
    if (!user) throw new ForbiddenException('Chỉ học viên mới có dữ liệu tiến độ học tập')
    if (!user.learnerProfile) throw new BadRequestException('Tài khoản học viên chưa có hồ sơ học tập')
  }

  private async assertResourceExists(type: TrackProgressDto['resourceType'], id: string) {
    const exists = type === 'lesson'
      ? await this.prisma.lesson.findUnique({ where: { id }, select: { id: true } })
      : type === 'domain'
        ? await this.prisma.domain.findUnique({ where: { id }, select: { id: true } })
        : await this.prisma.certificate.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new NotFoundException(`Không tìm thấy ${type} tương ứng với mã tài nguyên đã cung cấp`)
  }
}
