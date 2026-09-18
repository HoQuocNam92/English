import { Module } from '@nestjs/common'
import { RecommendationService } from '../application/recommendation/recommendation.service'
import { RecommendationController } from '../presentation/recommendation.controller'

@Module({
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationModule {}
