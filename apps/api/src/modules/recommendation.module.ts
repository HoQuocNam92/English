import { Module } from '@nestjs/common';
import { RecommendationController } from '../presentation/recommendation.controller';
import { RecommendationService } from '../application/recommendation/recommendation.service';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
