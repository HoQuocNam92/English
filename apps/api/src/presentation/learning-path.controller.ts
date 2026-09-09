import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { GroqService } from '../application/ai-chat/groq.service';
import { RequirePermissions } from './decorators/require-permissions.decorator';

@Controller('learning-paths')
@UseGuards(JwtAuthGuard)
export class LearningPathController {
  constructor(
    private prisma: PrismaService,
    private groq: GroqService,
  ) {}

  @Post('generate')
  async generatePath(
    @Request() req: any,
    @Body() body: { careerGoal: string; currentLevel: string; minutesPerDay?: number; generationMode?: 'system' | 'ai' },
  ) {
    return this.generateForUser(req.user.sub, body);
  }

  @Post('admin/generate')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:manage')
  async generatePathForLearner(@Body() body: { userId: string; careerGoal: string; currentLevel: string; minutesPerDay?: number }) {
    return this.generateForUser(body.userId, body);
  }

  @Get('admin')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:read')
  async getAllPaths() {
    return this.prisma.learningPath.findMany({
      include: { user: { include: { userDetail: true } }, modules: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateForUser(userId: string, body: { careerGoal: string; currentLevel: string; minutesPerDay?: number; generationMode?: 'system' | 'ai' }) {
    const minutesPerDay = body.minutesPerDay ?? 30;

    // 1. Fetch learner profile with full context
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId },
      include: {
        level: true,
        domains: { include: { domain: true } },
        careerGoals: { include: { careerGoal: true } },
      },
    });

    // 2. Resolve career goal from DB
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.careerGoal);
    const careerGoal = await this.prisma.careerGoal.findFirst({
      where: {
        OR: [
          ...(isUuid ? [{ id: body.careerGoal }] : []),
          { code: { equals: body.careerGoal, mode: 'insensitive' } },
          { name: { equals: body.careerGoal, mode: 'insensitive' } },
        ],
      },
      include: { skills: true },
    });

    // 3. Fetch candidate lessons (matching career goal skills + learner domains)
    const domainIds = profile?.domains.map((d) => d.domainId) ?? [];
    const skillLessonIds = careerGoal?.skills
      .map((s) => s.lessonId)
      .filter((id): id is string => Boolean(id)) ?? [];

    const lessons = await this.prisma.lesson.findMany({
      where: {
        status: 'published',
        OR: [
          ...(skillLessonIds.length ? [{ id: { in: skillLessonIds } }] : []),
          ...(domainIds.length ? [{ domainId: { in: domainIds } }] : []),
          // Fallback: any published lesson if no match
          ...(skillLessonIds.length === 0 && domainIds.length === 0 ? [{ status: 'published' as const }] : []),
        ],
      },
      include: { domain: true, level: true },
      orderBy: [{ level: { order: 'asc' } }, { estimatedMinutes: 'asc' }],
      take: 12,
    });

    // 4. Fetch learner's existing progress for these lessons
    const existingProgress = await this.prisma.learningProgress.findMany({
      where: {
        learnerId: userId,
        resourceType: 'lesson',
        resourceId: { in: lessons.map((l) => l.id) },
      },
    });
    const progressMap = new Map(existingProgress.map((p) => [p.resourceId, p]));

    // 5. Filter out 100%-completed lessons
    const availableLessons = lessons.filter(
      (l) => (progressMap.get(l.id)?.completionPercent ?? 0) < 100,
    );

    if (!availableLessons.length) {
      return {
        modules: [],
        aiPlan: null,
        message: 'Bạn đã hoàn thành tất cả bài học phù hợp!',
      };
    }

    // 6. Build learner context for Groq
    const weeklyTargetMinutes = profile?.weeklyStudyTargetMinutes ?? minutesPerDay * 5;
    const learnerLevel = profile?.level?.name ?? body.currentLevel;
    const learnerDomains = profile?.domains.map((d) => d.domain.name) ?? [];
    const goalName = careerGoal?.name ?? body.careerGoal;

    // 7. Call Groq for AI-powered path generation
    let aiPlan: any = null;
    try {
      if (body.generationMode === 'system') throw new Error('SYSTEM_PATH_SELECTED');
      aiPlan = await this.groq.generatePath({
        careerGoal: goalName,
        level: learnerLevel,
        minutesPerDay,
        weeklyTargetMinutes,
        learnerDomains,
        lessons: availableLessons.map((l) => ({
          id: l.id,
          title: l.title,
          domain: l.domain.name,
          level: l.level.name,
          estimatedMinutes: l.estimatedMinutes,
          summary: l.summary,
          keyConcepts: l.keyConcepts ?? [],
          completionPercent: progressMap.get(l.id)?.completionPercent ?? 0,
          averageScore: progressMap.get(l.id)?.averageScorePercent ?? null,
        })),
      });
    } catch (err) {
      if ((err as Error).message !== 'SYSTEM_PATH_SELECTED') {
        console.error('[LearningPath] Groq generatePath failed, falling back to rule-based order:', err);
      }
    }

    // 8. Build ordered module list from AI plan (or fallback to original DB order)
    const lessonById = new Map(availableLessons.map((l) => [l.id, l]));
    const usedIds = new Set<string>();

    type ModuleItem = {
      lesson: (typeof availableLessons)[number];
      reason: string;
      priority: string;
      week: number;
      theme: string;
    };

    const orderedModules: ModuleItem[] = [];

    if (aiPlan?.weeklyPlan?.length) {
      for (const week of aiPlan.weeklyPlan) {
        for (const item of week.lessons) {
          const lesson = lessonById.get(item.lessonId);
          if (lesson && !usedIds.has(lesson.id)) {
            orderedModules.push({
              lesson,
              reason: item.reason ?? 'Bài học phù hợp với mục tiêu.',
              priority: item.priority ?? 'medium',
              week: week.week,
              theme: week.theme,
            });
            usedIds.add(lesson.id);
          }
        }
      }
    }

    // Append any lessons AI missed (safety net)
    let fallbackWeek = orderedModules.length > 0
      ? orderedModules[orderedModules.length - 1].week + 1
      : 1;
    for (const lesson of availableLessons) {
      if (!usedIds.has(lesson.id)) {
        orderedModules.push({
          lesson,
          reason: 'Bài học bổ sung phù hợp với lĩnh vực của bạn.',
          priority: 'medium',
          week: fallbackWeek,
          theme: lesson.domain.name,
        });
        fallbackWeek++;
      }
    }

    // 9. Save to DB
    const savedPath = await this.prisma.learningPath.create({
      data: {
        userId,
        careerGoal: goalName,
        currentLevel: body.currentLevel,
        title: `Lộ trình ${goalName}`,
        modules: {
          create: orderedModules.map((item, index) => ({
            order: index + 1,
            title: item.lesson.title,
            description: `${item.lesson.domain.name} · ${item.lesson.estimatedMinutes} phút · Tuần ${item.week}: ${item.theme} | ${item.reason}`,
            status: index === 0 ? 'current' : 'locked',
            progressPercent: progressMap.get(item.lesson.id)?.completionPercent ?? 0,
            currentLessonId: item.lesson.id,
          })),
        },
      },
      include: { modules: { orderBy: { order: 'asc' } } },
    });

    // 10. Return enriched response with AI plan for frontend
    return {
      ...savedPath,
      aiPlan: aiPlan
        ? {
            estimatedWeeks: aiPlan.estimatedWeeks,
            overview: aiPlan.overview,
            studyTips: aiPlan.studyTips ?? [],
            weeklyPlan: (aiPlan.weeklyPlan ?? []).map((week: any) => ({
              week: week.week,
              theme: week.theme,
              lessons: (week.lessons ?? [])
                .filter((item: any) => lessonById.has(item.lessonId))
                .map((item: any) => {
                  const l = lessonById.get(item.lessonId)!;
                  return {
                    lessonId: item.lessonId,
                    title: item.title,
                    reason: item.reason,
                    priority: item.priority,
                    domain: l.domain.name,
                    estimatedMinutes: l.estimatedMinutes,
                    completionPercent: progressMap.get(l.id)?.completionPercent ?? 0,
                  };
                }),
            })),
          }
        : null,
    };
  }

  @Get('me')
  async getMyPath(@Request() req: any) {
    return this.prisma.learningPath.findFirst({
      where: { userId: req.user.sub },
      include: { modules: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
