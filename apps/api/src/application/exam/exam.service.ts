import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  private normalizeTextAnswer(value: unknown) {
    return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')
  }

  private assertUniqueExamQuestions(questions: any[] | undefined) {
    if (!questions) return
    const ids = questions.map((question) => question.questionId)
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Một câu hỏi không được xuất hiện nhiều lần trong cùng bài thi')
    }
  }

  private toLearnerAttempt(attempt: any) {
    const questions = Array.isArray(attempt.questionsSnapshot) ? attempt.questionsSnapshot : []
    return {
      ...attempt,
      questionsSnapshot: questions.map((item: any) => {
        const { acceptedAnswers: _acceptedAnswers, explanation: _explanation, ...question } = item
        return {
          ...question,
          options: (item.options ?? []).map((option: any) => {
            const { isCorrect: _isCorrect, explanation: _optionExplanation, ...safeOption } = option
            return safeOption
          }),
        }
      }),
    }
  }

  private assertValidAvailabilityWindow(availableFrom?: string | Date | null, availableUntil?: string | Date | null) {
    if (availableFrom && availableUntil && new Date(availableFrom) >= new Date(availableUntil)) {
      throw new BadRequestException('Thời gian đóng bài thi phải sau thời gian mở bài thi')
    }
  }

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100)
    const { search, domainCode, levelCode, status, kind } = params
    const skip = (page - 1) * limit
    const where: any = { certificateId: { not: null } }
    if (search) where.title = { contains: search, mode: 'insensitive' }
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    if (kind) where.kind = kind
    if (params.certificateId) where.certificateId = params.certificateId
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
    if (!e) throw new NotFoundException('Không tìm thấy bài thi')
    return e
  }

  async create(dto: any, createdById: string) {
    this.assertUniqueExamQuestions(dto.questions)
    this.assertValidAvailabilityWindow(dto.availableFrom, dto.availableUntil)
    if (!dto.certificateId) throw new BadRequestException('Quiz hoặc đề thi phải thuộc một chứng chỉ')
    const domain = await this.prisma.domain.findUnique({ where: { id: dto.domainId } })
    const level = await this.prisma.level.findUnique({ where: { id: dto.levelId } })
    if (!domain||!level) throw new NotFoundException('Lĩnh vực hoặc cấp độ không tồn tại')
    return this.prisma.exam.create({ data: { title: dto.title, description: dto.description ?? '', kind: dto.kind ?? 'practice', domainId: domain.id, levelId: level.id, certificateId: dto.certificateId, topics: dto.topics??[], durationMinutes: dto.durationMinutes, passingScorePercent: dto.passingScorePercent??70, maxAttempts: dto.maxAttempts??1, shuffleQuestions: dto.shuffleQuestions??false, availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null, availableUntil: dto.availableUntil ? new Date(dto.availableUntil) : null, status: dto.status??'draft', publishedAt: dto.status === 'published' ? new Date() : null, createdById, questions: dto.questions?.length ? { create: dto.questions.map((question: any) => ({ questionId: question.questionId, order: question.order, weight: question.weight ?? 1 })) } : undefined } })
  }

  async update(id: string, dto: any) {
    const existing = await this.findOne(id)
    this.assertUniqueExamQuestions(dto.questions)
    this.assertValidAvailabilityWindow(dto.availableFrom ?? existing.availableFrom, dto.availableUntil ?? existing.availableUntil)
    const data: any = {}
    for (const f of ['title','description','kind','durationMinutes','passingScorePercent','maxAttempts','shuffleQuestions','status','topics']) if (dto[f]!==undefined) data[f]=dto[f]
    for (const f of ['availableFrom','availableUntil']) if (dto[f]!==undefined) data[f]=dto[f] ? new Date(dto[f]) : null
    if (dto.domainId !== undefined) data.domain = { connect: { id: dto.domainId } }
    if (dto.levelId !== undefined) data.level = { connect: { id: dto.levelId } }
    if (dto.certificateId !== undefined) data.certificate = dto.certificateId ? { connect: { id: dto.certificateId } } : { disconnect: true }
    if (dto.status==='published') data.publishedAt=new Date()
    return this.prisma.$transaction(async (tx) => {
      if (dto.questions !== undefined) {
        await tx.examQuestion.deleteMany({ where: { examId: id } })
        if (dto.questions.length) {
          await tx.examQuestion.createMany({ data: dto.questions.map((question: any) => ({ examId: id, questionId: question.questionId, order: question.order, weight: question.weight ?? 1 })) })
        }
      }
      return tx.exam.update({ where: { id }, data, include: { questions: { include: { question: true }, orderBy: { order: 'asc' } } } })
    })
  }

  async delete(id: string) { await this.findOne(id); await this.prisma.exam.delete({ where: { id } }) }
  async publish(id: string) { await this.findOne(id); return this.prisma.exam.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } }) }

  async startAttempt(examId: string, learnerId: string) {
    for (let retry = 0; retry < 3; retry += 1) {
      try {
        return await this.startAttemptTransaction(examId, learnerId)
      } catch (error: unknown) {
        const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : ''
        if (code !== 'P2034' && code !== 'P2002') throw error
        if (retry === 2) throw new ConflictException('Có thao tác bắt đầu bài luyện tập đồng thời. Vui lòng bấm thử lại một lần nữa.')
        await new Promise(resolve => setTimeout(resolve, 30 * (retry + 1)))
      }
    }
    throw new ConflictException('Không thể bắt đầu bài luyện tập lúc này')
  }

  private async startAttemptTransaction(examId: string, learnerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date()
      const exam = await tx.exam.findUnique({ where: { id: examId }, include: { questions: { include: { question: { include: { options: { orderBy: { order: 'asc' } } } } }, orderBy: { order: 'asc' } } } })
      if (!exam) throw new NotFoundException('Không tìm thấy bài thi')
      if (exam.status !== 'published') throw new BadRequestException('Bài thi chưa được xuất bản')
      if (exam.availableFrom && exam.availableFrom > now) throw new BadRequestException('Bài thi chưa đến thời gian mở')
      if (exam.availableUntil && exam.availableUntil < now) throw new BadRequestException('Bài thi đã hết thời gian mở')
      if (!exam.questions.length) throw new BadRequestException('Bài thi chưa có câu hỏi')

      await tx.examAttempt.updateMany({ where: { examId, learnerId, status: 'in_progress', expiresAt: { lte: now } }, data: { status: 'expired' } })
      const inProgress = await tx.examAttempt.findFirst({ where: { examId, learnerId, status: 'in_progress' }, include: { exam: true } })
      if (inProgress) return this.toLearnerAttempt(inProgress)

      const attemptCount = await tx.examAttempt.count({ where: { examId, learnerId, status: { in: ['submitted', 'graded', 'expired'] } } })
      if (attemptCount >= exam.maxAttempts) throw new BadRequestException(`Bạn đã sử dụng hết ${exam.maxAttempts} lượt làm bài`)

      const questionsSnapshot = exam.questions.map((eq: any) => ({ id: eq.question.id, type: eq.question.type, prompt: eq.question.prompt, context: eq.question.context, explanation: eq.question.explanation, domainId: eq.question.domainId, topics: eq.question.topics, acceptedAnswers: eq.question.acceptedAnswers, options: eq.question.options, basePoints: eq.question.points, weight: eq.weight, points: eq.question.points * eq.weight }))
      if (exam.shuffleQuestions) questionsSnapshot.sort(() => Math.random() - 0.5)
      const expiresAt = new Date(now.getTime() + exam.durationMinutes * 60 * 1000)
      const attempt = await tx.examAttempt.create({ data: { examId, learnerId, questionsSnapshot, examSnapshot: { id: exam.id, title: exam.title, passingScorePercent: exam.passingScorePercent, durationMinutes: exam.durationMinutes, maxAttempts: exam.maxAttempts }, expiresAt }, include: { exam: true } })
      return this.toLearnerAttempt(attempt)
    }, { isolationLevel: 'Serializable' })
  }

  async submitAttempt(attemptId: string, learnerId: string, answers: any[]) {
    const attempt = await this.prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt || attempt.learnerId !== learnerId) throw new NotFoundException('Không tìm thấy lượt làm bài')
    if (attempt.status !== 'in_progress') throw new BadRequestException('Lượt làm bài này đã được nộp trước đó')
    
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
      const acceptedAnswers = (q.acceptedAnswers ?? []).map((value: string) => this.normalizeTextAnswer(value)).filter(Boolean)
      const normalizedTextAnswer = this.normalizeTextAnswer(ans?.textAnswer)
      const isShortAnswer = q.type === 'short_answer'
      const isCorrect = isShortAnswer
        ? normalizedTextAnswer.length > 0 && acceptedAnswers.includes(normalizedTextAnswer)
        : selectedIds.length > 0 && selectedIds.length === correctIds.length && selectedIds.every((id: string) => correctIds.includes(id))

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
      if (claimed.count !== 1) throw new BadRequestException('Lượt làm bài này đã được nộp trước đó')
      if (answerRows.length) await tx.attemptAnswer.createMany({ data: answerRows })
      await this.updateExamProgress(tx, learnerId, scorePercent, attempt.examId)
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

  private async updateExamProgress(tx: any, learnerId: string, scorePercent: number, examId: string) {
    const exam = await tx.exam.findUnique({ where: { id: examId }, select: { domainId: true, certificateId: true } })
    if (!exam) return
    const resources = [
      { resourceType: 'domain', resourceId: exam.domainId },
      ...(exam.certificateId ? [{ resourceType: 'certificate', resourceId: exam.certificateId }] : []),
    ]
    for (const resource of resources) {
      const attempts = await tx.examAttempt.findMany({ where: { learnerId, status: 'graded', exam: resource.resourceType === 'domain' ? { domainId: resource.resourceId } : { certificateId: resource.resourceId } }, select: { scorePercent: true } })
      const scores = attempts.map((item: any) => item.scorePercent).filter((value: number | null) => value !== null)
      const averageScorePercent = scores.length ? scores.reduce((sum: number, value: number) => sum + value, 0) / scores.length : scorePercent
      await tx.learningProgress.upsert({
        where: { learnerId_resourceType_resourceId: { learnerId, resourceType: resource.resourceType, resourceId: resource.resourceId } },
        update: { status: 'in_progress', averageScorePercent },
        create: { learnerId, resourceType: resource.resourceType, resourceId: resource.resourceId, status: 'in_progress', completionPercent: 0, averageScorePercent, startedAt: new Date() },
      })
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
    if (!attempt) throw new NotFoundException('Không tìm thấy lượt làm bài')

    const userId = typeof user === 'string' ? user : user?.sub
    const isOwner = attempt.learnerId === userId
    const isAdminOrStaff = typeof user !== 'string' && (
      user?.roles?.some((r: string) => ['admin', 'teacher', 'superadmin', 'manager'].includes(r)) ||
      user?.permissions?.some((p: string) => ['exams:grade', 'reports:read', 'exams:manage'].includes(p))
    )

    if (!isOwner && !isAdminOrStaff) throw new ForbiddenException('Bạn không có quyền xem lượt làm bài này')

    const snapshot = Array.isArray(attempt.questionsSnapshot) ? attempt.questionsSnapshot : []
    const totalQuestions = snapshot.length
    const correctCount = snapshot.filter((q: any) => q.isUserCorrect === true).length
    const incorrectCount = Math.max(0, totalQuestions - correctCount)
    const timeSpentSeconds = attempt.submittedAt && attempt.startedAt
      ? Math.max(0, Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000))
      : 0

    const domainIds = [...new Set(snapshot.map((question: any) => question.domainId).filter(Boolean))] as string[]
    const topicCodes = [...new Set(snapshot.flatMap((question: any) => Array.isArray(question.topics) ? question.topics : []).filter(Boolean))] as string[]
    const [domains, topics] = await Promise.all([
      domainIds.length ? this.prisma.domain.findMany({ where: { id: { in: domainIds } }, select: { id: true, name: true } }) : [],
      topicCodes.length ? this.prisma.certificationTopic.findMany({ where: { code: { in: topicCodes }, certificateId: attempt.exam.certificateId ?? undefined }, select: { code: true, name: true } }) : [],
    ])
    const domainNames = new Map<string, string>(domains.map((domain): [string, string] => [domain.id, domain.name]))
    const topicNames = new Map<string, string>(topics.map((topic): [string, string] => [topic.code, topic.name]))
    const summarize = (keys: string[], keyOf: (question: any) => string | undefined, nameOf: (key: string) => string) => keys.map((key) => {
      const questions = snapshot.filter((question: any) => keyOf(question) === key)
      const correct = questions.filter((question: any) => question.isUserCorrect === true).length
      return { key, name: nameOf(key), total: questions.length, correct, incorrect: questions.length - correct, scorePercent: questions.length ? Math.round(correct / questions.length * 100) : 0 }
    })
    const performanceByDomain = summarize(domainIds, (question) => question.domainId, (key) => domainNames.get(key) ?? key)
    const performanceByTopic = summarize(topicCodes, (question) => question.topics?.[0], (key) => topicNames.get(key) ?? key)

    return {
      ...attempt,
      timeSpentSeconds,
      isPassed: attempt.passed ?? ((attempt.scorePercent ?? 0) >= ((attempt.exam as any)?.passingScorePercent ?? 70)),
      score: Math.round(attempt.scorePercent ?? attempt.score ?? 0),
      totalQuestions,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      performanceByDomain,
      performanceByTopic,
      weakDomains: performanceByDomain.filter((item) => item.scorePercent < 70),
      weakTopics: performanceByTopic.filter((item) => item.scorePercent < 70),
    }
  }
}
