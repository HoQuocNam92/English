import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { AI_RECOMMENDATION_PORT, AiRecommendationPort } from './ai-recommendation.port'

export interface LearningRecommendationItem {
  id: string
  type: 'exam' | 'vocab'
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
  constructor(private prisma: PrismaService, @Inject(AI_RECOMMENDATION_PORT) private readonly ai: AiRecommendationPort) {}

  async getRecommendations(learnerId: string): Promise<{ recommendations: LearningRecommendationItem[]; personalizationSource: 'ai' | 'rules' }> {
    // 1. Lấy thông tin Learner Profile
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: learnerId },
      include: {
        level: true,
        domains: { include: { domain: true } },
        certGoals: { include: { certificate: true } },
      },
    })

    const levelId = profile?.levelId
    const targetDomainIds = (profile?.domains ?? []).map((d) => d.domainId)
    const targetCertIds = (profile?.certGoals ?? []).map((c) => c.certificateId)

    // 2. Lấy dữ liệu bài thi và từ vựng
    const [recentAttempts, weakVocabCount] = await Promise.all([
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

    const hasTargetDomains = targetDomainIds.length > 0
    const hasTargetCerts = targetCertIds.length > 0
    const hasTargets = hasTargetDomains || hasTargetCerts

    // Không đưa gợi ý chung chung khi học viên chưa chọn lộ trình.
    if (!profile?.onboardingCompleted || !hasTargets || profile.learningPathMode === 'self') {
      return { recommendations: [], personalizationSource: 'rules' }
    }

    const matchesTarget = (domainId?: string | null) => {
      if (!hasTargetDomains) return true
      return !!(domainId && targetDomainIds.includes(domainId))
    }

    const recommendations: LearningRecommendationItem[] = []

    // =========================================================================
    // TẦNG 1 (URGENT - 90-100đ): Cần củng cố gấp
    // =========================================================================

    // 1.1. Từ vựng trả lời sai cần ôn tập Flashcards
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

    // 2.1. Đề xuất bài thi kiểm tra theo domain mục tiêu
    const availableExams = hasTargetCerts ? await this.prisma.exam.findMany({
      where: {
        status: 'published',
        certificateId: { in: targetCertIds },
        ...(hasTargetDomains ? { domainId: { in: targetDomainIds } } : {}),
      },
      include: { domain: true, level: true },
      take: 2,
    }) : []

    for (const ex of availableExams) {
      // Chỉ đề xuất nếu chưa có lượt thi đạt điểm cao
      const hasPassed = recentAttempts.some((a) => a.examId === ex.id && (a.passed || (a.scorePercent ?? 0) >= 70))
      if (!hasPassed) {
        recommendations.push({
          id: `practice-exam-${ex.id}`,
          type: 'exam',
          title: ex.title,
          summary: ex.description,
          reason: `Học kiến thức ${ex.domain?.name || 'CNTT'} theo chứng chỉ đã chọn trước khi luyện Quiz.`,
          priority: 'high',
          priorityScore: 84,
          domainName: ex.domain?.name,
          levelName: ex.level?.name,
          actionUrl: ex.kind === 'mock_exam' ? `/learn/quiz/${ex.id}` : `/learn/certifications/${ex.certificateId}`,
          actionText: ex.kind === 'mock_exam' ? 'Làm đề thi thử' : 'Học và luyện Quiz',
        })
      }
    }

    // Sắp xếp theo priorityScore giảm dần và lấy tối đa 5 gợi ý phù hợp nhất
    const sorted = recommendations.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5)

    const aiRanked = await this.ai.rerank(sorted, {
      level: profile?.level?.code ?? null,
      targetDomains: profile?.domains.map(item => item.domain.code) ?? [],
      targetCertificates: profile?.certGoals.map(item => item.certificate.code) ?? [],
      recentScores: recentAttempts.map(item => item.scorePercent).filter(score => score !== null),
      weakVocabularyCount: weakVocabCount,
    })
    return { recommendations: aiRanked ?? sorted, personalizationSource: aiRanked ? 'ai' : 'rules' }
  }
}
