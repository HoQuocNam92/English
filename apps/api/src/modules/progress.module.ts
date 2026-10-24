import { RecommendationModule } from './recommendation.module'
import { LearningAgendaService } from '../application/progress/learning-agenda.service'
import { Module } from '@nestjs/common'
import { ProgressService } from '../application/progress/progress.service'
import { ProgressController } from '../presentation/progress.controller'
import { LearningPathService } from '../application/progress/learning-path.service'

@Module({
  imports: [RecommendationModule],
  providers: [ProgressService, LearningAgendaService, LearningPathService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}
