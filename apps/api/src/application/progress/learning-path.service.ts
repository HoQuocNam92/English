import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { careerFocus } from '../recommendation/career-focus'

const done = (record: any) => record?.status === 'completed' || record?.completionPercent >= 100

@Injectable()
export class LearningPathService {
  constructor(private readonly prisma: PrismaService) {}

  async getPath(learnerId: string, db: any = this.prisma) {
    const user = await db.user.findFirst({ where: { id: learnerId, status: 'active', userRoles: { some: { role: { code: 'learner', isActive: true } } } }, select: { id: true } })
    if (!user) throw new ForbiddenException('Chỉ học viên mới có lộ trình học tập.')
    const profile = await db.learnerProfile.findUnique({ where: { userId: learnerId }, include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } } } })
    if (!profile?.onboardingCompleted || profile.levelSelectedAt === null || profile.learningGoal === 'certification' || profile.level.isActive === false) return { configured: false as const }
    const focus = careerFocus(profile.careerGoals)
    const selected = profile.domains.filter((link: any) => link.domain.isActive)
      .sort((a: any, b: any) => focus.score(b.domain.code) - focus.score(a.domain.code))
    if (!selected.length) return { configured: false as const }
    const domainIds = selected.map((link: any) => link.domainId)
    const [lessons, progress, exams, attempts, levels] = await Promise.all([
      db.lesson.findMany({ where: { status: 'published', type: { not: 'certification_review' }, domainId: { in: domainIds }, levelId: profile.levelId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true, title: true, slug: true, domainId: true, estimatedMinutes: true, _count: { select: { vocabularies: true } }, vocabularies: { where: { vocabulary: { status: 'published' } }, select: { vocabulary: { select: { vocabProgress: { where: { learnerId, lastRating: { not: null } }, select: { lastReviewAt: true } } } } } } } }),
      db.learningProgress.findMany({ where: { learnerId, resourceType: 'lesson' }, select: { resourceId: true, status: true, completionPercent: true, completedAt: true, updatedAt: true } }),
      db.exam.findMany({ where: { status: 'published', kind: { in: ['domain_test', 'practice'] }, certificateId: null, domainId: { in: domainIds }, levelId: profile.levelId, questions: { some: {} } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], select: { id: true, title: true, kind: true, domainId: true, topics: true, passingScorePercent: true } }),
      db.examAttempt.findMany({ where: { learnerId, status: 'graded', exam: { domainId: { in: domainIds }, levelId: profile.levelId, certificateId: null } }, select: { id: true, examId: true, passed: true, scorePercent: true, submittedAt: true }, orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }] }),
      db.level.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }], select: { id: true, code: true, name: true } }),
    ])
    const byLesson = new Map(progress.map((record: any) => [record.resourceId, record]))
    const domains = selected.map((link: any) => {
      const rows = lessons.filter((lesson: any) => lesson.domainId === link.domainId)
      // Missing data must never produce a completed course or unlock promotion.
      const available = rows.length > 0
      const lessonItems = rows.map((lesson: any) => ({ id: lesson.id, title: lesson.title, href: `/learn/lessons/${lesson.id}`, week: rows.indexOf(lesson) + 1, completed: done(byLesson.get(lesson.id)), estimatedMinutes: lesson.estimatedMinutes, vocabularyCount: lesson.vocabularies?.length ?? lesson._count?.vocabularies ?? 0, vocabularyReviewComplete: done(byLesson.get(lesson.id)) && lesson.vocabularies?.length > 0 && lesson.vocabularies.every((link: any) => { const record: any = byLesson.get(lesson.id); const completedAt = record?.completedAt ?? record?.updatedAt; const reviewedAt = link.vocabulary.vocabProgress[0]?.lastReviewAt; return completedAt && reviewedAt && new Date(reviewedAt).getTime() >= new Date(completedAt).getTime() }) }))
      const completedLessons = lessonItems.filter((lesson: any) => lesson.completed).length
      const lessonsComplete = available && completedLessons === rows.length
      const domainExams = exams.filter((exam: any) => exam.domainId === link.domainId)
      // Prefer an explicit domain test; otherwise use the newest published practice.
      const exam = domainExams.find((exam: any) => exam.kind === 'domain_test') ?? domainExams[0]
      const times = rows.map((lesson: any) => {
        const record: any = byLesson.get(lesson.id)
        return record?.completedAt ?? record?.updatedAt
      })
      const completedAt = lessonsComplete && times.every(Boolean) ? Math.max(...times.map((time: any) => new Date(time).getTime())) : null
      // An old four-word quiz result, or a quiz taken before finishing the course,
      // cannot certify the new course. Use the latest graded attempt after learning.
      const attempt = exam && completedAt !== null ? attempts.find((attempt: any) => attempt.examId === exam.id && attempt.submittedAt && new Date(attempt.submittedAt).getTime() >= completedAt) : null
      const passed = lessonsComplete && attempt?.passed === true
      return {
        id: link.domainId, code: link.domain.code, name: link.domain.name, available,
        careerReason: focus.reason(link.domain.code),
        lessons: lessonItems, completedLessons, totalLessons: rows.length,
        state: !lessonsComplete ? 'in_progress' : passed ? 'complete' : attempt ? 'review_needed' : 'assessment_due',
        nextLesson: lessonItems.find((lesson: any) => !lesson.completed) ?? null,
        assessment: exam ? { id: exam.id, title: exam.title, href: `/learn/quiz/${exam.id}`, passingScorePercent: exam.passingScorePercent, passed, scorePercent: attempt?.scorePercent ?? null, attemptId: attempt?.id ?? null } : null,
      }
    })
    const allCompleted = domains.length > 0 && domains.every((domain: any) => domain.state === 'complete')
    const currentIndex = levels.findIndex((level: any) => level.id === profile.levelId)
    const next = currentIndex >= 0 ? levels[currentIndex + 1] : undefined
    const nextLessons = next ? await db.lesson.findMany({ where: { status: 'published', type: { not: 'certification_review' }, levelId: next.id, domainId: { in: domainIds } }, select: { domainId: true, slug: true } }) : []
    const nextAvailable = !!next && selected.every((link: any) => nextLessons.some((lesson: any) => lesson.domainId === link.domainId))
    return {
      configured: true as const, level: { id: profile.level.id, code: profile.level.code, name: profile.level.name }, domains,
      completedLessons: domains.reduce((total: number, domain: any) => total + domain.completedLessons, 0),
      totalLessons: domains.reduce((total: number, domain: any) => total + domain.totalLessons, 0),
      allCompleted, canAdvance: allCompleted && nextAvailable,
      nextLevel: nextAvailable ? next : null,
      finalLevel: currentIndex >= 0 && currentIndex === levels.length - 1,
      dailyMinutes: profile.dailyStudyTargetMinutes ?? 30,
    }
  }

  async advance(learnerId: string, fromLevelCode: unknown) {
    if (typeof fromLevelCode !== 'string' || !fromLevelCode.trim()) throw new BadRequestException('Trình độ cần chuyển không hợp lệ.')
    try {
      return await this.prisma.$transaction(async tx => {
        const path = await this.getPath(learnerId, tx)
        if (!path.configured || path.level.code !== fromLevelCode) throw new ConflictException('Trình độ đã thay đổi. Hãy tải lại lộ trình.')
        if (!path.canAdvance || !path.nextLevel) throw new BadRequestException('Cần hoàn thành các bài và đạt bài luyện tập tổng kết của mọi ngành đã chọn trước khi chuyển cấp.')
        const result = await tx.learnerProfile.updateMany({ where: { userId: learnerId, levelId: path.level.id }, data: { levelId: path.nextLevel.id } })
        if (result.count !== 1) throw new ConflictException('Trình độ đã thay đổi. Hãy tải lại lộ trình.')
        return this.getPath(learnerId, tx)
      }, { isolationLevel: 'Serializable' })
    } catch (error) {
      if ((error as any)?.code === 'P2034') throw new ConflictException('Lộ trình vừa thay đổi. Hãy tải lại trước khi chuyển cấp.')
      throw error
    }
  }
}
