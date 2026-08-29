import { Module } from '@nestjs/common'
import { QuestionsService } from '../application/question/question.service'
import { QuestionsController } from '../presentation/question.controller'

@Module({
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionModule {}