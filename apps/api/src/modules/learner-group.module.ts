import { Module } from '@nestjs/common'
import { LearnerGroupGuard } from '../infrastructure/auth/learner-group.guard'
import { LearnerGroupService } from '../application/learner-group/learner-group.service'
import { LearnerGroupController } from '../presentation/learner-group.controller'
@Module({ providers: [LearnerGroupService, LearnerGroupGuard], controllers: [LearnerGroupController] })
export class LearnerGroupModule {}
