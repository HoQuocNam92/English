import { Body, Controller, Delete, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { NotificationService } from '../application/notification/notification.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { RegisterPushSubscriptionDto, RemovePushSubscriptionDto } from './http-dto/notification.dto'

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications/subscriptions')
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Post()
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterPushSubscriptionDto) {
    return this.notifications.register(user.sub, dto.token, dto.platform)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtPayload, @Body() dto: RemovePushSubscriptionDto) {
    await this.notifications.remove(user.sub, dto.token)
  }
}
