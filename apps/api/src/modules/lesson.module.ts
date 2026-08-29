import { Module } from '@nestjs/common'
import { LessonsService } from '../application/lesson/lesson.service'
import { LessonsController } from '../presentation/lesson.controller'

@Module({
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonModule {}