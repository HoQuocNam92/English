import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class VocabStudyService {
  constructor(private prisma: PrismaService) {}

  // Get study session: all words matching filters
  // Priority: 1) 'learning' words with nextReviewAt <= now, 2) 'new' words
  // Accepts optional filters: domainCode, levelCode, lessonId
  async getStudySession(learnerId: string, filters?: { domainCode?: string; levelCode?: string; lessonId?: string }) {
    // Build vocab filter
    const vocabWhere: any = { status: 'published' }
    if (filters?.domainCode) vocabWhere.domain = { code: filters.domainCode }
    if (filters?.levelCode) vocabWhere.level = { code: filters.levelCode }
    if (filters?.lessonId) vocabWhere.lessonVocabs = { some: { lessonId: filters.lessonId } }

    // Get words needing review (learning, nextReviewAt <= now)
    const reviewWords = await this.prisma.vocabulary.findMany({
      where: {
        ...vocabWhere,
        vocabProgress: { some: { learnerId, status: 'learning', nextReviewAt: { lte: new Date() } } },
      },
      include: {
        examples: { orderBy: { order: 'asc' }, take: 3 },
        domain: { select: { code: true, name: true } },
        level: { select: { code: true, name: true } },
        vocabProgress: { where: { learnerId }, take: 1 },
      },
    })

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

    const words = [...reviewWords, ...newWords]

    // Count studied today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const studiedToday = await this.prisma.vocabularyProgress.count({
      where: { learnerId, lastReviewAt: { gte: todayStart } },
    })

    return {
      words: words.map(w => ({
        id: w.id,
        term: w.term,
        pronunciationIpa: w.pronunciationIpa,
        partOfSpeech: w.partOfSpeech,
        definitionEn: w.definitionEn,
        definitionVi: w.definitionVi,
        examples: w.examples.map(ex => ({ sentenceEn: ex.sentenceEn, translationVi: ex.translationVi })),
        domain: w.domain,
        level: w.level,
        studyStatus: w.vocabProgress?.[0]?.status ?? 'new',
      })),
      meta: { total: words.length, studiedToday },
    }
  }

  // Generate quiz from given vocabulary IDs
  async generateQuiz(learnerId: string, vocabIds: string[]) {
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

    const questions = vocabs.map(v => {
      const hasExample = v.examples.length > 0 && v.examples[0].sentenceEn?.includes(v.term)
      const useFillBlank = hasExample && Math.random() > 0.4 // 60% fill-blank if example available

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
      } else {
        // Multiple choice: show Vietnamese definition, pick correct English term
        const distractors = allVocabs
          .filter(d => d.id !== v.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(d => d.term)
        const options = [v.term, ...distractors].sort(() => Math.random() - 0.5)
        return {
          type: 'multiple_choice' as const,
          vocabularyId: v.id,
          prompt: v.definitionVi,
          options,
          answer: v.term,
        }
      }
    })

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
}
