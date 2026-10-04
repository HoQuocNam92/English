import { RecommendationModule } from './recommendation.module'
import { LearningAgendaService } from '../application/progress/learning-agenda.service'
import { Module } from '@nestjs/common'
import { ProgressService } from '../application/progress/progress.service'
import { ProgressController } from '../presentation/progress.controller'

@Module({
  imports: [RecommendationModule],
  providers: [ProgressService, LearningAgendaService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
