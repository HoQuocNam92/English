import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class VocabStudyService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(learnerId: string) {
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: learnerId },
      include: { level: true, domains: { include: { domain: true } }, certGoals: { include: { certificate: { include: { domains: { include: { domain: true } } } } } } },
    })
    const selectedDomains = profile?.domains.map(link => link.domain) ?? []
    const certificateDomains = profile?.certGoals.flatMap(link => link.certificate.domains.map(item => item.domain)) ?? []
    const goalDomains = profile?.learningGoal === 'certification' ? certificateDomains : profile?.learningGoal === 'vocabulary' ? selectedDomains : [...selectedDomains, ...certificateDomains]
    const domains = [...new Map(goalDomains.map(domain => [domain.code, domain])).values()]
    if (!profile?.level || !domains.length) return { groups: [], level: profile?.level ?? null }
    const groups = await Promise.all(domains.map(async domain => {
      const where = { status: 'published' as const, levelId: profile.level!.id, OR: [{ domainId: domain.id }, { domains: { some: { domainId: domain.id } } }] }
      const [total, remaining, samples] = await Promise.all([
        this.prisma.vocabulary.count({ where }),
        this.prisma.vocabulary.count({ where: { ...where, vocabProgress: { none: { learnerId } } } }),
        this.prisma.vocabulary.findMany({ where: { ...where, vocabProgress: { none: { learnerId } } }, select: { id: true, term: true }, orderBy: { term: 'asc' }, take: 6 }),
      ])
      return { domain, level: profile.level, total, remaining, samples }
    }))
    return { groups: groups.filter(group => group.total > 0), level: profile.level }
  }

  // Get study session: all words matching filters
  // Priority: 1) 'learning' words with nextReviewAt <= now, 2) 'new' words
  // Accepts optional filters: domainCode, levelCode
  async getStudySession(learnerId: string, filters?: { domainCode?: string; levelCode?: string; sourceLessonId?: string; continueLearning?: boolean }) {
    // Build vocab filter
    const vocabWhere: any = { status: 'published' }
    if (filters?.domainCode) vocabWhere.OR = [{ domain: { code: filters.domainCode } }, { domains: { some: { domain: { code: filters.domainCode } } } }]
    if (filters?.sourceLessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: filters.sourceLessonId },
        select: { status: true, vocabularies: { select: { vocabularyId: true } } },
      })
      if (!lesson || lesson.status !== 'published') throw new BadRequestException('Bài học không khả dụng.')
      vocabWhere.id = { in: lesson.vocabularies.map(link => link.vocabularyId) }
    }
    if (filters?.levelCode) {
      vocabWhere.level = { code: filters.levelCode }
    }

    // Get new words (no progress record)
    const newWords = await this.prisma.vocabulary.findMany({
      where: {
        ...vocabWhere,
        vocabProgress: { none: { learnerId } },
      },
      include: {
        examples: { orderBy: { order: 'asc' }, take: 3 },
        domain: { select: { code: true, name: true } },
        level: { select: { code: true, name: true } },
        vocabProgress: { where: { learnerId }, take: 1 },
      },
    })

    // Phiên mặc định chỉ học từ hoàn toàn mới. Từ đã học được ôn ở phiên SRS riêng.
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const studiedToday = await this.prisma.vocabularyProgress.count({
      where: { learnerId, createdAt: { gte: todayStart } },
    })
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: learnerId }, select: { dailyVocabularyTarget: true },
    })
    const dailyTarget = profile?.dailyVocabularyTarget ?? 10
    const remainingToday = filters?.continueLearning ? dailyTarget : Math.max(0, dailyTarget - studiedToday)
    const words = newWords.slice(0, remainingToday)

    return {
      words: words.map(w => ({
        id: w.id,
        term: w.term,
        pronunciationIpa: w.pronunciationIpa,
        partOfSpeech: w.partsOfSpeech.length ? w.partsOfSpeech.join(', ') : w.partOfSpeech,
        definitionEn: w.definitionEn,
        definitionVi: w.definitionVi,
        examples: w.examples.map(ex => ({ sentenceEn: ex.sentenceEn, translationVi: ex.translationVi })),
        domain: w.domain,
        level: w.level,
        studyStatus: w.vocabProgress?.[0]?.status ?? 'new',
      })),
      meta: { total: words.length, studiedToday, remainingToday, maxDailyNewWords: dailyTarget, dailyLimitReached: !filters?.continueLearning && remainingToday === 0, continuingAfterTarget: Boolean(filters?.continueLearning) },
    }
  }

  // Generate quiz from given vocabulary IDs
  async generateQuiz(learnerId: string, vocabIds: string[], repetitions: Record<string, number> = {}) {
    if (!Array.isArray(vocabIds) || !vocabIds.length || vocabIds.some(id => typeof id !== 'string' || !id.trim())) {
      throw new BadRequestException('Vui lòng chọn từ vựng để tạo bài kiểm tra.')
    }
    const vocabs = await this.prisma.vocabulary.findMany({
      where: { id: { in: vocabIds } },
      include: { examples: { orderBy: { order: 'asc' }, take: 3 } },
    })

    // Get some random words for multiple choice distractors
    const allVocabs = await this.prisma.vocabulary.findMany({
      where: { status: 'published', id: { notIn: vocabIds } },
      select: { id: true, term: true, definitionVi: true },
      take: 50,
    })

    const questions = vocabs.flatMap(v => Array.from({ length: Math.max(1, Math.min(4, repetitions[v.id] ?? 1)) }, (_, repetitionIndex) => {
      const hasExample = v.examples.length > 0 && v.examples[0].sentenceEn?.includes(v.term)
      const useFillBlank = hasExample && repetitionIndex % 2 === 1

      if (useFillBlank) {
        // Fill-in-the-blank
        const example = v.examples[0]
        const sentence = example.sentenceEn.replace(new RegExp(v.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '___')
        return {
          type: 'fill_blank' as const,
          vocabularyId: v.id,
          prompt: sentence,
          hint: v.definitionVi,
          answer: v.term,
        }
      } else if (repetitionIndex % 2 === 0) {
        // Hiện từ tiếng Anh, chọn nghĩa tiếng Việt.
        const distractors = allVocabs
          .filter(d => d.id !== v.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(d => d.definitionVi)
        const options = [v.definitionVi, ...distractors].sort(() => Math.random() - 0.5)
        return {
          type: 'multiple_choice' as const,
          vocabularyId: v.id,
          prompt: `Nghĩa của "${v.term}" là gì?`,
          options,
          answer: v.definitionVi,
        }
      } else {
        const distractors = allVocabs.filter(d => d.id !== v.id).sort(() => Math.random() - 0.5).slice(0, 3).map(d => d.term)
        return { type: 'multiple_choice' as const, vocabularyId: v.id, prompt: v.definitionVi, options: [v.term, ...distractors].sort(() => Math.random() - 0.5), answer: v.term }
      }
    }))

    // Shuffle questions
    return { questions: questions.sort(() => Math.random() - 0.5) }
  }

  // Submit answer and update progress
  async submitAnswer(learnerId: string, vocabularyId: string, isCorrect: boolean) {
    const existing = await this.prisma.vocabularyProgress.findUnique({
      where: { learnerId_vocabularyId: { learnerId, vocabularyId } },
    })

    const now = new Date()

    if (!existing) {
      // Create new progress record
      return this.prisma.vocabularyProgress.create({
        data: {
          learnerId,
          vocabularyId,
          status: isCorrect ? 'learning' : 'new',
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
          lastReviewAt: now,
          nextReviewAt: isCorrect
            ? new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours
            : new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes
        },
      })
    }

    const newCorrect = isCorrect ? existing.correctCount + 1 : existing.correctCount
    const newWrong = isCorrect ? existing.wrongCount : existing.wrongCount + 1

    // Simple SRS: mastered after 3 consecutive correct
    // Wrong answer resets to learning
    let newStatus = existing.status
    let nextReview: Date

    if (isCorrect) {
      if (newCorrect >= 3 && existing.status !== 'new') {
        newStatus = 'mastered'
        nextReview = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      } else {
        newStatus = 'learning'
        // Increasing intervals: 4h, 12h, 1d
        const intervals = [4 * 60 * 60 * 1000, 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000]
        const interval = intervals[Math.min(newCorrect - 1, intervals.length - 1)] ?? intervals[0]
        nextReview = new Date(now.getTime() + interval)
      }
    } else {
      newStatus = 'learning'
      nextReview = new Date(now.getTime() + 30 * 60 * 1000) // 30 min
    }

    return this.prisma.vocabularyProgress.update({
      where: { learnerId_vocabularyId: { learnerId, vocabularyId } },
      data: {
        correctCount: isCorrect ? { increment: 1 } : existing.correctCount,
        wrongCount: isCorrect ? existing.wrongCount : { increment: 1 },
        status: newStatus,
        lastReviewAt: now,
        nextReviewAt: nextReview,
      },
    })
  }

  // Get summary stats
  async getSummary(learnerId: string) {
    const [total, newCount, learningCount, masteredCount] = await Promise.all([
      this.prisma.vocabularyProgress.count({ where: { learnerId } }),
      this.prisma.vocabularyProgress.count({ where: { learnerId, status: 'new' } }),
      this.prisma.vocabularyProgress.count({ where: { learnerId, status: 'learning' } }),
      this.prisma.vocabularyProgress.count({ where: { learnerId, status: 'mastered' } }),
    ])

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const studiedToday = await this.prisma.vocabularyProgress.count({
      where: { learnerId, lastReviewAt: { gte: todayStart } },
    })

    return { total, new: newCount, learning: learningCount, mastered: masteredCount, studiedToday }
  }

  // Rate word with 4-level SRS: easy, medium, hard, mastered
  async rateWord(learnerId: string, vocabularyId: string, rating: 'easy' | 'medium' | 'hard' | 'mastered') {
    const existing = await this.prisma.vocabularyProgress.findUnique({
      where: { learnerId_vocabularyId: { learnerId, vocabularyId } },
    })

    const now = new Date()
    let newStatus: 'new' | 'learning' | 'mastered' = 'learning'
    let correctCount = existing?.correctCount ?? 0
    let wrongCount = existing?.wrongCount ?? 0
    let nextReview: Date

    switch (rating) {
      case 'easy': {
        correctCount += 1
        newStatus = correctCount >= 2 ? 'mastered' : 'learning'
        // Review after 3 days if learning, or 7 days if mastered
        const days = newStatus === 'mastered' ? 7 : 3
        nextReview = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
        break
      }
      case 'medium': {
        correctCount += 1
        newStatus = 'learning'
        // Review after 1 day
        nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        break
      }
      case 'hard': {
        wrongCount += 1
        correctCount = Math.max(0, correctCount - 1)
        newStatus = 'learning'
        // Review soon (10 minutes)
        nextReview = new Date(now.getTime() + 10 * 60 * 1000)
        break
      }
      case 'mastered': {
        correctCount = Math.max(correctCount, 5)
        newStatus = 'mastered'
        // Remove from review queue for a long time (1 year)
        nextReview = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        break
      }
    }

    if (!existing) {
      return this.prisma.vocabularyProgress.create({
        data: {
          learnerId,
          vocabularyId,
          status: newStatus,
          correctCount,
          wrongCount,
          lastReviewAt: now,
          nextReviewAt: nextReview,
          lastRating: rating,
        },
      })
    }

    return this.prisma.vocabularyProgress.update({
      where: { learnerId_vocabularyId: { learnerId, vocabularyId } },
      data: {
        status: newStatus,
        correctCount,
        wrongCount,
        lastReviewAt: now,
        nextReviewAt: nextReview,
        lastRating: rating,
      },
    })
  }

  // Get flashcards dashboard stats and heatmap
  async getDashboard(learnerId: string) {
    const now = new Date()

    // 1. Overall stats
    const [learnedCount, masteredCount, needsReviewCount] = await Promise.all([
      this.prisma.vocabularyProgress.count({
        where: { learnerId, status: { in: ['learning', 'mastered'] } },
      }),
      this.prisma.vocabularyProgress.count({
        where: { learnerId, status: 'mastered' },
      }),
      this.prisma.vocabularyProgress.count({
        where: { learnerId, status: 'learning', nextReviewAt: { lte: now } },
      }),
    ])

    // 2. Heatmap: Activity in last 60 days
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const recentActivity = await this.prisma.vocabularyProgress.findMany({
      where: { learnerId, lastReviewAt: { gte: sixtyDaysAgo } },
      select: { lastReviewAt: true },
    })

    const heatmapMap: Record<string, number> = {}
    recentActivity.forEach(a => {
      if (a.lastReviewAt) {
        const dateStr = a.lastReviewAt.toISOString().slice(0, 10)
        heatmapMap[dateStr] = (heatmapMap[dateStr] ?? 0) + 1
      }
    })
    const heatmap = Object.entries(heatmapMap).map(([date, count]) => ({ date, count }))

    return {
      stats: {
        learned: learnedCount,
        remembered: masteredCount,
        needsReview: needsReviewCount,
      },
      heatmap,
    }
  }

  // Get SRS review session — words that are due for review
  async getReviewSession(learnerId: string) {
    const now = new Date()

    const reviewVocabs = await this.prisma.vocabulary.findMany({
      where: {
        status: 'published',
        vocabProgress: {
          some: {
            learnerId,
            status: 'learning',
            nextReviewAt: { lte: now },
          },
        },
      },
      include: {
        examples: { orderBy: { order: 'asc' }, take: 2 },
        vocabProgress: { where: { learnerId }, take: 1 },
      },
    })

    const words = reviewVocabs.map(v => {
      const prog = v.vocabProgress?.[0]
      return {
        id: v.id,
        term: v.term,
        pronunciationIpa: v.pronunciationIpa,
        audioUrl: v.audioUrl,
        partOfSpeech: v.partsOfSpeech.length ? v.partsOfSpeech.join(', ') : v.partOfSpeech,
        definitionEn: v.definitionEn,
        definitionVi: v.definitionVi,
        examples: v.examples.map(ex => ({ sentenceEn: ex.sentenceEn, translationVi: ex.translationVi })),
        status: prog?.status ?? 'learning',
        isMastered: false,
        isNeedsReview: true,
        isNew: false,
        correctCount: prog?.correctCount ?? 0,
      }
    })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const studiedToday = await this.prisma.vocabularyProgress.count({
      where: { learnerId, lastReviewAt: { gte: todayStart } },
    })

    return {
      title: 'Ôn tập từ vựng đến hạn (SRS)',
      summary: 'Tập trung ôn tập toàn bộ các từ vựng kỹ thuật đã đến lịch củng cố trí nhớ',
      words,
      stats: {
        totalWords: words.length,
        studiedToday,
        maxDailyNewWords: 20,
      },
    }
  }

  async getHistory(learnerId: string, period?: 'day' | 'month' | 'year' | 'all', rating?: string, page = 1, limit = 10) {
    page = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
    limit = Number.isFinite(limit) ? Math.min(40, Math.max(1, Math.floor(limit))) : 10
    const now = new Date()
    let from: Date | undefined
    if (period === 'day') { from = new Date(now); from.setHours(0, 0, 0, 0) }
    if (period === 'month') from = new Date(now.getFullYear(), now.getMonth(), 1)
    if (period === 'year') from = new Date(now.getFullYear(), 0, 1)
    const where = {
      learnerId,
      lastReviewAt: { not: null, ...(from ? { gte: from } : {}) },
      OR: [{ lastRating: { not: null } }, { correctCount: { gt: 0 } }, { wrongCount: { gt: 0 } }],
      ...(rating && rating !== 'all' && { lastRating: rating }),
    }
    const total = await this.prisma.vocabularyProgress.count({ where })
    const totalPages = Math.max(1, Math.ceil(total / limit))
    page = Math.min(page, totalPages)
    const data = await this.prisma.vocabularyProgress.findMany({
      where,
      include: { vocabulary: { include: { domain: true, level: true } } },
      orderBy: [{ lastReviewAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    })
    return { data, meta: { page, limit, total, totalPages } }
  }
}
