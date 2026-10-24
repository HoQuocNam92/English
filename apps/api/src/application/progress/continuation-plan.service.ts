import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import type { ActiveContinuation, ContinuationOptions, ContinuationPlan, ContinuationStep } from '../../../../../packages/contracts/src/continuation'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { LearningPathService } from './learning-path.service'

const KIND = 'continuation-v1'
const schedule = (steps: Omit<ContinuationStep, 'day'>[], days: number): ContinuationStep[] => steps.map((step, index) => ({ ...step, day: steps.length === 1 ? 1 : 1 + Math.floor(index * (days - 1) / (steps.length - 1)) }))
const contextKey = (path: any) => `${path.level.code}:${path.domains.map((domain: any) => domain.id).sort().join(',')}`

/** Generates only links to existing published content. No curriculum or score is invented. */
export function buildContinuationPlans(path: any, vocabulary: any[], lessons: any[], topics: any[], exams: any[], now = new Date()): ContinuationPlan[] {
  if (!path.domains?.length) return []
  const minutes = Math.min(60, Math.max(10, path.dailyMinutes ?? 30))
  const due = vocabulary.filter(word => word.nextReviewAt && new Date(word.nextReviewAt) <= now)
  const weak = vocabulary.filter(word => word.lastRating === 'hard' || word.wrongCount > word.correctCount).sort((a, b) => b.wrongCount - a.wrongCount)
  const domains = [...path.domains].sort((a: any, b: any) => (a.assessment?.scorePercent ?? 100) - (b.assessment?.scorePercent ?? 100) || a.code.localeCompare(b.code))
  const reviewSteps = Array.from({ length: 7 }, (_, index) => {
    const domain = domains[index % domains.length]
    const domainWeak = weak.filter(word => word.vocabulary.domainId === domain.id || word.vocabulary.domains?.some((link: any) => link.domainId === domain.id))
    return { id: `review-${index + 1}`, title: `${domain.name} · Ôn từ và cách dùng`, description: domainWeak.length ? `Chú ý các từ còn yếu: ${domainWeak.slice(0, 4).map(word => word.vocabulary.term).join(', ')}. Ôn theo lịch flashcards hiện có.` : 'Ôn flashcards theo lịch đến hạn, đọc câu ví dụ và đối chiếu cách dùng. Nếu chưa đến hạn, có thể học thêm từ hoặc quay lại vào buổi gợi ý.', href: `/learn/flashcards/all/practice?domainCode=${encodeURIComponent(domain.code)}`, minutes, kind: 'vocabulary' as const }
  })
  const plans: ContinuationPlan[] = [{ id: 'review', kind: 'review', title: 'Ôn tập duy trì · 14 ngày', objective: 'Giữ vốn từ và củng cố cách dùng sau khi hoàn thành cấp cuối.', reason: vocabulary.length ? `Trong các từ đã theo dõi có ${due.length} từ đến hạn và ${weak.length} từ cần củng cố.` : 'Bạn đã hoàn thành bài học; bắt đầu ghi nhận việc học và ôn từ bằng flashcards.', durationDays: 14, dailyMinutes: minutes, steps: schedule(reviewSteps, 14) }]
  const applications = [...lessons].sort((a: any, b: any) => Number(a.completed) - Number(b.completed) || a.title.localeCompare(b.title)).slice(0, 6)
  if (applications.length) plans.push({ id: 'application', kind: 'application', title: 'Vận dụng công việc · 14 ngày', objective: 'Đọc tài liệu và giải thích quyết định kỹ thuật bằng tiếng Anh theo ngành đã học.', reason: applications.some(lesson => !lesson.completed) ? 'Ưu tiên bài tình huống và tài liệu bạn chưa học, sau đó luyện lại phần đã hoàn thành.' : 'Các bài đã học được dùng lại để luyện diễn giải và vận dụng; đây là lịch thực hành lại.', durationDays: 14, dailyMinutes: minutes, steps: schedule(applications.map(lesson => ({ id: `apply-${lesson.id}`, title: `${lesson.completed ? 'Ôn và vận dụng' : 'Thực hành'} · ${lesson.title}`, description: 'Đọc phần tiếng Anh, tự tóm tắt vấn đề và quyết định, rồi đối chiếu phần giải thích. Ghi nhận buổi học sau khi thực hiện; không chỉ mở liên kết.', href: `/learn/lessons/${lesson.id}`, minutes: lesson.estimatedMinutes, kind: 'lesson' })), 14) })
  const certificates = new Map<string, any>()
  const selectedDomains = new Set(path.domains.map((domain: any) => domain.id))
  for (const topic of topics) {
    const certificate = topic.certificateDomain.certificate
    if (!certificate.isActive || !topic.lessons.some(({ lesson }: any) => selectedDomains.has(lesson.domainId))) continue
    const otherCodes = new Set(topics.filter(other => other.certificateDomain.certificate.id === certificate.id && other.id !== topic.id).map(other => other.code))
    const practice = exams.find(exam => exam.certificateId === certificate.id && exam.topics.includes(topic.code) && !exam.topics.some((code: string) => otherCodes.has(code)))
    if (!practice) continue
    const entry = certificates.get(certificate.id) ?? { certificate, topics: [] }
    entry.topics.push({ topic, practice }); certificates.set(certificate.id, entry)
  }
  for (const { certificate, topics: ready } of [...certificates.values()].slice(0, 3)) {
    const steps: Omit<ContinuationStep, 'day'>[] = []
    // Include every published prerequisite of each chosen topic before its practice.
    for (const { topic, practice } of ready.slice(0, 4)) {
      for (const { lesson } of topic.lessons) steps.push({ id: `cert-${topic.id}-${lesson.id}`, title: `${topic.name} · ${lesson.title}`, description: 'Học kiến thức và thuật ngữ của chủ đề trước bài luyện tập. Nếu cần nhiều thời gian, chia bài thành nhiều buổi.', href: `/learn/certifications/${certificate.id}/topics/${topic.id}?lessonId=${encodeURIComponent(lesson.id)}`, minutes: lesson.estimatedMinutes, kind: 'lesson' })
      steps.push({ id: `practice-${topic.id}-${practice.id}`, title: `Luyện tập · ${topic.name}`, description: 'Làm sau khi hoàn thành các bài kiến thức của chủ đề. Xem giải thích và ôn phần sai trước khi làm lại.', href: `/learn/certifications/${certificate.id}/topics/${topic.id}`, minutes: practice.durationMinutes, kind: 'practice' })
    }
    const durationDays = Math.min(28, Math.max(7, steps.length * 2))
    plans.push({ id: `certificate-${certificate.id}`, kind: 'certificate', title: `${certificate.name} · Khởi đầu ${durationDays} ngày`, objective: 'Bắt đầu học các chủ đề có sẵn và luyện tập theo chứng chỉ; lịch này không cam kết đủ toàn bộ chương trình thi.', reason: `Có ${ready.length} chủ đề với bài học và bài luyện tập đã xuất bản phù hợp ngành của bạn.`, durationDays, dailyMinutes: minutes, steps: schedule(steps, durationDays) })
  }
  return plans
}

