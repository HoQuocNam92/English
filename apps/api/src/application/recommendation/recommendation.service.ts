import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

export interface LearningRecommendationItem {
  id: string
  type: 'lesson' | 'exam' | 'vocab' | 'scenario'
  title: string
  summary?: string
  reason: string
  priority: 'urgent' | 'high' | 'normal'
  priorityScore: number
  domainName?: string
  levelName?: string
  actionUrl: string
  actionText: string
  progressPercent?: number
}

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(learnerId: string): Promise<{ recommendations: LearningRecommendationItem[] }> {
    // 1. Lấy thông tin Learner Profile
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: learnerId },
      include: {
        level: true,
        domains: { include: { domain: true } },
        certGoals: { include: { certificate: true } },
        careerGoals: { include: { careerGoal: true } },
      },
    })

    const levelId = profile?.levelId
    const targetDomainIds = (profile?.domains ?? []).map((d) => d.domainId)
    const targetCertIds = (profile?.certGoals ?? []).map((c) => c.certificateId)

    // 2. Lấy tiến độ học tập bài học của learner
    const [allProgress, recentAttempts, weakVocabCount] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where: { learnerId, resourceType: 'lesson' },
        include: {
          lesson: {
            include: {
              domain: true,
              level: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.examAttempt.findMany({
        where: { learnerId, status: { in: ['graded', 'submitted'] } },
        include: {
          exam: {
            include: {
              domain: true,
              level: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: 5,
      }),
      this.prisma.vocabularyProgress.count({
        where: { learnerId, wrongCount: { gt: 0 } },
      }),
    ])

    const completedLessonIds = new Set<string>()
    const inProgressItems: any[] = []

    for (const p of allProgress) {
      if (p.status === 'completed' || p.completionPercent >= 100) {
        completedLessonIds.add(p.resourceId)
      } else if (p.status === 'in_progress' && p.completionPercent < 100 && p.lesson) {
        inProgressItems.push(p)
      }
    }

    const recommendations: LearningRecommendationItem[] = []

    // =========================================================================
    // TẦNG 1 (URGENT - 90-100đ): Cần củng cố gấp
    // =========================================================================

    // 1.1. Bài thi gần nhất điểm thấp (< 70% hoặc không pass)
    const lowAttempts = recentAttempts.filter(
      (a) => (a.scorePercent !== null && a.scorePercent < 70) || a.passed === false
    )

    if (lowAttempts.length > 0) {
      const latestFailed = lowAttempts[0]
      // Tìm bài học cùng domain/cert với bài thi mà học viên chưa hoàn thành
      const reinforceLessons = await this.prisma.lesson.findMany({
        where: {
          status: 'published',
          domainId: latestFailed.exam.domainId,
          id: { notIn: Array.from(completedLessonIds) },
        },
        include: { domain: true, level: true },
        take: 2,
      })

      for (const l of reinforceLessons) {
        const scoreText = latestFailed.scorePercent !== null ? `${Math.round(latestFailed.scorePercent)}%` : 'chưa đạt'
        recommendations.push({
          id: `reinforce-exam-${latestFailed.id}-${l.id}`,
          type: 'lesson',
          title: l.title,
          summary: l.summary ?? undefined,
          reason: `Cần củng cố: Bài kiểm tra "${latestFailed.exam.title}" đạt ${scoreText}. Hãy ôn luyện bài học này để lấp lỗ hổng kiến thức!`,
          priority: 'urgent',
          priorityScore: 98,
          domainName: l.domain?.name,
          levelName: l.level?.name,
          actionUrl: `/learn/lessons/${l.id}`,
          actionText: 'Củng cố ngay',
        })
      }
    }

    // 1.2. Bài học đang học dở dang (in_progress)
    for (const item of inProgressItems.slice(0, 2)) {
      const lesson = item.lesson
      const percent = Math.round(item.completionPercent ?? 0)
      recommendations.push({
        id: `in-progress-${lesson.id}`,
        type: 'lesson',
        title: lesson.title,
        summary: lesson.summary ?? undefined,
        reason: `Tiếp tục bài dở dang: Bạn đã hoàn thành ${percent}%. Hoàn tất bài học để nắm trọn vẹn chủ đề!`,
        priority: 'urgent',
        priorityScore: 95,
        domainName: lesson.domain?.name,
        levelName: lesson.level?.name,
        actionUrl: `/learn/lessons/${lesson.id}`,
        actionText: 'Tiếp tục học',
        progressPercent: percent,
      })
    }

    // 1.3. Từ vựng trả lời sai cần ôn tập Flashcards
    if (weakVocabCount > 0) {
      recommendations.push({
        id: `vocab-weak-reinforce`,
        type: 'vocab',
        title: `Ôn tập ${weakVocabCount} thuật ngữ tiếng Anh IT hay nhầm`,
        summary: 'Luyện tập ngắt quãng (Spaced Repetition) các thuật ngữ bạn đã trả lời chưa chính xác để ghi nhớ dài hạn.',
        reason: `Củng cố từ vựng: Bạn có ${weakVocabCount} từ vựng trả lời sai cần ôn tập củng cố lại.`,
        priority: 'urgent',
        priorityScore: 92,
        domainName: 'Từ vựng chuyên ngành',
        actionUrl: '/learn/flashcards',
        actionText: 'Luyện tập từ vựng',
      })
    }

    // =========================================================================
    // TẦNG 2 (HIGH - 75-89đ): Luyện tập tăng cường
    // =========================================================================

    // 2.1. Đề xuất bài thi kiểm tra theo domain/certificate mục tiêu
    const examWhere: any = {
      status: 'published',
    }
    if (targetDomainIds.length > 0) {
      examWhere.domainId = { in: targetDomainIds }
    }
    if (targetCertIds.length > 0) {
      examWhere.certificateId = { in: targetCertIds }
    }

    const availableExams = await this.prisma.exam.findMany({
      where: examWhere,
      include: { domain: true, level: true },
      take: 2,
    })

    for (const ex of availableExams) {
      // Chỉ đề xuất nếu chưa có lượt thi đạt điểm cao
      const hasPassed = recentAttempts.some((a) => a.examId === ex.id && (a.passed || (a.scorePercent ?? 0) >= 70))
      if (!hasPassed) {
        recommendations.push({
          id: `practice-exam-${ex.id}`,
          type: 'exam',
          title: ex.title,
          summary: ex.description,
          reason: `Luyện tập tăng cường: Làm bài thi kiểm tra kiến thức về ${ex.domain?.name || 'CNTT'} và nhận kết quả đánh giá năng lực.`,
          priority: 'high',
          priorityScore: 84,
          domainName: ex.domain?.name,
          levelName: ex.level?.name,
          actionUrl: `/learn/quiz/${ex.id}`,
          actionText: 'Làm bài kiểm tra',
        })
      }
    }

    // 2.2. Tình huống thực tế (Scenario practice)
    recommendations.push({
      id: `practice-scenario-daily`,
      type: 'scenario',
      title: 'Luyện tập tình huống: Daily Scrum & Standup Meeting',
      summary: 'Thực hành phản xạ giao tiếp tiếng Anh trong buổi họp kỹ thuật, báo cáo tiến độ và giải quyết blocker.',
      reason: 'Luyện tập tăng cường: Củng cố kỹ năng giao tiếp tiếng Anh thực tế trong môi trường dự án phần mềm.',
      priority: 'high',
      priorityScore: 78,
      domainName: 'Giao tiếp thực tế',
      actionUrl: '/learn/practice/scenario/1',
      actionText: 'Luyện tập tình huống',
    })

    // =========================================================================
    // TẦNG 3 (NORMAL - 50-74đ): Lộ trình bài học tiếp theo
    // =========================================================================

    const lessonWhere: any = {
      status: 'published',
      id: { notIn: Array.from(completedLessonIds) },
    }
    if (levelId) {
      lessonWhere.levelId = levelId
    }
    if (targetDomainIds.length > 0) {
      lessonWhere.domainId = { in: targetDomainIds }
    }

    let nextLessons = await this.prisma.lesson.findMany({
      where: lessonWhere,
      include: { domain: true, level: true },
      take: 4,
    })

    // Fallback nếu không có bài khớp chính xác level + domain
    if (nextLessons.length === 0) {
      nextLessons = await this.prisma.lesson.findMany({
        where: {
          status: 'published',
          id: { notIn: Array.from(completedLessonIds) },
        },
        include: { domain: true, level: true },
        take: 3,
      })
    }

    for (const l of nextLessons) {
      // Tránh duplicate nếu bài học đã được thêm ở tầng 1
      if (!recommendations.some((r) => r.actionUrl === `/learn/lessons/${l.id}`)) {
        recommendations.push({
          id: `next-path-${l.id}`,
          type: 'lesson',
          title: l.title,
          summary: l.summary ?? undefined,
          reason: `Đề xuất theo lộ trình: Bài học tiếp theo phù hợp với trình độ ${l.level?.name || 'Beginner'} và lĩnh vực ${l.domain?.name || 'CNTT'}.`,
          priority: 'normal',
          priorityScore: 65,
          domainName: l.domain?.name,
          levelName: l.level?.name,
          actionUrl: `/learn/lessons/${l.id}`,
          actionText: 'Bắt đầu học',
          progressPercent: 0,
        })
      }
    }

    // Sắp xếp theo priorityScore giảm dần và lấy tối đa 5 gợi ý phù hợp nhất
    const sorted = recommendations.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5)

    return { recommendations: sorted }
  }
}
