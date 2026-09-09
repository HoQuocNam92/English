import { Controller, Get, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Post('sessions/start')
  async startSession(@Request() req: any, @Body() body: { sessionType: string, lessonId?: string }) {
    return this.prisma.learningSession.create({
      data: {
        userId: req.user.sub,
        sessionType: body.sessionType,
        lessonId: body.lessonId,
        startedAt: new Date(),
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
      }
    });
  }

  @Post('sessions/:sessionId/end')
  async endSession(@Request() req: any, @Param('sessionId') sessionId: string, @Body() body: { durationSeconds: number }) {
    return this.prisma.learningSession.updateMany({
      where: { id: sessionId, userId: req.user.sub },
      data: { endedAt: new Date(), durationSeconds: body.durationSeconds }
    });
  }

  @Get('sessions/overview')
  async getOverview(@Request() req: any) {
    const [aggregate, activeDays, streak, completedLessonsCount] = await Promise.all([
      this.prisma.learningSession.aggregate({ where: { userId: req.user.sub }, _sum: { durationSeconds: true } }),
      this.prisma.learningSession.groupBy({ by: ['studyDate'], where: { userId: req.user.sub, durationSeconds: { gt: 0 } } }),
      this.prisma.userStreak.findUnique({ where: { userId: req.user.sub } }),
      this.prisma.learningProgress.count({ where: { learnerId: req.user.sub, resourceType: 'lesson', status: 'completed' } }),
    ]);
    const totalSeconds = aggregate._sum.durationSeconds ?? 0;
    const format = (seconds: number) => {
      const minutes = Math.round(seconds / 60);
      return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
    };
    return {
      totalTimeFormatted: format(totalSeconds),
      avgTimePerDayFormatted: format(activeDays.length ? totalSeconds / activeDays.length : 0),
      currentStreakDays: streak?.currentStreak ?? 0,
      maxStreakDays: streak?.maxStreak ?? 0,
      completedLessonsCount,
      activeDaysCount: activeDays.length,
    };
  }

  @Get('sessions/trend')
  async getTrend(@Request() req: any, @Query('period') period: string) {
    const days = period === 'month' ? 30 : period === 'year' ? 365 : 7;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - days + 1);
    const sessions = await this.prisma.learningSession.groupBy({
      by: ['studyDate'], where: { userId: req.user.sub, studyDate: { gte: from } },
      _sum: { durationSeconds: true }, orderBy: { studyDate: 'asc' },
    });
    return sessions.map((item) => ({
      date: item.studyDate.toISOString().slice(0, 10),
      dayLabel: item.studyDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      hours: Number(((item._sum.durationSeconds ?? 0) / 3600).toFixed(2)),
    }));
  }

  @Get('sessions/active-hours')
  async getActiveHours(@Request() req: any) {
    const groups = await this.prisma.learningSession.groupBy({
      by: ['timeOfDay'], where: { userId: req.user.sub }, _sum: { durationSeconds: true },
    });
    const totals = new Map(groups.map((group) => [group.timeOfDay, group._sum.durationSeconds ?? 0]));
    const total = groups.reduce((sum, group) => sum + (group._sum.durationSeconds ?? 0), 0);
    const percent = (key: string) => total ? Math.round(((totals.get(key) ?? 0) / total) * 100) : 0;
    const slots = [
      { key: 'morning', label: 'buổi sáng', value: percent('morning') },
      { key: 'afternoon', label: 'buổi chiều', value: percent('afternoon') },
      { key: 'evening', label: 'buổi tối', value: percent('evening') },
      { key: 'night', label: 'ban đêm', value: percent('night') },
    ];
    const best = [...slots].sort((a, b) => b.value - a.value)[0];
    return {
      morningPercent: slots[0].value, afternoonPercent: slots[1].value,
      eveningPercent: slots[2].value, nightPercent: slots[3].value,
      aiInsight: total ? `Bạn dành nhiều thời gian học nhất vào ${best.label} (${best.value}%).` : 'Chưa có đủ dữ liệu phiên học để phân tích khung giờ.',
      evidenceSeconds: total,
    };
  }

  @Get('sessions/heatmap')
  async getHeatmap(@Request() req: any) {
    const from = new Date();
    from.setDate(from.getDate() - 364);
    const sessions = await this.prisma.learningSession.groupBy({
      by: ['studyDate'], where: { userId: req.user.sub, studyDate: { gte: from } },
      _sum: { durationSeconds: true }, orderBy: { studyDate: 'asc' },
    });
    return sessions.map((item) => {
      const minutes = Math.round((item._sum.durationSeconds ?? 0) / 60);
      return { date: item.studyDate.toISOString().slice(0, 10), minutes, intensityLevel: minutes === 0 ? 0 : Math.min(4, Math.ceil(minutes / 30)) };
    });
  }
}
