import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { AuthModule } from './modules/auth.module'
import { UserModule } from './modules/user.module'
import { RoleModule } from './modules/role.module'
import { VocabularyModule } from './modules/vocabulary.module'
import { QuestionModule } from './modules/question.module'
import { ExamModule } from './modules/exam.module'
import { ProgressModule } from './modules/progress.module'
import { LearnerProfileModule } from './modules/learner-profile.module'
import { TaxonomyModule } from './modules/taxonomy.module'
import { UploadModule } from './modules/upload.module'
import { VocabStudyModule } from './modules/vocab-study.module'
import { RecommendationModule } from './modules/recommendation.module'
import { ScheduleModule } from '@nestjs/schedule'
import { NotificationModule } from './modules/notification.module'
import { LessonModule } from './modules/lesson.module'
import { LearnerGroupModule } from './modules/learner-group.module'


import { PlacementTestController } from './presentation/placement-test.controller';

@Module({
  controllers: [
    PlacementTestController,
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    VocabularyModule,
    QuestionModule,
    ExamModule,
    ProgressModule,
    LearnerProfileModule,
    TaxonomyModule,
    UploadModule,
    VocabStudyModule,
    RecommendationModule,
    NotificationModule,
    LessonModule,
    LearnerGroupModule,
  ],
})
export class AppModule {}
