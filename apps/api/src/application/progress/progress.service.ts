import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProgressResourceType, ProgressStatus } from '@prisma/client'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { TrackLessonProgressDto } from '../../presentation/http-dto/content.dto'

// ─── Badge definitions ────────────────────────────────────────────────────────
const BADGE_RULES = [
  { code: 'streak_3',    name: '🔥 3 Ngày Liên Tiếp',      description: 'Duy trì chuỗi học 3 ngày liên tục.',           check: (ctx) => ctx.currentStreak >= 3 },
  { code: 'streak_7',    name: '🔥 Tuần Lễ Kiên Trì',       description: 'Duy trì chuỗi học 7 ngày liên tục.',           check: (ctx) => ctx.currentStreak >= 7 },
  { code: 'streak_14',   name: '🔥 14 Ngày Liên Tiếp',      description: 'Học tập kiên trì 14 ngày không gián đoạn.',    check: (ctx) => ctx.currentStreak >= 14 },
  { code: 'streak_30',   name: '🏆 Tháng Học Bất Bại',      description: 'Duy trì chuỗi học 30 ngày liên tục.',          check: (ctx) => ctx.currentStreak >= 30 },
  { code: 'exp_100',     name: '⚡ Người Mới Tích Cực',      description: 'Đạt 100 điểm EXP đầu tiên.',                  check: (ctx) => ctx.totalExpPoints >= 100 },
  { code: 'exp_500',     name: '⚡ Học Viên Chăm Chỉ',       description: 'Tích lũy 500 điểm EXP.',                      check: (ctx) => ctx.totalExpPoints >= 500 },
  { code: 'exp_1000',    name: '⚡ Bậc Thầy EXP',            description: 'Tích lũy 1000 điểm EXP.',                     check: (ctx) => ctx.totalExpPoints >= 1000 },
  { code: 'lessons_1',   name: '📚 Bài Học Đầu Tiên',        description: 'Hoàn thành bài học đầu tiên.',                check: (ctx) => ctx.completedLessons >= 1 },
  { code: 'lessons_10',  name: '📚 Kho Từ Vựng',             description: 'Hoàn thành 10 bài học.',                      check: (ctx) => ctx.completedLessons >= 10 },
  { code: 'lessons_50',  name: '📚 Học Viên Xuất Sắc',       description: 'Hoàn thành 50 bài học.',                      check: (ctx) => ctx.completedLessons >= 50 },
]

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getMyProgress(learnerId: string) {
    await this.assertLearner(learnerId)
    const [progress, summary, recentAttempts] = await Promise.all([
      this.prisma.learningProgress.findMany({ where: { learnerId }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.progressSummaryCache.findUnique({ where: { learnerId } }),
      this.prisma.examAttempt.findMany({ where: { learnerId, status: { in: ['graded','submitted'] } }, include: { exam: { select: { title: true } } }, orderBy: { startedAt: 'desc' }, take: 10 })
    ])
    return { progress, summary, recentAttempts }
  }

  async upsertProgress(learnerId: string, dto: TrackLessonProgressDto) {
    await this.assertLearner(learnerId)
    await this.assertResourceExists(dto.resourceType, dto.resourceId)
    if (dto.completedLessonCount !== undefined && dto.totalLessonCount !== undefined && dto.completedLessonCount > dto.totalLessonCount) {
      throw new BadRequestException('So bai da hoan thanh khong duoc lon hon tong so bai')
    }
    const status = (dto.status ?? 'in_progress') as ProgressStatus
    const completedAt = status === 'completed' ? new Date() : null
    const result = await this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId, resourceType: dto.resourceType as ProgressResourceType, resourceId: dto.resourceId } },
      update: { status, completionPercent: dto.completionPercent, completedLessonCount: dto.completedLessonCount, totalLessonCount: dto.totalLessonCount, averageScorePercent: dto.averageScorePercent, completedAt },
      create: { learnerId, resourceType: dto.resourceType as ProgressResourceType, resourceId: dto.resourceId, status, completionPercent: dto.completionPercent, completedLessonCount: dto.completedLessonCount, totalLessonCount: dto.totalLessonCount, averageScorePercent: dto.averageScorePercent, startedAt: new Date(), completedAt }
    })
    if (status === 'completed') {
      await this.recordDailyStudy(learnerId, 30)
    }
    return result
  }

  async markLessonComplete(learnerId: string, lessonId: string) {
    await this.assertLearner(learnerId)
    await this.assertResourceExists('lesson', lessonId)
    const result = await this.prisma.learningProgress.upsert({
      where: { learnerId_resourceType_resourceId: { learnerId, resourceType: 'lesson', resourceId: lessonId } },
      update: { status: 'completed', completionPercent: 100, completedAt: new Date() },
      create: { learnerId, resourceType: 'lesson', resourceId: lessonId, status: 'completed', completionPercent: 100, startedAt: new Date(), completedAt: new Date() }
    })
    const gamification = await this.recordDailyStudy(learnerId, 20)
    return { ...result, gamification }
  }

  async getLearnerProgress(learnerId: string) { return this.getMyProgress(learnerId) }

  async recordDailyStudy(userId: string, baseExp = 20) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = await this.prisma.userStreak.findUnique({ where: { userId } })

    if (!streak) {
      streak = await this.prisma.userStreak.create({
        data: { userId, currentStreak: 1, maxStreak: 1, totalExpPoints: baseExp, weeklyPoints: baseExp, monthlyPoints: baseExp, lastStudyDate: today },
      })
      const newBadges = await this.checkAndUnlockBadges(userId, { currentStreak: 1, totalExpPoints: baseExp, completedLessons: 1 })
      return { streak: 1, expEarned: baseExp, totalExpPoints: baseExp, newBadges, alreadyCheckedIn: false }
    }

    const lastDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null
    if (lastDate) lastDate.setHours(0, 0, 0, 0)
    const diffDays = lastDate ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 999

    if (diffDays === 0) {
      const expEarned = Math.floor(baseExp * 0.5)
      if (expEarned > 0) {
        await this.prisma.userStreak.update({
          where: { userId },
          data: { totalExpPoints: { increment: expEarned }, weeklyPoints: { increment: expEarned }, monthlyPoints: { increment: expEarned } },
        })
        streak = { ...streak, totalExpPoints: streak.totalExpPoints + expEarned }
      }
      const newBadges = await this.checkAndUnlockBadges(userId, {
        currentStreak: streak.currentStreak,
        totalExpPoints: streak.totalExpPoints,
        completedLessons: await this.countCompletedLessons(userId),
      })
      return { streak: streak.currentStreak, expEarned, totalExpPoints: streak.totalExpPoints, newBadges, alreadyCheckedIn: true }
    }

    const newStreak = diffDays === 1 ? streak.currentStreak + 1 : 1
    const newMax = Math.max(streak.maxStreak, newStreak)
    const streakBonus = Math.floor(newStreak / 5) * 10
    const expEarned = baseExp + streakBonus

    const updated = await this.prisma.userStreak.update({
      where: { userId },
      data: { currentStreak: newStreak, maxStreak: newMax, totalExpPoints: { increment: expEarned }, weeklyPoints: { increment: expEarned }, monthlyPoints: { increment: expEarned }, lastStudyDate: today },
    })

    const newBadges = await this.checkAndUnlockBadges(userId, {
      currentStreak: newStreak,
      totalExpPoints: updated.totalExpPoints,
      completedLessons: await this.countCompletedLessons(userId),
    })

    return { streak: newStreak, expEarned, totalExpPoints: updated.totalExpPoints, newBadges, alreadyCheckedIn: false }
  }

  private async checkAndUnlockBadges(userId: string, ctx: { currentStreak: number; totalExpPoints: number; completedLessons: number }) {
    const existing = await this.prisma.userBadge.findMany({ where: { userId }, select: { badgeCode: true } })
    const existingCodes = new Set(existing.map((b) => b.badgeCode))
    const toUnlock = BADGE_RULES.filter((rule) => !existingCodes.has(rule.code) && rule.check(ctx))
    if (toUnlock.length === 0) return []
    await this.prisma.userBadge.createMany({
      data: toUnlock.map((rule) => ({ userId, badgeCode: rule.code, badgeName: rule.name, description: rule.description })),
      skipDuplicates: true,
    })
    return toUnlock.map((r) => ({ badgeCode: r.code, badgeName: r.name }))
  }

  private async countCompletedLessons(userId: string) {
    return this.prisma.learningProgress.count({ where: { learnerId: userId, resourceType: 'lesson', status: 'completed' } })
  }

  private async assertLearner(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: 'active', userRoles: { some: { role: { code: 'learner', isActive: true } } } },
      select: { id: true, learnerProfile: { select: { id: true } } },
    })
    if (!user) throw new ForbiddenException('Chi hoc vien moi co tien do hoc tap')
    if (!user.learnerProfile) throw new BadRequestException('Tai khoan hoc vien chua co learner profile')
  }

  private async assertResourceExists(type: TrackLessonProgressDto['resourceType'], id: string) {
    const exists = type === 'lesson'
      ? await this.prisma.lesson.findUnique({ where: { id }, select: { id: true } })
      : type === 'domain'
        ? await this.prisma.domain.findUnique({ where: { id }, select: { id: true } })
        : await this.prisma.certificate.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new NotFoundException(`Khong tim thay ${type} tuong ung voi resourceId`)
  }
}
