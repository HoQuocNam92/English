import { Module } from '@nestjs/common'
import { ProgressService } from '../application/progress/progress.service'
import { ProgressController } from '../presentation/progress.controller'

@Module({
  providers: [ProgressService],
  controllers: [ProgressController],
  exports: [ProgressService],
})
export class ProgressModule {}