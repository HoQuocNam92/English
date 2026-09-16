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

import { RedisCacheModule } from './infrastructure/cache/redis.module'

import { ReadingLabController } from './presentation/reading-lab.controller';
import { PlacementTestController } from './presentation/placement-test.controller';
import { RecommendationModule } from './modules/recommendation.module';
import { CareerPrepController } from './presentation/career-prep.controller';

@Module({
  controllers: [
    ReadingLabController,
    PlacementTestController,
    CareerPrepController,
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
    UploadModule,
    RecommendationModule,
  ],
})
export class AppModule {}

