import { Controller, Post, Headers, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { timingSafeEqual } from 'node:crypto'
import { NotificationService } from '../application/notification/notification.service'

@Controller('internal/jobs')
export class ReminderJobController {
  constructor(private readonly notifications: NotificationService, private readonly config: ConfigService) {}
  @Post('learning-reminders')
  run(@Headers('x-scheduler-key') supplied?: string) {
    const expected = this.config.get<string>('LEARNING_REMINDER_JOB_KEY')
    if (!expected || expected.length < 32) throw new ServiceUnavailableException('Scheduler key is not configured')
    const value = Buffer.from(supplied || '')
    const key = Buffer.from(expected)
    if (value.length !== key.length || !timingSafeEqual(value, key)) throw new UnauthorizedException()
    return this.notifications.dispatchLearningReminders()
  }
}
