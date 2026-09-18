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
    if (filters?.levelCode) {
      vocabWhere.level = { code: filters.levelCode }
    } else if (!filters?.lessonId) {
      const profile = await this.prisma.learnerProfile.findUnique({
        where: { userId: learnerId },
        include: { level: true },
      })
      if (profile?.level?.code) {
        vocabWhere.level = { code: profile.level.code }
      }
    }
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
      },
    })
  }

  // Get flashcards dashboard stats, heatmap, and active studying lessons
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

    // 3. Studying lessons (from LearningProgress with status in_progress)
    const progressList = await this.prisma.learningProgress.findMany({
      where: {
        learnerId,
        resourceType: 'lesson',
        status: 'in_progress',
      },
      include: {
        lesson: {
          include: {
            domain: { select: { code: true, name: true } },
            level: { select: { code: true, name: true } },
            vocabularies: {
              select: {
                vocabularyId: true,
                vocabulary: {
                  select: {
                    id: true,
                    vocabProgress: {
                      where: { learnerId },
                      select: { status: true, nextReviewAt: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const studyingLessons = progressList
      .filter(p => p.lesson)
      .map(p => {
        const lesson = p.lesson!
        const vocabs = lesson.vocabularies || []
        const totalWords = vocabs.length

        let rememberedCount = 0
        let needsReviewCount = 0

        vocabs.forEach(v => {
          const prog = v.vocabulary?.vocabProgress?.[0]
          if (prog?.status === 'mastered') rememberedCount++
          else if (prog?.status === 'learning' && prog.nextReviewAt && prog.nextReviewAt <= now) {
            needsReviewCount++
          }
        })

        return {
          id: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          thumbnailUrl: lesson.thumbnailUrl,
          domain: lesson.domain,
          level: lesson.level,
          totalWords,
          rememberedCount,
          needsReviewCount,
          updatedAt: p.updatedAt,
        }
      })

    return {
      stats: {
        learned: learnedCount,
        remembered: masteredCount,
        needsReview: needsReviewCount,
      },
      heatmap,
      studyingLessons,
    }
  }

  // Get lesson details & vocab list for detail view
  async getLessonVocabList(learnerId: string, lessonId: string, sort?: 'default' | 'random') {
    const lesson: any = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        domain: { select: { code: true, name: true } },
        level: { select: { code: true, name: true } },
        createdBy: { select: { userDetail: { select: { displayName: true } } } },
      },
    })

    if (!lesson) {
      return null
    }

    // Mark as in_progress if not already marked
    const progress = await this.prisma.learningProgress.findUnique({
      where: {
        learnerId_resourceType_resourceId: {
          learnerId,
          resourceType: 'lesson',
          resourceId: lessonId,
        },
      },
    })

    const isStudying = progress?.status === 'in_progress'

    // Get all vocabularies in this lesson
    const lessonVocabs = await this.prisma.lessonVocabulary.findMany({
      where: { lessonId },
      include: {
        vocabulary: {
          include: {
            examples: { orderBy: { order: 'asc' }, take: 2 },
            vocabProgress: { where: { learnerId }, take: 1 },
          },
        },
      },
    })

    const now = new Date()
    let words = lessonVocabs
      .filter(lv => lv.vocabulary && lv.vocabulary.status === 'published')
      .map(lv => {
        const v = lv.vocabulary
        const prog = v.vocabProgress?.[0]
        const isMastered = prog?.status === 'mastered'
        const isNeedsReview = prog?.status === 'learning' && !!prog.nextReviewAt && prog.nextReviewAt <= now
        const isNew = !prog || prog.status === 'new'

        return {
          id: v.id,
          term: v.term,
          pronunciationIpa: v.pronunciationIpa,
          audioUrl: v.audioUrl,
          partOfSpeech: v.partOfSpeech,
          definitionEn: v.definitionEn,
          definitionVi: v.definitionVi,
          examples: v.examples.map(ex => ({ sentenceEn: ex.sentenceEn, translationVi: ex.translationVi })),
          status: prog?.status ?? 'new',
          isMastered,
          isNeedsReview,
          isNew,
          correctCount: prog?.correctCount ?? 0,
        }
      })

    if (sort === 'random') {
      words = words.sort(() => Math.random() - 0.5)
    }

    const total = words.length
    const remembered = words.filter(w => w.isMastered).length
    const needsReview = words.filter(w => w.isNeedsReview).length
    const newCount = words.filter(w => w.isNew).length

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        domain: lesson.domain,
        level: lesson.level,
        thumbnailUrl: lesson.thumbnailUrl,
        author: lesson.createdBy?.userDetail?.displayName || 'TechEnglish',
      },
      words,
      stats: {
        total,
        remembered,
        needsReview,
        newCount,
        isStudying,
      },
    }
  }

  // Get practice session for a lesson with optional onlyNew filter
  async getPracticeSession(learnerId: string, lessonId: string, options?: { onlyNew?: boolean }) {
    // Automatically ensure the lesson is in "in_progress" state
    await this.prisma.learningProgress.upsert({
      where: {
        learnerId_resourceType_resourceId: {
          learnerId,
          resourceType: 'lesson',
          resourceId: lessonId,
        },
      },
      create: {
        learnerId,
        resourceType: 'lesson',
        resourceId: lessonId,
        status: 'in_progress',
        startedAt: new Date(),
      },
      update: {
        status: 'in_progress',
        updatedAt: new Date(),
      },
    })

    const lessonData = await this.getLessonVocabList(learnerId, lessonId)
    if (!lessonData) return null

    let words = lessonData.words

    if (options?.onlyNew) {
      // Filter only words not yet mastered
      words = words.filter(w => !w.isMastered)
    }

    // Sort priority: 1) needs review, 2) new, 3) others
    words.sort((a, b) => {
      if (a.isNeedsReview && !b.isNeedsReview) return -1
      if (!a.isNeedsReview && b.isNeedsReview) return 1
      if (a.isNew && !b.isNew) return -1
      if (!a.isNew && b.isNew) return 1
      return 0
    })

    // Count words studied today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const studiedToday = await this.prisma.vocabularyProgress.count({
      where: { learnerId, lastReviewAt: { gte: todayStart } },
    })

    return {
      lesson: lessonData.lesson,
      words,
      stats: {
        totalWords: words.length,
        studiedToday,
        maxDailyNewWords: 20,
      },
    }
  }

  // Toggle study list: mark lesson as in_progress or not_started
  async toggleStudyingList(learnerId: string, lessonId: string, isStudying: boolean) {
    if (!isStudying) {
      // Mark as not_started so it's removed from "Đang học" dashboard
      await this.prisma.learningProgress.upsert({
        where: {
          learnerId_resourceType_resourceId: {
            learnerId,
            resourceType: 'lesson',
            resourceId: lessonId,
          },
        },
        create: {
          learnerId,
          resourceType: 'lesson',
          resourceId: lessonId,
          status: 'not_started',
        },
        update: {
          status: 'not_started',
          updatedAt: new Date(),
        },
      })
    } else {
      await this.prisma.learningProgress.upsert({
        where: {
          learnerId_resourceType_resourceId: {
            learnerId,
            resourceType: 'lesson',
            resourceId: lessonId,
          },
        },
        create: {
          learnerId,
          resourceType: 'lesson',
          resourceId: lessonId,
          status: 'in_progress',
          startedAt: new Date(),
        },
        update: {
          status: 'in_progress',
          updatedAt: new Date(),
        },
      })
    }

    return { success: true, isStudying }
  }
}
