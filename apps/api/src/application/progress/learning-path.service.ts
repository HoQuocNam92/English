import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'professional']
const PREFIX = 'focused-20261024-'
const lessonOrder = (slug: string) => ['terminology', 'reading', 'documentation', 'case'].findIndex(type => slug.endsWith(`-${type}`))
const done = (record: any) => record?.status === 'completed' || record?.completionPercent >= 100

@Injectable()
export class LearningPathService {
  constructor(private readonly prisma: PrismaService) {}

  async getPath(learnerId: string, db: any = this.prisma) {
    const user = await db.user.findFirst({ where: { id: learnerId, status: 'active', userRoles: { some: { role: { code: 'learner', isActive: true } } } }, select: { id: true } })
    if (!user) throw new ForbiddenException('Chỉ học viên mới có lộ trình học tập.')
    const profile = await db.learnerProfile.findUnique({ where: { userId: learnerId }, include: { level: true, domains: { include: { domain: true } } } })
    if (!profile?.onboardingCompleted || profile.learningGoal === 'certification' || !LEVELS.includes(profile.level.code)) return { configured: false as const }
    const selected = profile.domains.filter((link: any) => link.domain.isActive)
    if (!selected.length) return { configured: false as const }
    const domainIds = selected.map((link: any) => link.domainId)
    const [lessons, progress, exams, attempts, levels] = await Promise.all([
      db.lesson.findMany({ where: { status: 'published', slug: { startsWith: PREFIX }, domainId: { in: domainIds }, levelId: profile.levelId }, select: { id: true, title: true, slug: true, domainId: true, estimatedMinutes: true } }),
      db.learningProgress.findMany({ where: { learnerId, resourceType: 'lesson' }, select: { resourceId: true, status: true, completionPercent: true, completedAt: true, updatedAt: true } }),
      db.exam.findMany({ where: { status: 'published', kind: 'practice', certificateId: null, domainId: { in: domainIds }, levelId: profile.levelId, questions: { some: {} } }, select: { id: true, title: true, domainId: true, topics: true, passingScorePercent: true } }),
      db.examAttempt.findMany({ where: { learnerId, status: 'graded', exam: { domainId: { in: domainIds }, levelId: profile.levelId, certificateId: null } }, select: { id: true, examId: true, passed: true, scorePercent: true, submittedAt: true }, orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }] }),
      db.level.findMany({ where: { isActive: true, code: { in: LEVELS } }, select: { id: true, code: true, name: true } }),
    ])
    const byLesson = new Map(progress.map((record: any) => [record.resourceId, record]))
    const domains = selected.map((link: any) => {
      const rows = lessons.filter((lesson: any) => lesson.domainId === link.domainId).sort((a: any, b: any) => lessonOrder(a.slug) - lessonOrder(b.slug))
      // Missing data must never produce a completed course or unlock promotion.
      const available = rows.length === 4 && new Set(rows.map((row: any) => lessonOrder(row.slug))).size === 4 && rows.every((row: any) => lessonOrder(row.slug) >= 0)
      const lessonItems = rows.map((lesson: any) => ({ id: lesson.id, title: lesson.title, href: `/learn/lessons/${lesson.id}`, week: lessonOrder(lesson.slug) + 1, completed: done(byLesson.get(lesson.id)), estimatedMinutes: lesson.estimatedMinutes }))
      const completedLessons = lessonItems.filter((lesson: any) => lesson.completed).length
      const lessonsComplete = available && completedLessons === rows.length
      const exam = exams.find((exam: any) => exam.domainId === link.domainId && exam.topics.includes(`coverage-20261009-${link.domain.code.toLowerCase()}-${profile.level.code}`))
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
        lessons: lessonItems, completedLessons, totalLessons: rows.length,
        state: !lessonsComplete ? 'in_progress' : passed ? 'complete' : attempt ? 'review_needed' : 'assessment_due',
        nextLesson: lessonItems.find((lesson: any) => !lesson.completed) ?? null,
        assessment: exam ? { id: exam.id, title: exam.title, href: `/learn/quiz/${exam.id}`, passingScorePercent: exam.passingScorePercent, passed, scorePercent: attempt?.scorePercent ?? null, attemptId: attempt?.id ?? null } : null,
      }
    })
    const allCompleted = domains.length > 0 && domains.every((domain: any) => domain.state === 'complete')
    const nextCode = LEVELS[LEVELS.indexOf(profile.level.code) + 1]
    const next = levels.find((level: any) => level.code === nextCode)
    const nextLessons = next ? await db.lesson.findMany({ where: { status: 'published', slug: { startsWith: PREFIX }, levelId: next.id, domainId: { in: domainIds } }, select: { domainId: true, slug: true } }) : []
    const nextAvailable = !!next && domainIds.every((id: string) => new Set(nextLessons.filter((lesson: any) => lesson.domainId === id).map((lesson: any) => lessonOrder(lesson.slug)).filter((order: number) => order >= 0)).size === 4)
    return {
      configured: true as const, level: { id: profile.level.id, code: profile.level.code, name: profile.level.name }, domains,
      completedLessons: domains.reduce((total: number, domain: any) => total + domain.completedLessons, 0),
      totalLessons: domains.reduce((total: number, domain: any) => total + domain.totalLessons, 0),
      allCompleted, canAdvance: allCompleted && nextAvailable,
      nextLevel: nextAvailable ? next : null,
      finalLevel: profile.level.code === 'professional',
      dailyMinutes: profile.dailyStudyTargetMinutes ?? 30,
    }
  }

  async advance(learnerId: string, fromLevelCode: unknown) {
    if (typeof fromLevelCode !== 'string' || !LEVELS.includes(fromLevelCode)) throw new BadRequestException('Trình độ cần chuyển không hợp lệ.')
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
