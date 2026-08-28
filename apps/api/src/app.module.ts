import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesModule } from './modules/roles/roles.module'
import { VocabularyModule } from './modules/vocabulary/vocabulary.module'
import { LessonsModule } from './modules/lessons/lessons.module'
import { QuestionsModule } from './modules/questions/questions.module'
import { ExamsModule } from './modules/exams/exams.module'
import { LearnerProfilesModule } from './modules/learner-profiles/learner-profiles.module'
import { ProgressModule } from './modules/progress/progress.module'
import { ReportsModule } from './modules/reports/reports.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    VocabularyModule,
    LessonsModule,
    QuestionsModule,
    ExamsModule,
    LearnerProfilesModule,
    ProgressModule,
    ReportsModule,
  ],
})
export class AppModule {}
