import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const { page=1, limit=20, search, domainCode, levelCode, status } = params
    const skip=(page-1)*limit; const where: any = {}
    if (search) where.title = { contains: search, mode: 'insensitive' }
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    const [data,total] = await Promise.all([
      this.prisma.exam.findMany({ where, skip, take: limit, include: { domain: true, level: true, certificate: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.exam.count({ where })
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } }
  }

  async findOne(id: string) {
    const e = await this.prisma.exam.findUnique({ where: { id }, include: { domain: true, level: true, certificate: true, questions: { include: { question: { include: { options: { orderBy: { order: 'asc' } } } } }, orderBy: { order: 'asc' } } } })
    if (!e) throw new NotFoundException('Exam not found')
    return e
  }

  async create(dto: any, createdById: string) {
    const domain = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
    if (!domain||!level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.exam.create({ data: { title: dto.title, description: dto.description, domainId: domain.id, levelId: level.id, topics: dto.topics??[], durationMinutes: dto.durationMinutes, passingScorePercent: dto.passingScorePercent??70, maxAttempts: dto.maxAttempts??1, shuffleQuestions: dto.shuffleQuestions??false, status: dto.status??'draft', createdById } })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    for (const f of ['title','description','durationMinutes','passingScorePercent','maxAttempts','shuffleQuestions','status','availableFrom','availableUntil']) if (dto[f]!==undefined) data[f]=dto[f]
    if (dto.status==='published') data.publishedAt=new Date()
    return this.prisma.exam.update({ where: { id }, data })
  }

  async delete(id: string) { await this.findOne(id); await this.prisma.exam.delete({ where: { id } }) }
  async publish(id: string) { await this.findOne(id); return this.prisma.exam.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } }) }

  async startAttempt(examId: string, learnerId: string) {
    const exam = await this.findOne(examId)
    const existingCount = await this.prisma.examAttempt.count({ where: { examId, learnerId, status: { not: 'expired' } } })
    if (existingCount >= exam.maxAttempts) throw new BadRequestException('Max attempts reached')
    const questionsSnapshot = exam.questions.map((eq: any) => ({ id: eq.question.id, type: eq.question.type, prompt: eq.question.prompt, context: eq.question.context, options: eq.question.options, points: eq.question.points }))
    const expiresAt = exam.durationMinutes ? new Date(Date.now() + exam.durationMinutes * 60 * 1000) : undefined
    return this.prisma.examAttempt.create({ data: { examId, learnerId, questionsSnapshot, examSnapshot: { id: exam.id, title: exam.title, passingScorePercent: exam.passingScorePercent }, expiresAt } })
  }

  async submitAttempt(attemptId: string, learnerId: string, answers: any[]) {
    const attempt = await this.prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt || attempt.learnerId !== learnerId) throw new NotFoundException('Attempt not found')
    if (attempt.status !== 'in_progress') throw new BadRequestException('Attempt already submitted')
    const snapshot = attempt.questionsSnapshot as any[]
    let totalScore = 0; let maxScore = 0
    for (const q of snapshot) {
      maxScore += q.points
      const ans = answers.find((a: any) => a.questionId === q.id)
      if (!ans) continue
      const correctIds = q.options?.filter((o: any) => o.isCorrect).map((o: any) => o.id) ?? []
      const isCorrect = ans.selectedOptionIds?.length === correctIds.length && ans.selectedOptionIds.every((id: string) => correctIds.includes(id))
      if (isCorrect) totalScore += q.points
    }
    const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    return this.prisma.examAttempt.update({ where: { id: attemptId }, data: { status: 'graded', score: totalScore, maxScore, scorePercent, passed: scorePercent >= (attempt.examSnapshot as any).passingScorePercent, submittedAt: new Date(), gradedAt: new Date() } })
  }

  async getAttempts(examId: string, learnerId?: string) {
    const where: any = { examId }
    if (learnerId) where.learnerId = learnerId
    return this.prisma.examAttempt.findMany({ where, include: { learner: { include: { userDetail: true } } }, orderBy: { startedAt: 'desc' } })
  }
}
