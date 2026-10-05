import { Controller, Get, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import { NotificationService } from '../application/notification/notification.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class LearningNotificationController {
  constructor(private readonly notifications: NotificationService) {}
  @Get('pending')
  pending(@CurrentUser() user: JwtPayload) { return this.notifications.getPending(user.sub) }
  @Patch(':id/read')
  read(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.markRead(user.sub, id)
  }
}
