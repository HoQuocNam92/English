import { RecommendationModule } from './recommendation.module'
import { LearningAgendaService } from '../application/progress/learning-agenda.service'
import { Module } from '@nestjs/common'
import { ProgressService } from '../application/progress/progress.service'
import { ProgressController } from '../presentation/progress.controller'
import { LearningPathService } from '../application/progress/learning-path.service'
import { ContinuationPlanService } from '../application/progress/continuation-plan.service'

@Module({
  imports: [RecommendationModule],
  providers: [ProgressService, LearningAgendaService, LearningPathService, ContinuationPlanService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
