import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';

@ApiTags('Gamification & Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('top')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng Học viên theo điểm kinh nghiệm EXP (tuần/tháng/toàn thời gian)' })
  async getLeaderboard(@Query('period') period?: 'weekly' | 'monthly' | 'all') {
    let orderByField: 'weeklyPoints' | 'monthlyPoints' | 'totalExpPoints' = 'weeklyPoints';
    if (period === 'monthly') orderByField = 'monthlyPoints';
    if (period === 'all') orderByField = 'totalExpPoints';

    const topStreaks = await this.prisma.userStreak.findMany({
      orderBy: { [orderByField]: 'desc' },
      take: 10,
      include: {
        user: {
          include: {
            userDetail: true,
          },
        },
      },
    });

    return topStreaks.map((s, idx) => ({
      rank: idx + 1,
      userId: s.userId,
      displayName: s.user.userDetail?.displayName || s.user.email.split('@')[0],
      avatarUrl: s.user.userDetail?.avatarUrl || null,
      expPoints: s[orderByField],
      currentStreak: s.currentStreak,
    }));
  }

  @Get('streaks/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin Chuỗi ngày học Streak, Điểm EXP và Huy hiệu cá nhân' })
  async getMyStreak(@CurrentUser() user: JwtPayload) {
    let streak = await this.prisma.userStreak.findUnique({
      where: { userId: user.sub },
    });

    if (!streak) {
      streak = await this.prisma.userStreak.create({
        data: {
          userId: user.sub,
          currentStreak: 1,
          maxStreak: 1,
          totalExpPoints: 50,
          weeklyPoints: 50,
          monthlyPoints: 50,
          lastStudyDate: new Date(),
        },
      });
    }

    const badges = await this.prisma.userBadge.findMany({
      where: { userId: user.sub },
      orderBy: { unlockedAt: 'desc' },
    });

    return {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      totalExpPoints: streak.totalExpPoints,
      weeklyPoints: streak.weeklyPoints,
      monthlyPoints: streak.monthlyPoints,
      lastStudyDate: streak.lastStudyDate,
      badges: badges.map(b => ({
        badgeCode: b.badgeCode,
        badgeName: b.badgeName,
        description: b.description,
        unlockedAt: b.unlockedAt,
      })),
    };
  }

  @Post('streaks/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Điểm danh học hàng ngày (Tăng chuỗi Streak & thưởng EXP)' })
  async checkInDaily(@CurrentUser() user: JwtPayload) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await this.prisma.userStreak.findUnique({
      where: { userId: user.sub },
    });

    if (!streak) {
      streak = await this.prisma.userStreak.create({
        data: {
          userId: user.sub,
          currentStreak: 1,
          maxStreak: 1,
          totalExpPoints: 50,
          weeklyPoints: 50,
          monthlyPoints: 50,
          lastStudyDate: today,
        },
      });
      return { streak: 1, pointsEarned: 50, message: '🎉 Khởi tạo chuỗi Streak thành công! Bạn nhận được +50 EXP.' };
    }

    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    const diffDays = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 999;

    if (diffDays === 0) {
      return { streak: streak.currentStreak, pointsEarned: 0, message: 'Hôm nay bạn đã hoàn thành điểm danh rồi!' };
    }

    let newStreak = 1;
    if (diffDays === 1) {
      newStreak = streak.currentStreak + 1;
    }

    const newMax = Math.max(streak.maxStreak, newStreak);
    const expGained = 50 + (newStreak > 1 ? 10 : 0);

    const updated = await this.prisma.userStreak.update({
      where: { userId: user.sub },
      data: {
        currentStreak: newStreak,
        maxStreak: newMax,
        totalExpPoints: streak.totalExpPoints + expGained,
        weeklyPoints: streak.weeklyPoints + expGained,
        monthlyPoints: streak.monthlyPoints + expGained,
        lastStudyDate: today,
      },
    });

    return {
      currentStreak: updated.currentStreak,
      pointsEarned: expGained,
      totalExpPoints: updated.totalExpPoints,
      message: `🔥 Tuyệt vời! Bạn đã duy trì chuỗi Streak ${updated.currentStreak} ngày và nhận +${expGained} EXP!`,
    };
  }
}
