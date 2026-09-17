import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100)
    const { search, domainCode, levelCode, status } = params
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.title = { contains: search, mode: 'insensitive' }
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({ where, skip, take: limit, include: { domain: true, level: true, certificate: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.exam.count({ where })
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
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
    // Check if there's an in-progress attempt first
    const inProgress = await this.prisma.examAttempt.findFirst({ 
      where: { examId, learnerId, status: 'in_progress' },
      include: { exam: true }
    })
    if (inProgress) return inProgress

    const questionsSnapshot = exam.questions.map((eq: any) => ({ id: eq.question.id, type: eq.question.type, prompt: eq.question.prompt, context: eq.question.context, options: eq.question.options, points: eq.question.points }))
    const expiresAt = exam.durationMinutes ? new Date(Date.now() + exam.durationMinutes * 60 * 1000) : undefined
    return this.prisma.examAttempt.create({ 
      data: { 
        examId, 
        learnerId, 
        questionsSnapshot, 
        examSnapshot: { id: exam.id, title: exam.title, passingScorePercent: exam.passingScorePercent, durationMinutes: exam.durationMinutes }, 
        expiresAt 
      },
      include: { exam: true }
    })
  }

  async submitAttempt(attemptId: string, learnerId: string, answers: any[]) {
    const attempt = await this.prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt || attempt.learnerId !== learnerId) throw new NotFoundException('Attempt not found')
    if (attempt.status !== 'in_progress') throw new BadRequestException('Attempt already submitted')
    
    const snapshot = (attempt.questionsSnapshot as any[]) || []
    let totalScore = 0
    let maxScore = 0
    let correctCount = 0
    let incorrectCount = 0

    const updatedSnapshot = snapshot.map((q: any) => {
      const ans = answers.find((a: any) => a.questionId === q.id)
      const selectedIds = ans?.selectedOptionIds ?? []
      
      const correctOpts = q.options?.filter((o: any) => o.isCorrect) ?? []
      const correctIds = correctOpts.map((o: any) => o.id || o.key)
      
      const isCorrect = selectedIds.length > 0 && 
        selectedIds.length === correctIds.length && 
        selectedIds.every((id: string) => correctIds.includes(id))

      maxScore += q.points || 1
      if (isCorrect) {
        totalScore += q.points || 1
        correctCount++
      } else {
        incorrectCount++
      }

      return {
        ...q,
        userSelectedOptionIds: selectedIds,
        isUserCorrect: isCorrect
      }
    })

    const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const passingScore = (attempt.examSnapshot as any)?.passingScorePercent ?? 70
    const passed = scorePercent >= passingScore

    const updated = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'graded',
        questionsSnapshot: updatedSnapshot,
        score: totalScore,
        maxScore,
        scorePercent,
        passed,
        submittedAt: new Date(),
        gradedAt: new Date()
      },
      include: { exam: true }
    })

    return {
      ...updated,
      isPassed: passed,
      totalQuestions: updatedSnapshot.length,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      score: Math.round(scorePercent)
    }
  }

  async getAttempts(examId: string, learnerId?: string) {
    const where: any = { examId }
    if (learnerId) where.learnerId = learnerId
    return this.prisma.examAttempt.findMany({ where, include: { learner: { include: { userDetail: true } } }, orderBy: { startedAt: 'desc' } })
  }

  async getMyAttempts(learnerId: string, params: any = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 10), 100)
    const skip = (page - 1) * limit
    const where = { learnerId }

    const [attempts, total] = await Promise.all([
      this.prisma.examAttempt.findMany({ 
        where, 
        skip,
        take: limit,
        include: { exam: { select: { title: true, domain: true, level: true } } }, 
        orderBy: { startedAt: 'desc' } 
      }),
      this.prisma.examAttempt.count({ where })
    ])

    const formattedData = attempts.map(a => {
      const isPassed = a.passed ?? ((a.scorePercent ?? 0) >= 70)
      const score = Math.round(a.scorePercent ?? a.score ?? 0)
      return {
        ...a,
        isPassed,
        score
      }
    })

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    }
  }

  async getAttemptById(id: string, learnerId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      include: { exam: true, learner: { include: { userDetail: true } } }
    })
    if (!attempt || attempt.learnerId !== learnerId) throw new NotFoundException('Attempt not found')

    const snapshot = Array.isArray(attempt.questionsSnapshot) ? attempt.questionsSnapshot : []
    const totalQuestions = snapshot.length
    const correctCount = snapshot.filter((q: any) => q.isUserCorrect === true).length
    const incorrectCount = Math.max(0, totalQuestions - correctCount)

    return {
      ...attempt,
      isPassed: attempt.passed ?? ((attempt.scorePercent ?? 0) >= 70),
      score: Math.round(attempt.scorePercent ?? attempt.score ?? 0),
      totalQuestions,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount
    }
  }
}
