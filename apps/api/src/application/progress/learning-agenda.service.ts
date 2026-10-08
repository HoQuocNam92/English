import { ApivnLearningPlanner } from '../../infrastructure/ai/apivn-learning-planner'
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

export function vietnamPeriods(now = new Date()) {
  const local = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const year = local.getUTCFullYear(), month = local.getUTCMonth(), day = local.getUTCDate()
  const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d) - 7 * 60 * 60 * 1000)
  return { today: utc(year, month, day), tomorrow: utc(year, month, day + 1), month: utc(year, month, 1), nextMonth: utc(year, month + 1, 1), year: utc(year, 0, 1), nextYear: utc(year + 1, 0, 1), daysInMonth: new Date(Date.UTC(year, month + 1, 0)).getUTCDate(), daysInYear: (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000, label: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` }
}
type Task = { id: string; title: string; reason: string; href: string; action: string; status: 'todo' | 'done'; kind: 'lesson' | 'review' | 'vocabulary' | 'quiz'; minutes?: number; completedLessons?: { id: string; title: string; href: string }[] }

@Injectable()
export class LearningAgendaService {
  constructor(private readonly prisma: PrismaService, private readonly ai?: ApivnLearningPlanner) {}
  async getAgenda(learnerId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: learnerId, status: 'active', userRoles: { some: { role: { code: 'learner', isActive: true } } } }, select: { id: true } })
    if (!user) throw new ForbiddenException('Chỉ học viên mới có kế hoạch học tập.')
    const profile = await this.prisma.learnerProfile.findUnique({ where: { userId: learnerId }, include: { level: true, domains: { include: { domain: true } }, certGoals: { include: { certificate: true } } } })
    if (!profile) throw new BadRequestException('Chưa có hồ sơ học tập.')
    if (!profile.onboardingCompleted || (!profile.domains.length && !profile.certGoals.length)) return { configured: false }
    const now = new Date(), period = vietnamPeriods(now)
    const goal = profile.learningGoal ?? (profile.certGoals.length ? 'certification' : 'vocabulary')
    const hasVocab = goal !== 'certification', hasCert = goal !== 'vocabulary'
    const domainIds = profile.domains.map(d => d.domainId), certIds = profile.certGoals.filter(c => c.certificate.isActive).map(c => c.certificateId)
    const lessonWhere: any = { status: 'published', domain: { isActive: true }, ...(goal === 'certification' ? { type: 'certification_review', certificates: { some: { certificateId: { in: certIds } } } } : { ...(domainIds.length ? { domainId: { in: domainIds } } : {}), ...(hasCert ? {} : { type: { not: 'certification_review' } }) }) }
    const vocabWhere: any = { learnerId, vocabulary: { status: 'published', ...(domainIds.length ? { OR: [{ domainId: { in: domainIds } }, { domains: { some: { domainId: { in: domainIds } } } }] } : {}) }, lastRating: { not: null } }
    const [lessons, progress, attempts, vocab, attemptCounts, vocabularyCount, availableQuizzes] = await Promise.all([
      this.prisma.lesson.findMany({ where: lessonWhere, include: { level: true, domain: true, certificationTopics: { include: { topic: { include: { certificateDomain: true } } } } }, orderBy: [{ level: { order: 'asc' } }, { createdAt: 'asc' }] }),
      this.prisma.learningProgress.findMany({ where: { learnerId, resourceType: 'lesson' } }),
      hasCert ? this.prisma.examAttempt.findMany({ where: { learnerId, status: { in: ['graded', 'submitted'] }, exam: { certificateId: { in: certIds } } }, select: { examId: true, passed: true, scorePercent: true, submittedAt: true, startedAt: true, exam: { select: { id: true, title: true, certificateId: true, topics: true } } }, orderBy: { submittedAt: 'desc' }, take: 200 }) : [],
      hasVocab ? this.prisma.vocabularyProgress.findMany({ where: vocabWhere, select: { vocabularyId: true, createdAt: true, lastReviewAt: true, nextReviewAt: true, status: true } }) : [],
      hasCert ? Promise.all([[period.month, period.nextMonth], [period.year, period.nextYear]].map(([start, end]) => this.prisma.examAttempt.count({ where: { learnerId, status: { in: ['graded', 'submitted'] }, exam: { certificateId: { in: certIds } }, submittedAt: { gte: start, lt: end } } }))) : [0, 0],
      hasVocab ? this.prisma.vocabulary.count({ where: vocabWhere.vocabulary }) : 0,
      hasCert ? this.prisma.exam.findMany({ where: { certificateId: { in: certIds }, status: 'published', kind: 'practice', questions: { some: {} } }, select: { certificateId: true, topics: true } }) : [],
    ])
    const byLesson = new Map(progress.map(p => [p.resourceId, p]))
    const completed = (id: string) => { const p = byLesson.get(id); return p?.status === 'completed' || (p?.completionPercent ?? 0) >= 100 }
    const during = (d: Date | null | undefined, start: Date, end: Date) => !!d && d >= start && d < end
    const doneIn = (start: Date, end: Date) => lessons.filter(l => completed(l.id) && during(byLesson.get(l.id)?.completedAt, start, end)).length
    const examsIn = (start: Date, _end: Date) => start === period.month ? attemptCounts[0] : attemptCounts[1]
    const wordsIn = (start: Date, end: Date) => vocab.filter(v => during(v.createdAt, start, end)).length
    const latestByExam = new Map<string, typeof attempts[number]>()
    for (const a of attempts) if (!latestByExam.has(a.examId)) latestByExam.set(a.examId, a)
    const weak = [...latestByExam.values()].filter(a => a.scorePercent !== null && a.scorePercent < 70)
    const topicMatch = (lesson: typeof lessons[number], attempt: typeof attempts[number]) => lesson.certificationTopics.some(link => link.topic.certificateId === attempt.exam.certificateId && attempt.exam.topics.includes(link.topic.code))
    const ordered = [...lessons].sort((a, b) => {
      const score = (l: typeof lessons[number]) => (byLesson.get(l.id)?.status === 'in_progress' ? 1000 : 0) + (weak.some(w => topicMatch(l, w)) ? 100 : 0) - Math.abs(l.level.order - profile.level.order) * 10 - (l.certificationTopics[0]?.topic.certificateDomain?.order ?? 0) - (l.certificationTopics[0]?.topic.order ?? 0) / 10
      return score(b) - score(a)
    })
    const linkFor = (l: typeof lessons[number]) => { const topic = l.certificationTopics.find(t => certIds.includes(t.topic.certificateId))?.topic; return topic ? `/learn/certifications/${topic.certificateId}/topics/${topic.id}?lessonId=${encodeURIComponent(l.id)}` : `/learn/lessons/${l.id}` }
    const tasks: Task[] = []
    const completedToday = lessons.filter(l => completed(l.id) && during(byLesson.get(l.id)?.completedAt, period.today, period.tomorrow))
    const next = ordered.find(l => !completed(l.id))
    const review = weak.flatMap(a => { const l = ordered.find(l => completed(l.id) && topicMatch(l, a)); return l ? [{ l, a }] : [] })[0]
    if (review) tasks.push({ id: `review-${review.l.id}`, title: `Ôn lại: ${review.l.title}`, reason: `Quiz gần nhất của phần này đạt ${Math.round(review.a.scorePercent!)}%. Ôn giải thích rồi luyện lại khi sẵn sàng.`, href: linkFor(review.l), action: 'Ôn kiến thức', kind: 'review', status: 'todo', minutes: review.l.estimatedMinutes })
    const typicalMinutes = lessons.length ? Math.max(5, Math.round(lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0) / lessons.length)) : 15
    const lessonTargetToday = Math.min(lessons.length, Math.max(1, Math.floor(profile.dailyStudyTargetMinutes / typicalMinutes)))
    if (completedToday.length) tasks.push({ id: 'lesson-today-done', title: `Đã hoàn thành ${completedToday.length} bài hôm nay`, reason: 'Tiến độ đã được ghi nhận. Bạn có thể nghỉ hoặc học thêm khi có thời gian.', href: linkFor(completedToday[0]), action: 'Xem lại bài', kind: 'lesson', status: 'done', completedLessons: completedToday.map(l => ({ id: l.id, title: l.title, href: linkFor(l) })) })
    if (next && completedToday.length < lessonTargetToday) tasks.push({ id: next.id, title: next.title, reason: byLesson.get(next.id)?.status === 'in_progress' ? 'Tiếp tục bài đang học dở trước khi bắt đầu bài mới.' : weak.some(w => topicMatch(next, w)) ? 'Ưu tiên chủ đề cần củng cố theo kết quả Quiz.' : 'Bài tiếp theo phù hợp với trình độ và mục tiêu đã chọn.', href: linkFor(next), action: byLesson.get(next.id)?.status === 'in_progress' ? 'Học tiếp' : 'Bắt đầu học', kind: 'lesson', status: 'todo', minutes: next.estimatedMinutes })
    if (hasVocab) {
      const due = vocab.filter(v => v.status !== 'mastered' && v.nextReviewAt && v.nextReviewAt <= now).length
      if (due) tasks.push({ id: 'review-words', title: `Ôn ${due} từ đến lịch`, reason: 'Củng cố các từ đã học theo lịch ôn tập.', href: '/learn/flashcards/review/practice', action: 'Ôn từ', kind: 'review', status: 'todo' })
      const count = wordsIn(period.today, period.tomorrow), target = Math.min(profile.dailyVocabularyTarget, Math.max(0, vocabularyCount - vocab.length + count))
      tasks.push({ id: 'new-words', title: target === 0 ? 'Đã học hết từ mới trong lĩnh vực đã chọn' : count >= target ? `Đã đạt mục tiêu ${target} từ hôm nay` : `Học thêm ${Math.max(0, target - count)} từ mới`, reason: `${count}/${target} từ đã học hôm nay trong lĩnh vực đã chọn.`, href: '/learn/flashcards', action: count >= target ? 'Xem từ vựng' : 'Học từ mới', kind: 'vocabulary', status: count >= target ? 'done' : 'todo' })
    }
    const readyTopics = new Map<string, typeof lessons[number]['certificationTopics'][number]['topic']>()
    for (const l of lessons) for (const link of l.certificationTopics) if (certIds.includes(link.topic.certificateId)) readyTopics.set(link.topic.id, link.topic)
    const ready = [...readyTopics.values()].find(t => { const group = lessons.filter(l => l.certificationTopics.some(link => link.topicId === t.id)); return availableQuizzes.some(q => q.certificateId === t.certificateId && q.topics.includes(t.code)) && group.length > 0 && group.every(l => completed(l.id)) && !attempts.some(a => a.passed && a.exam.certificateId === t.certificateId && a.exam.topics.includes(t.code)) })
    if (ready && !review) tasks.push({ id: `quiz-${ready.id}`, title: `Kiểm tra chủ đề: ${ready.name}`, reason: 'Bạn đã hoàn thành kiến thức chủ đề; có thể làm Quiz để kiểm tra mức hiểu.', href: `/learn/certifications/${ready.certificateId}/topics/${ready.id}`, action: 'Vào Quiz', kind: 'quiz', status: 'todo' })
    const plannedLessons = Math.max(1, Math.floor(profile.dailyStudyTargetMinutes / Math.max(10, typicalMinutes)))
    const allCompleted = lessons.filter(l => completed(l.id)).length
    const metrics = (start: Date, end: Date, days: number) => [
      ...(lessons.length ? [{ label: 'Bài học', current: doneIn(start, end), target: Math.min(lessons.length - allCompleted + doneIn(start, end), days * plannedLessons), unit: 'bài' }] : []),
      ...(hasVocab ? [{ label: 'Từ mới', current: wordsIn(start, end), target: Math.min(vocabularyCount - vocab.length + wordsIn(start, end), days * profile.dailyVocabularyTarget), unit: 'từ' }] : []),
      ...(hasCert ? [{ label: 'Quiz', current: examsIn(start, end), target: Math.max(1, Math.ceil(days / 7 * profile.weeklyExamTarget)), unit: 'lượt' }] : []),
    ]
    const latest = await this.prisma.placementAssessment.findFirst({ where: { learnerId, submittedAt: { not: null } }, orderBy: { submittedAt: 'desc' }, select: { submittedAt: true, result: true } })
    const goodScores = attempts.filter(a => a.scorePercent !== null).slice(0, 5)
    const retestSuggested = goodScores.length >= 3 && goodScores.every(a => a.scorePercent! >= 80) && profile.level.code !== 'advanced' && profile.level.code !== 'professional'
    const baseline = { configured: true, calculatedAt: now, date: period.label, source: 'rules', level: { code: profile.level.code, name: profile.level.name }, dailyMinutes: profile.dailyStudyTargetMinutes, goal, tasks, month: { label: `Tháng ${period.label.slice(5, 7)}/${period.label.slice(0, 4)}`, metrics: metrics(period.month, period.nextMonth, period.daysInMonth), focus: review?.l.title ?? next?.title ?? (hasVocab ? 'Duy trì học và ôn từ vựng theo lĩnh vực' : 'Củng cố kiến thức trước khi luyện đề') }, year: { label: `Năm ${period.label.slice(0, 4)}`, metrics: metrics(period.year, period.nextYear, period.daysInYear), certificates: hasCert ? profile.certGoals.filter(c => c.certificate.isActive).map(c => ({ name: c.certificate.name, href: `/learn/certifications/${c.certificateId}` })) : [] }, totalLessons: lessons.length, completedLessons: allCompleted, retestSuggested, lastAssessmentAt: latest?.submittedAt ?? null, explanation: 'Kế hoạch cập nhật theo bài đang học, bài đã hoàn thành, điểm Quiz và lịch ôn. Trình độ chỉ thay đổi sau kiểm tra lại hoặc khi bạn chỉnh hồ sơ.' }
    return this.ai ? this.ai.agenda(baseline) : baseline
  }
}
