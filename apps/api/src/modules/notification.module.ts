import { Module } from '@nestjs/common'
import { NotificationService } from '../application/notification/notification.service'
import { NotificationController } from '../presentation/notification.controller'

import { LearningNotificationController } from '../presentation/learning-notification.controller'
import { ReminderJobController } from '../presentation/reminder-job.controller'

@Module({ providers: [NotificationService], controllers: [NotificationController, LearningNotificationController, ReminderJobController] })
export class NotificationModule {}
