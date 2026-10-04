import { ApivnLearningPlanner } from '../infrastructure/ai/apivn-learning-planner'
import { PlacementService } from '../application/placement/placement.service'
import { Module } from '@nestjs/common'
import { RecommendationService } from '../application/recommendation/recommendation.service'
import { RecommendationController } from '../presentation/recommendation.controller'
import { AI_RECOMMENDATION_PORT } from '../application/recommendation/ai-recommendation.port'
import { OpenAiRecommendationProvider } from '../infrastructure/ai/openai-recommendation.provider'

@Module({
  providers: [ApivnLearningPlanner, PlacementService, RecommendationService, OpenAiRecommendationProvider, { provide: AI_RECOMMENDATION_PORT, useExisting: OpenAiRecommendationProvider }],
  controllers: [RecommendationController],
  exports: [RecommendationService, PlacementService, ApivnLearningPlanner],
})
export class RecommendationModule {}
