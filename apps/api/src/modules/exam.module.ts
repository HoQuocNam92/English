import { Module } from '@nestjs/common'
import { ExamsService } from '../application/exam/exam.service'
import { ExamsController } from '../presentation/exam.controller'

@Module({
  providers: [ExamsService],
  controllers: [ExamsController],
  exports: [ExamsService],
})
export class ExamModule {}