import { Module } from '@nestjs/common'
import { NotificationService } from '../application/notification/notification.service'
import { NotificationController } from '../presentation/notification.controller'

@Module({ providers: [NotificationService], controllers: [NotificationController] })
export class NotificationModule {}
