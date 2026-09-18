import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
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
      this.prisma.exam.findMany({
        where,
        skip,
        take: limit,
        include: {
          domain: true,
          level: true,
          certificate: true,
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.exam.count({ where }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const e = await this.prisma.exam.findUnique({ where: { id }, include: { domain: true, level: true, certificate: true, questions: { include: { question: { include: { options: { orderBy: { order: 'asc' } } } } }, orderBy: { order: 'asc' } } } })
    if (!e) throw new NotFoundException('Exam not found')
    return e
  }

  async create(dto: any, createdById: string) {
    const domain = await this.prisma.domain.findUnique({ where: { id: dto.domainId } })
    const level = await this.prisma.level.findUnique({ where: { id: dto.levelId } })
    if (!domain||!level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.exam.create({ data: { title: dto.title, description: dto.description, domainId: domain.id, levelId: level.id, certificateId: dto.certificateId || null, topics: dto.topics??[], durationMinutes: dto.durationMinutes, passingScorePercent: dto.passingScorePercent??70, maxAttempts: dto.maxAttempts??1, shuffleQuestions: dto.shuffleQuestions??false, status: dto.status??'draft', publishedAt: dto.status === 'published' ? new Date() : null, createdById, questions: dto.questions?.length ? { create: dto.questions.map((question: any) => ({ questionId: question.questionId, order: question.order })) } : undefined } })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    for (const f of ['title','description','durationMinutes','passingScorePercent','maxAttempts','shuffleQuestions','status','availableFrom','availableUntil']) if (dto[f]!==undefined) data[f]=dto[f]
    if (dto.domainId !== undefined) data.domain = { connect: { id: dto.domainId } }
    if (dto.levelId !== undefined) data.level = { connect: { id: dto.levelId } }
    if (dto.certificateId !== undefined) data.certificate = dto.certificateId ? { connect: { id: dto.certificateId } } : { disconnect: true }
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
    const snapshotById = new Map(snapshot.map((question: any) => [question.id, question]))
    const answerByQuestion = new Map<string, any>()
    for (const answer of answers) {
      const question = snapshotById.get(answer.questionId)
      if (!question || answerByQuestion.has(answer.questionId)) {
        throw new BadRequestException('Câu trả lời không thuộc bài thi hoặc bị trùng')
      }
      const selectedIds = answer.selectedOptionIds ?? []
      const optionIds = new Set((question.options ?? []).map((option: any) => option.id))
      if (new Set(selectedIds).size !== selectedIds.length || selectedIds.some((id: string) => !optionIds.has(id))) {
        throw new BadRequestException('Phương án đã chọn không hợp lệ')
      }
      answerByQuestion.set(answer.questionId, answer)
    }
    let totalScore = 0
    let maxScore = 0
    let correctCount = 0
    let incorrectCount = 0

    const answerRows: any[] = []
    const updatedSnapshot = snapshot.map((q: any) => {
      const ans = answerByQuestion.get(q.id)
      const selectedIds = ans?.selectedOptionIds ?? []
      
      const correctOpts = q.options?.filter((o: any) => o.isCorrect) ?? []
      const correctIds = correctOpts.map((o: any) => o.id || o.key)
      
      const isCorrect = selectedIds.length > 0 && 
        selectedIds.length === correctIds.length && 
        selectedIds.every((id: string) => correctIds.includes(id))

      const points = q.points || 1
      maxScore += points
      if (isCorrect) {
        totalScore += points
        correctCount++
      } else {
        incorrectCount++
      }

      if (ans) answerRows.push({
        attemptId,
        questionId: q.id,
        selectedOptionIds: selectedIds,
        textAnswer: ans.textAnswer ?? null,
        isCorrect,
        earnedPoints: isCorrect ? points : 0,
        maxPoints: points,
      })

      return {
        ...q,
        userSelectedOptionIds: selectedIds,
        isUserCorrect: isCorrect
      }
    })

    const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const passingScore = (attempt.examSnapshot as any)?.passingScorePercent ?? 70
    const passed = scorePercent >= passingScore

    const updated = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.examAttempt.updateMany({
        where: { id: attemptId, learnerId, status: 'in_progress' },
        data: {
          status: 'graded',
          questionsSnapshot: updatedSnapshot,
          score: totalScore,
          maxScore,
          scorePercent,
          passed,
          submittedAt: new Date(),
          gradedAt: new Date(),
        },
      })
      if (claimed.count !== 1) throw new BadRequestException('Attempt already submitted')
      if (answerRows.length) await tx.attemptAnswer.createMany({ data: answerRows })
      return tx.examAttempt.findUniqueOrThrow({ where: { id: attemptId }, include: { exam: true } })
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

  async getAttemptById(id: string, user: any) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id },
      include: {
        exam: { include: { domain: true, level: true } },
        learner: { include: { userDetail: true } }
      }
    })
    if (!attempt) throw new NotFoundException('Attempt not found')

    const userId = typeof user === 'string' ? user : user?.sub
    const isOwner = attempt.learnerId === userId
    const isAdminOrStaff = typeof user !== 'string' && (
      user?.roles?.some((r: string) => ['admin', 'teacher', 'superadmin', 'manager'].includes(r)) ||
      user?.permissions?.some((p: string) => ['exams:grade', 'reports:read', 'exams:manage'].includes(p))
    )

    if (!isOwner && !isAdminOrStaff) throw new ForbiddenException('Attempt not found')

    const snapshot = Array.isArray(attempt.questionsSnapshot) ? attempt.questionsSnapshot : []
    const totalQuestions = snapshot.length
    const correctCount = snapshot.filter((q: any) => q.isUserCorrect === true).length
    const incorrectCount = Math.max(0, totalQuestions - correctCount)
    const timeSpentSeconds = attempt.submittedAt && attempt.startedAt
      ? Math.max(0, Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000))
      : 0

    return {
      ...attempt,
      timeSpentSeconds,
      isPassed: attempt.passed ?? ((attempt.scorePercent ?? 0) >= ((attempt.exam as any)?.passingScorePercent ?? 70)),
      score: Math.round(attempt.scorePercent ?? attempt.score ?? 0),
      totalQuestions,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount
    }
  }
}
