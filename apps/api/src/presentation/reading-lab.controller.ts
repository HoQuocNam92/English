import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Controller('reading-lab')
@UseGuards(JwtAuthGuard)
export class ReadingLabController {
  constructor(private prisma: PrismaService) {}

  @Get('articles')
  async getArticles(@Query() query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const where: any = {
      type: 'technical_reading', status: 'published',
      ...(query.domainId ? { domainId: query.domainId } : {}),
      ...(query.levelId ? { levelId: query.levelId } : {}),
      ...(query.search ? { OR: [
        { title: { contains: String(query.search), mode: 'insensitive' } },
        { summary: { contains: String(query.search), mode: 'insensitive' } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where, include: { domain: true, level: true },
        orderBy: { publishedAt: 'desc' }, skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.lesson.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  @Get('articles/:id')
  async getArticle(@Param('id') id: string) {
    return this.prisma.lesson.findFirst({
      where: { id, type: 'technical_reading', status: 'published' },
      include: { sections: { orderBy: { order: 'asc' } }, domain: true, level: true, vocabularies: { include: { vocabulary: true } } },
    });
  }

  @Post('articles/:id/progress')
  async updateProgress(@Request() req: any, @Param('id') id: string, @Body() body: { readPercent: number, timeSpentSeconds: number }) {
    const percent = Math.min(100, Math.max(0, Number(body.readPercent) || 0));
    const lesson = await this.prisma.lesson.findFirst({ where: { id, type: 'technical_reading', status: 'published' } });
    if (!lesson) throw new Error('Reading article not found');
    const progress = await this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId: req.user.sub, resourceType: 'lesson', resourceId: id } },
      create: {
        learnerId: req.user.sub, resourceType: 'lesson', resourceId: id,
        status: percent >= 100 ? 'completed' : 'in_progress', completionPercent: percent,
        startedAt: new Date(), ...(percent >= 100 ? { completedAt: new Date() } : {}),
      },
      update: {
        status: percent >= 100 ? 'completed' : 'in_progress', completionPercent: percent,
        ...(percent >= 100 ? { completedAt: new Date() } : {}),
      },
    });
    await this.prisma.learningSession.create({
      data: {
        userId: req.user.sub, sessionType: 'reading', lessonId: id,
        endedAt: new Date(), durationSeconds: Math.max(0, Number(body.timeSpentSeconds) || 0),
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
      },
    });
    return progress;
  }

  @Get('categories')
  async getCategories() {
    return this.prisma.domain.findMany({
      where: { isActive: true, lessons: { some: { type: 'technical_reading', status: 'published' } } },
      select: { id: true, code: true, name: true, icon: true }, orderBy: { name: 'asc' },
    });
  }
}
