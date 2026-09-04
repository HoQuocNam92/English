import { NotificationController } from './presentation/notification.controller';
import { PlannerController } from './presentation/planner.controller';
import { MockInterviewController } from './presentation/mock-interview.controller';
import { WritingController } from './presentation/writing.controller';
import { DiscussionController } from './presentation/discussion.controller';
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { AuthModule } from './modules/auth.module'
import { UserModule } from './modules/user.module'
import { RoleModule } from './modules/role.module'
import { LessonModule } from './modules/lesson.module'
import { VocabularyModule } from './modules/vocabulary.module'
import { QuestionModule } from './modules/question.module'
import { ExamModule } from './modules/exam.module'
import { ProgressModule } from './modules/progress.module'
import { LearnerProfileModule } from './modules/learner-profile.module'
import { TaxonomyModule } from './modules/taxonomy.module'
import { UploadModule } from './modules/upload.module'

import { RecommendationModule } from './modules/recommendation.module'
import { PaymentModule } from './modules/payment.module'
import { RedisCacheModule } from './infrastructure/cache/redis.module'

@Module({
  controllers: [
    NotificationController, 
    PlannerController,
    MockInterviewController,
    WritingController,
    DiscussionController
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisCacheModule,
    AuthModule,
    UserModule,
    RoleModule,
    LessonModule,
    VocabularyModule,
    QuestionModule,
    ExamModule,
    ProgressModule,
    LearnerProfileModule,
    TaxonomyModule,
    RecommendationModule,
    PaymentModule,
    UploadModule,
  ],
})
export class AppModule {}

