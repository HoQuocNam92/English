import { Controller, Get, Put, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';

class UpdateCareerTargetDto {
  @IsUUID() careerGoalId!: string;
}

@Controller('career-prep')
@UseGuards(JwtAuthGuard)
export class CareerPrepController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId: req.user.sub },
      include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: { include: { skills: { include: { lesson: true } } } } } } },
    });
    if (!profile) throw new NotFoundException('Chưa có hồ sơ học tập.');
    const target = profile.careerGoals[0]?.careerGoal;
    const lessonIds = target?.skills.flatMap((skill) => skill.lessonId ? [skill.lessonId] : []) ?? [];
    const progress = lessonIds.length ? await this.prisma.learningProgress.findMany({ where: { learnerId: req.user.sub, resourceType: 'lesson', resourceId: { in: lessonIds } } }) : [];
    const progressByLesson = new Map(progress.map((item) => [item.resourceId, item.completionPercent]));
    const skills = (target?.skills ?? []).map((skill) => ({ id: skill.id, name: skill.name, lessonId: skill.lessonId, lessonTitle: skill.lesson?.title ?? null, completionPercent: skill.lessonId ? progressByLesson.get(skill.lessonId) ?? 0 : 0 }));
    const readinessScore = skills.length ? Math.round(skills.reduce((sum, skill) => sum + skill.completionPercent, 0) / skills.length) : 0;
    return { profile: { level: profile.level, domains: profile.domains.map((item) => item.domain), targetCareerGoal: target ? { id: target.id, code: target.code, name: target.name, description: target.description } : null }, skills, readinessScore, evidence: { requiredSkills: skills.length, measuredLessons: progress.length } };
  }

  @Put('target')
  async updateTarget(@Request() req: any, @Body() body: UpdateCareerTargetDto) {
    const [profile, goal] = await Promise.all([
      this.prisma.learnerProfile.findUnique({ where: { userId: req.user.sub } }),
      this.prisma.careerGoal.findFirst({ where: { id: body.careerGoalId, isActive: true } }),
    ]);
    if (!profile) throw new NotFoundException('Chưa có hồ sơ học tập.');
    if (!goal) throw new NotFoundException('Mục tiêu nghề nghiệp không tồn tại.');
    await this.prisma.$transaction([
      this.prisma.learnerProfileCareerGoal.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.learnerProfileCareerGoal.create({ data: { profileId: profile.id, careerGoalId: goal.id } }),
    ]);
    return { success: true, careerGoal: { id: goal.id, code: goal.code, name: goal.name } };
  }
}
