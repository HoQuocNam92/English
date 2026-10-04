import { ApivnLearningPlanner } from '../../infrastructure/ai/apivn-learning-planner'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { randomInt } from 'node:crypto'
import { PrismaService } from '../../infrastructure/database/prisma.service'

type Answer = { questionId: string; optionId: string }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LEVELS = ['beginner', 'intermediate', 'advanced']
export function balancedQuestions(pool: any[], limit = 15) {
  const groups = new Map<string, any[]>()
  for (const q of pool) {
    if (q.options.filter((o: any) => o.isCorrect).length !== 1 || q.options.length < 2) continue
    const key = `${q.level.code}:${q.domain.code}`
    groups.set(key, [...(groups.get(key) ?? []), q])
  }
  for (const group of groups.values()) for (let i = group.length - 1; i > 0; i--) { const j = randomInt(i + 1); [group[i], group[j]] = [group[j], group[i]] }
  const domains = [...new Set(pool.map(q => q.domain.code))].sort()
  const selected: any[] = []
  let round = 0
  while (selected.length < limit) {
    let added = false
    for (let d = 0; d < domains.length && selected.length < limit; d++) {
      const levels = LEVELS.map((_, offset) => LEVELS[(round + d + offset) % LEVELS.length])
      for (const level of levels) {
        const q = groups.get(`${level}:${domains[d]}`)?.pop()
        if (q) { selected.push(q); added = true; break }
      }
    }
    round++
    if (!added) break
  }
  return selected
}

