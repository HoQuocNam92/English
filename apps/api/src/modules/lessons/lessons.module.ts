import { Module } from '@nestjs/common'
import { LessonsService } from './lessons.service'
import { LessonsController } from './presentation/controllers/lessons.controller'
@Module({ providers: [LessonsService], controllers: [LessonsController] })
export class LessonsModule {}
