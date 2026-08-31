import { Module } from '@nestjs/common'
import { ProgressService } from '../application/progress/progress.service'
import { ProgressController } from '../presentation/progress.controller'
import { LeaderboardController } from '../presentation/leaderboard.controller'

@Module({
  providers: [ProgressService],
  controllers: [ProgressController, LeaderboardController],
  exports: [ProgressService],
})
export class ProgressModule {}