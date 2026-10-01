import { Module } from '@nestjs/common'
import { LearnerGroupService } from '../application/learner-group/learner-group.service'
import { LearnerGroupController } from '../presentation/learner-group.controller'
@Module({ providers: [LearnerGroupService], controllers: [LearnerGroupController] })
export class LearnerGroupModule {}
