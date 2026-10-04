import { CertificationStudyService } from '../application/lesson/certification-study.service'
import { CertificationStudyController } from '../presentation/certification-study.controller'
import { Module } from '@nestjs/common'
import { LessonsService } from '../application/lesson/lesson.service'
import { LessonsController } from '../presentation/lesson.controller'

@Module({ providers: [LessonsService, CertificationStudyService], controllers: [LessonsController, CertificationStudyController], exports: [LessonsService] })
export class LessonModule {}
