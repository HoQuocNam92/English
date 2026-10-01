import { LearningRecommendationItem } from './recommendation.service'

export const AI_RECOMMENDATION_PORT = Symbol('AI_RECOMMENDATION_PORT')

export interface AiRecommendationPort {
  rerank(items: LearningRecommendationItem[], context: Record<string, unknown>): Promise<LearningRecommendationItem[] | null>
}
