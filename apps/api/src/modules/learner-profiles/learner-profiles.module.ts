import { Module } from '@nestjs/common'
import { LearnerProfilesService } from './learner-profiles.service'
import { LearnerProfilesController } from './presentation/controllers/learner-profiles.controller'
@Module({ providers: [LearnerProfilesService], controllers: [LearnerProfilesController] })
export class LearnerProfilesModule {}
