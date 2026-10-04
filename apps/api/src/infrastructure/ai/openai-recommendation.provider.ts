import { Injectable } from '@nestjs/common'
import { AiRecommendationPort } from '../../application/recommendation/ai-recommendation.port'
import { LearningRecommendationItem } from '../../application/recommendation/recommendation.service'
import { ApivnLearningPlanner } from './apivn-learning-planner'

@Injectable()
export class OpenAiRecommendationProvider implements AiRecommendationPort {
  constructor(private readonly ai: ApivnLearningPlanner) {}
  async rerank(items: LearningRecommendationItem[], context: Record<string, unknown>) {
    if (!items.length) return null
    const parsed = await this.ai.json('Bạn là cố vấn học tiếng Anh CNTT. Xếp hạng các gợi ý được cung cấp, ưu tiên phần yếu theo kết quả và mục tiêu. Chỉ dùng id có sẵn và giải thích ngắn bằng tiếng Việt. Schema: {"recommendations":[{"id":string,"reason":string}]}', { level: context.level, targetDomains: context.targetDomains, targetCertificates: context.targetCertificates, recentScores: context.recentScores, weakVocabularyCount: context.weakVocabularyCount, recommendations: items.map(({ id, title, reason, priorityScore }) => ({ id, title, reason, priorityScore })) })
    const seen = new Set<string>()
    const ranked = (Array.isArray(parsed?.recommendations) ? parsed.recommendations : []).flatMap((entry: any) => {
      const original = items.find(item => item.id === entry.id)
      if (!original || seen.has(entry.id) || typeof entry.reason !== 'string' || !entry.reason.trim()) return []
      seen.add(entry.id); return [{ ...original, reason: entry.reason.trim().slice(0, 1000) }]
    })
    return ranked.length ? [...ranked, ...items.filter(item => !seen.has(item.id))].slice(0, 5) : null
  }
}