@Injectable()
export class ContinuationPlanService {
  constructor(private readonly prisma: PrismaService, private readonly learningPath: LearningPathService) {}

  private async current(learnerId: string, db: any) {
    return db.placementAssessment.findFirst({ where: { learnerId, submittedAt: null, result: { path: ['kind'], equals: KIND } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
  }

  async getOptions(learnerId: string, db: any = this.prisma): Promise<ContinuationOptions> {
    const path = await this.learningPath.getPath(learnerId, db)
    if (!path.configured || !path.allCompleted || !path.finalLevel) return { eligible: false, plans: [], active: null }
    const domainIds = path.domains.map(domain => domain.id)
    const [vocabulary, lessons, topics, exams, record] = await Promise.all([
      db.vocabularyProgress.findMany({ where: { learnerId, lastRating: { not: null }, vocabulary: { status: 'published', OR: [{ domainId: { in: domainIds } }, { domains: { some: { domainId: { in: domainIds } } } }] } }, select: { nextReviewAt: true, wrongCount: true, correctCount: true, lastRating: true, vocabulary: { select: { term: true, domainId: true, domains: { select: { domainId: true } } } } } }),
      db.lesson.findMany({ where: { status: 'published', domainId: { in: domainIds }, level: { code: { in: ['advanced', 'professional'] } }, type: { in: ['technical_reading', 'api_documentation', 'system_design', 'case_study'] } }, select: { id: true, title: true, estimatedMinutes: true }, orderBy: { title: 'asc' } }),
      db.certificationTopic.findMany({ where: { certificateDomain: { certificate: { isActive: true } } }, include: { certificateDomain: { include: { certificate: true } }, lessons: { where: { lesson: { status: 'published', type: 'certification_review' } }, select: { lesson: { select: { id: true, title: true, estimatedMinutes: true, domainId: true } } } } }, orderBy: [{ certificateId: 'asc' }, { order: 'asc' }] }),
      db.exam.findMany({ where: { certificateId: { not: null }, status: 'published', kind: 'practice', questions: { some: {} } }, select: { id: true, certificateId: true, topics: true, durationMinutes: true } }),
      this.current(learnerId, db),
    ])
    const progress = await db.learningProgress.findMany({ where: { learnerId, resourceType: 'lesson', resourceId: { in: lessons.map((lesson: any) => lesson.id) } }, select: { resourceId: true, status: true, completionPercent: true } })
    const completed = new Set(progress.filter((p: any) => p.status === 'completed' || p.completionPercent >= 100).map((p: any) => p.resourceId))
    const plans = buildContinuationPlans(path, vocabulary, lessons.map((lesson: any) => ({ ...lesson, completed: completed.has(lesson.id) })), topics, exams)
    const value = record?.result as any
    const active: ActiveContinuation | null = value?.context === contextKey(path) && value?.plan?.steps?.length && plans.some(plan => plan.id === value.plan.id) ? { recordId: record.id, startedAt: value.startedAt, completedStepIds: value.completedStepIds ?? [], plan: value.plan } : null
    return { eligible: true, plans, active, certificateMessage: plans.some(plan => plan.kind === 'certificate') ? undefined : 'Chưa có đủ bài kiến thức và bài luyện tập chứng chỉ phù hợp ngành đã chọn. Bạn có thể chọn hướng ôn tập hoặc vận dụng trước.' }
  }

  async choose(learnerId: string, planId: unknown) {
    if (typeof planId !== 'string' || planId.length > 100) throw new BadRequestException('Lộ trình không hợp lệ.')
    return this.write(async db => {
      const options = await this.getOptions(learnerId, db)
      if (!options.eligible) throw new BadRequestException('Cần hoàn thành cấp Chuyên nghiệp trước khi chọn lộ trình tiếp nối.')
      const plan = options.plans.find(plan => plan.id === planId)
      if (!plan?.steps.length) throw new BadRequestException('Lộ trình không còn khả dụng. Hãy tải lại gợi ý.')
      if (options.active?.plan.id === planId && options.active.completedStepIds.length < options.active.plan.steps.length) return options
      const path = await this.learningPath.getPath(learnerId, db)
      const startedAt = new Date().toISOString()
      const record = await db.placementAssessment.create({ data: {
        learnerId, questions: [], expiresAt: new Date(), submittedAt: null,
        result: { kind: KIND, context: contextKey(path), startedAt, plan, completedStepIds: [] },
      } })
      return { ...options, active: { recordId: record.id, startedAt, plan, completedStepIds: [] } }
    })
  }

  async completeStep(learnerId: string, recordId: unknown, stepId: unknown) {
    if (typeof recordId !== 'string' || typeof stepId !== 'string') throw new BadRequestException('Buổi học không hợp lệ.')
    return this.write(async db => {
      const path = await this.learningPath.getPath(learnerId, db)
      if (!path.configured || !path.allCompleted || !path.finalLevel) throw new BadRequestException('Lộ trình tiếp nối không còn phù hợp với trạng thái học hiện tại.')
      const record = await this.current(learnerId, db)
      const value = record?.result as any
      if (record?.id !== recordId || value?.context !== contextKey(path)) throw new ConflictException('Bạn đã đổi lộ trình. Hãy tải lại trước khi ghi nhận buổi học.')
      if (!value.plan.steps.some((step: ContinuationStep) => step.id === stepId)) throw new BadRequestException('Buổi học không thuộc lộ trình đã chọn.')
      const completedStepIds = [...new Set<string>([...(value.completedStepIds ?? []), stepId])]
      await db.placementAssessment.update({ where: { id: record.id }, data: { result: { ...value, completedStepIds } } })
      return { recordId: record.id, startedAt: value.startedAt, plan: value.plan, completedStepIds } as ActiveContinuation
    })
  }

  private async write<T>(action: (db: any) => Promise<T>): Promise<T> {
    try { return await this.prisma.$transaction(action, { isolationLevel: 'Serializable', timeout: 20000 }) }
    catch (error) { if ((error as any)?.code === 'P2034') throw new ConflictException('Tiến độ vừa thay đổi. Hãy tải lại.'); throw error }
  }
}
