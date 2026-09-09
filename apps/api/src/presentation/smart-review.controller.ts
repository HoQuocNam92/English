import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Controller('smart-review')
@UseGuards(JwtAuthGuard)
export class SmartReviewController {
  constructor(private prisma: PrismaService) {}

  @Get('analysis')
  async getAnalysis(@Request() req: any) {
    const [summary, progress] = await Promise.all([
      this.prisma.progressSummaryCache.findUnique({ where: { learnerId: req.user.sub } }),
      this.prisma.learningProgress.findMany({
        where: { learnerId: req.user.sub }, orderBy: { averageScorePercent: 'asc' }, take: 10,
      }),
    ]);
    const weakTopics = Array.isArray(summary?.weakTopics) ? summary.weakTopics : [];
    return {
      weaknesses: weakTopics,
      lowScoreResources: progress.filter((item) => (item.averageScorePercent ?? 100) < 70),
      averageScore: Math.round(summary?.averageScorePercent ?? 0),
      improvement: Math.max(0, Math.round((summary?.averageScorePercent ?? 0) - 70)),
      evidenceCount: progress.length,
    };
  }

  @Get('focus-topics')
  async getFocusTopics(@Request() req: any) {
    const summary = await this.prisma.progressSummaryCache.findUnique({ where: { learnerId: req.user.sub } });
    const cached = Array.isArray(summary?.weakTopics) ? summary.weakTopics : [];
    if (cached.length) return cached;
    const progress = await this.prisma.learningProgress.findMany({
      where: { learnerId: req.user.sub, resourceType: 'lesson', completionPercent: { lt: 100 } },
      orderBy: [{ averageScorePercent: 'asc' }, { completionPercent: 'asc' }], take: 5,
    });
    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: progress.map((item) => item.resourceId) } },
      select: { id: true, title: true, keyConcepts: true, domain: { select: { name: true } } },
    });
    const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    return progress.map((item) => {
      const lesson = lessonMap.get(item.resourceId);
      return {
        topic: lesson?.keyConcepts[0] || lesson?.title || 'Bài học chưa hoàn thành',
        domain: lesson?.domain.name || null,
        score: item.averageScorePercent,
        completionPercent: Math.round(item.completionPercent),
        reason: item.averageScorePercent != null ? `Điểm hiện tại ${Math.round(item.averageScorePercent)}%` : `Mới hoàn thành ${Math.round(item.completionPercent)}%`,
      };
    });
  }

  @Get('recommended-lessons')
  async getRecommendedLessons(@Request() req: any) {
    const progress = await this.prisma.learningProgress.findMany({
      where: { learnerId: req.user.sub, resourceType: 'lesson', completionPercent: { lt: 100 } },
      orderBy: [{ averageScorePercent: 'asc' }, { completionPercent: 'asc' }], take: 5,
    });
    return this.prisma.lesson.findMany({
      where: { id: { in: progress.map((item) => item.resourceId) }, status: 'published' },
      select: { id: true, title: true, summary: true, estimatedMinutes: true },
    });
  }

  @Get('recommended-quizzes')
  async getRecommendedQuizzes(@Request() req: any) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { learnerId: req.user.sub, status: 'graded' }, orderBy: { scorePercent: 'asc' },
      include: { exam: { select: { id: true, title: true, durationMinutes: true } } }, take: 5,
    });
    if (attempts.length) return attempts.map((attempt) => ({ ...attempt.exam, lastScore: attempt.scorePercent }));
    const profile = await this.prisma.learnerProfile.findUnique({ where: { userId: req.user.sub }, include: { domains: true } });
    return this.prisma.exam.findMany({
      where: { status: 'published', ...(profile?.domains.length ? { domainId: { in: profile.domains.map((item) => item.domainId) } } : {}) },
      select: { id: true, title: true, durationMinutes: true, passingScorePercent: true, domain: { select: { name: true } } }, take: 5,
    });
  }

  @Post('start-session')
  async startSession(@Request() req: any, @Body() body: { topic?: string }) {
    const session = await this.prisma.learningSession.create({
      data: { userId: req.user.sub, sessionType: 'smart_review', timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening' },
    });
    return { sessionId: session.id, topic: body.topic, startedAt: session.startedAt };
  }
}
