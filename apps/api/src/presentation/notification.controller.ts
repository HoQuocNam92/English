import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'system' })
  @IsEnum(['system', 'lesson_complete', 'streak', 'flash_sale', 'achievement', 'reminder'])
  type: string;

  @ApiProperty({ example: 'Bạn có bài học mới!' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Hãy hoàn thành bài AWS S3 hôm nay!' })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string; // null = broadcast to all

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Learner: get own notifications ─────────────────────────────────────────
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của học viên hiện tại' })
  async getMyNotifications(
    @CurrentUser() user: JwtPayload,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const where: any = { userId: user.sub };
    if (unreadOnly === 'true') where.isRead = false;
    
    const notifications = await this.prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.sub },
          { userId: null }, // broadcast
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  }

  @Patch('my/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu 1 thông báo đã đọc' })
  async markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.prisma.notification.updateMany({
      where: { id, OR: [{ userId: user.sub }, { userId: null }] },
      data: { isRead: true },
    });
    return { success: true };
  }

  @Patch('my/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  async markAllRead(@CurrentUser() user: JwtPayload) {
    await this.prisma.notification.updateMany({
      where: { OR: [{ userId: user.sub }, { userId: null }], isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  // ─── Admin: manage notifications ─────────────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('notifications:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Lấy tất cả thông báo' })
  async findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.notification.count(),
    ]);
    return { notifications, total, page: parseInt(page), limit: parseInt(limit) };
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('notifications:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Tạo thông báo mới (broadcast hoặc cho user cụ thể)' })
  async create(@Body() dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        userId: dto.userId || null,
        actionUrl: dto.actionUrl,
      },
    });
    return notification;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('notifications:manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Xóa thông báo' })
  async delete(@Param('id') id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }
}
