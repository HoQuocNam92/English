import { Module } from '@nestjs/common'
import { LearnerProfilesService } from '../application/learner-profile/learner-profile.service'
import { LearnerProfilesController } from '../presentation/learner-profile.controller'

@Module({
  providers: [LearnerProfilesService],
  controllers: [LearnerProfilesController],
  exports: [LearnerProfilesService],
})
export class LearnerProfileModule {}