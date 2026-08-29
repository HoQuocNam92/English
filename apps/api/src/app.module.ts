import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { AuthModule } from './modules/auth.module'
import { UserModule } from './modules/user.module'
import { RoleModule } from './modules/role.module'
import { LessonModule } from './modules/lesson.module'
import { VocabularyModule } from './modules/vocabulary.module'
import { ExamModule } from './modules/exam.module'
import { ProgressModule } from './modules/progress.module'
import { LearnerProfileModule } from './modules/learner-profile.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    LessonModule,
    VocabularyModule,
    ExamModule,
    ProgressModule,
    LearnerProfileModule,
  ],
})
export class AppModule {}