@Injectable()
export class PlacementService {
  constructor(private readonly prisma: PrismaService, private readonly ai?: ApivnLearningPlanner) {}
  private profile(learnerId: string) {
    return this.prisma.learnerProfile.findUnique({ where: { userId: learnerId }, include: { level: true, domains: { include: { domain: true } }, certGoals: { include: { certificate: true } } } })
  }
  async start(learnerId: string) {
    const profile = await this.profile(learnerId)
    const domainIds = profile?.domains.map(d => d.domainId) ?? []
    const pool = await this.prisma.question.findMany({ where: { status: 'published', type: { in: ['single_choice', 'multiple_choice'] }, topics: { has: 'placement' }, domain: { isActive: true }, level: { isActive: true, code: { in: LEVELS } }, ...(domainIds.length ? { domainId: { in: domainIds } } : {}) }, include: { options: { orderBy: { order: 'asc' } }, level: true, domain: true } })
    const chosen = balancedQuestions(pool)
    if (chosen.length < 10) throw new BadRequestException('Chưa đủ 10 câu kiểm tra cho lĩnh vực đã chọn. Hãy bổ sung câu hỏi placement trong trang quản trị.')
    const snapshot = chosen.map(q => ({ id: q.id, prompt: q.prompt, context: q.context, explanation: q.explanation, level: { code: q.level.code, name: q.level.name }, domain: { code: q.domain.code, name: q.domain.name }, options: q.options.map((o: any) => ({ id: o.id, key: o.key, text: o.text, isCorrect: o.isCorrect })) }))
    const session = await this.prisma.placementAssessment.create({ data: { learnerId, questions: snapshot, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) } })
    return { assessmentId: session.id, expiresAt: session.expiresAt, data: snapshot.map(({ explanation, options, ...q }) => ({ ...q, options: options.map(({ isCorrect, ...o }: any) => o) })) }
  }
  async latest(learnerId: string) {
    const item = await this.prisma.placementAssessment.findFirst({ where: { learnerId, submittedAt: { not: null } }, orderBy: { submittedAt: 'desc' }, select: { id: true, submittedAt: true, result: true } })
    return item ? { assessmentId: item.id, submittedAt: item.submittedAt, ...(item.result as any) } : null
  }
  async submit(learnerId: string, body: { assessmentId?: unknown; answers?: unknown }) {
    if (typeof body?.assessmentId !== 'string' || !UUID.test(body.assessmentId)) throw new BadRequestException('Phiên kiểm tra không hợp lệ.')
    const session = await this.prisma.placementAssessment.findFirst({ where: { id: body.assessmentId, learnerId } })
    if (!session) throw new NotFoundException('Không tìm thấy bài kiểm tra của bạn.')
    if (session.submittedAt) return session.result
    if (session.expiresAt.getTime() < Date.now()) throw new BadRequestException('Bài kiểm tra đã hết hạn. Hãy tải lại để làm bài mới.')
    const questions = session.questions as any[]
    if (!Array.isArray(body.answers) || body.answers.length !== questions.length) throw new BadRequestException('Bạn cần trả lời tất cả câu hỏi trong bài kiểm tra.')
    const answers = body.answers as Answer[]
    const byId = new Map<string, string>()
    for (const answer of answers) {
      const q = questions.find(q => q.id === answer?.questionId)
      if (!q || byId.has(answer.questionId) || !q.options.some((o: any) => o.id === answer.optionId)) throw new BadRequestException('Câu trả lời không thuộc bài kiểm tra hoặc bị trùng.')
      byId.set(answer.questionId, answer.optionId)
    }
    const review = questions.map(q => ({ questionId: q.id, prompt: q.prompt, context: q.context, domain: q.domain, level: q.level, selectedOptionId: byId.get(q.id), correctOptionId: q.options.find((o: any) => o.isCorrect).id, correct: q.options.some((o: any) => o.id === byId.get(q.id) && o.isCorrect), explanation: q.explanation, options: q.options.map(({ isCorrect, ...o }: any) => o) }))
    const correct = review.filter(q => q.correct).length
    const percent = Math.round(correct / questions.length * 100)
    const levelCode = percent < 40 ? 'beginner' : percent < 70 ? 'intermediate' : 'advanced'
    const domainScores = [...new Set(questions.map(q => q.domain.code))].map(code => { const rows = review.filter(q => q.domain.code === code); const hits = rows.filter(q => q.correct).length; return { code, name: rows[0].domain.name, correct: hits, total: rows.length, percent: Math.round(hits / rows.length * 100) } })
    const profile = await this.profile(learnerId)
    const plan = await this.buildPlan(profile, { levelCode, percent, correct, total: questions.length, domainScores, mistakes: review.filter(q => !q.correct).map(q => ({ prompt: q.prompt, domain: q.domain.code, level: q.level.code })) })
    const level = await this.prisma.level.findUnique({ where: { code: levelCode } })
    if (!level) throw new BadRequestException('Trình độ chưa được cấu hình.')
    const result = { correct, total: questions.length, percent, levelCode, levelName: level.name, domainScores, review, plan }
    return this.prisma.$transaction(async tx => {
      const saved = await tx.placementAssessment.updateMany({ where: { id: session.id, learnerId, submittedAt: null }, data: { answers, result, submittedAt: new Date() } })
      if (!saved.count) return (await tx.placementAssessment.findUnique({ where: { id: session.id } }))!.result
      await tx.learnerProfile.upsert({ where: { userId: learnerId }, update: { levelId: level.id }, create: { userId: learnerId, levelId: level.id, onboardingCompleted: false } })
      return result
    })
  }
  async personalPlan(learnerId: string) {
    const profile = await this.profile(learnerId)
    if (!profile?.onboardingCompleted) throw new BadRequestException('Hãy hoàn thành thiết lập mục tiêu trước.')
    const previous = await this.latest(learnerId)
    const assessment = previous && !previous.selfSelected ? { levelCode: profile.level.code, percent: previous.percent, correct: previous.correct, total: previous.total, domainScores: previous.domainScores, mistakes: previous.review?.filter((q: any) => !q.correct).map((q: any) => ({ prompt: q.prompt, domain: q.domain.code, level: q.level.code })) } : { levelCode: profile.level.code, selfSelected: true }
    const plan = await this.buildPlan(profile, assessment)
    const { assessmentId: _id, submittedAt: _date, ...old } = previous ?? {}
    const result = { ...old, levelCode: profile.level.code, levelName: profile.level.name, plan, selfSelected: !!assessment.selfSelected }
    const saved = await this.prisma.placementAssessment.create({ data: { learnerId, questions: [], result, expiresAt: new Date(), submittedAt: new Date() } })
    return { ...result, assessmentId: saved.id }
  }
  private async buildPlan(profile: any, assessment: any) {
    const domainIds = profile?.domains.map((d: any) => d.domainId) ?? []
    const certificateIds = profile?.certGoals.map((c: any) => c.certificateId) ?? []
    const goal = profile?.learningGoal ?? 'both'
    const minutes = profile?.dailyStudyTargetMinutes ?? 30
    const lessons = await this.prisma.lesson.findMany({ where: { status: 'published', domain: { isActive: true }, ...(domainIds.length ? { domainId: { in: domainIds } } : {}), ...(goal === 'certification' ? { type: 'certification_review', certificates: { some: { certificateId: { in: certificateIds } } } } : {}) }, include: { domain: true, level: true }, orderBy: [{ level: { order: 'asc' } }, { createdAt: 'asc' }], take: 40 })
    const candidates = lessons.map(l => ({ id: l.id, title: l.title, kind: 'lesson', domain: l.domain.name, level: l.level.code, actionUrl: `/learn/lessons/${l.id}` }))
    for (const item of profile?.certGoals ?? []) if (item.certificate.isActive) candidates.push({ id: item.certificateId, title: item.certificate.name, kind: 'certificate', domain: '', level: '', actionUrl: `/learn/certifications/${item.certificateId}` })
    if (goal !== 'certification') for (const item of profile?.domains ?? []) candidates.push({ id: `vocab-${item.domainId}`, title: `Từ vựng ${item.domain.name}`, kind: 'vocabulary', domain: item.domain.name, level: '', actionUrl: '/learn/flashcards' })
    const weak = assessment.domainScores?.filter((d: any) => d.percent < 70).map((d: any) => d.name) ?? []
    const fallback = { source: 'rules', summary: `Học ${minutes} phút mỗi ngày${weak.length ? ` và ưu tiên củng cố ${weak.join(', ')}` : ''}.`, strengths: [], weaknesses: weak, levelReason: assessment.selfSelected ? 'Dựa trên trình độ bạn tự chọn; chưa có bài kiểm tra.' : `Dựa trên ${assessment.correct}/${assessment.total} câu đúng. Bài ngắn chỉ giúp định hướng học, không thay thế đánh giá chính thức.`, steps: candidates.slice(0, 5).map((c, i) => ({ ...c, reason: c.kind === 'certificate' ? 'Học kiến thức theo chủ đề trước khi làm Quiz.' : 'Củng cố nội dung thuộc mục tiêu đã chọn.', week: Math.min(i + 1, 4) })), dailyMinutes: minutes }
    if (!this.ai || !candidates.length) return fallback
    const progress = profile?.userId ? await this.prisma.learningProgress.findMany({ where: { learnerId: profile.userId, resourceType: 'lesson' }, select: { resourceId: true, status: true, completionPercent: true } }) : []
    return this.ai.plan(fallback, candidates, { assessment, goal, dailyMinutes: minutes, domains: profile?.domains.map((d: any) => d.domain.name), certificates: profile?.certGoals.map((c: any) => c.certificate.name), progress: progress.filter(p => candidates.some(c => c.id === p.resourceId)).map(p => ({ candidateId: p.resourceId, status: p.status, completionPercent: p.completionPercent })) })
  }
}
