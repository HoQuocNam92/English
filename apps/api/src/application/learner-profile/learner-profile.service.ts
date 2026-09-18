import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { CompleteOnboardingDto } from '../../presentation/http-dto/content.dto'

@Injectable()
export class LearnerProfilesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    await this.assertLearner(userId)
    const p = await this.prisma.learnerProfile.findUnique({ where: { userId }, include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } }, certGoals: { include: { certificate: true } } } })
    if (!p) throw new NotFoundException('Learner profile not found')
    return p
  }

  async upsert(userId: string, dto: any) {
    await this.assertLearner(userId)
    const level = dto.levelCode ? await this.prisma.level.findUnique({ where: { code: dto.levelCode } }) : null
    const fallbackLevel = level ?? await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
    if (!fallbackLevel) throw new BadRequestException('Hệ thống chưa cấu hình cấp độ học tập')
    return this.prisma.learnerProfile.upsert({
      where: { userId },
      update: { bio: dto.bio, weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes, onboardingCompleted: dto.onboardingCompleted, ...(level && { levelId: level.id }) },
      create: { userId, levelId: fallbackLevel.id, bio: dto.bio, weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes ?? 180 },
      include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } }, certGoals: { include: { certificate: true } } }
    })
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    await this.assertLearner(userId)
    // 1. Tìm level
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode as any } })

    // 2. Upsert profile với level + onboardingCompleted
    const profile = await this.prisma.learnerProfile.upsert({
      where: { userId },
      update: {
        levelId: level?.id,
        weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes ?? 120,
        onboardingCompleted: true,
      },
      create: {
        userId,
        levelId: level?.id ?? (await this.prisma.level.findFirst({ where: { code: 'beginner' } }))!.id,
        weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes ?? 120,
        onboardingCompleted: true,
      },
    })

    // 3. Cập nhật domains
    const domains = await this.prisma.domain.findMany({ where: { code: { in: dto.domainCodes } } })
    await this.prisma.learnerProfileDomain.deleteMany({ where: { profileId: profile.id } })
    if (domains.length > 0) {
      await this.prisma.learnerProfileDomain.createMany({
        data: domains.map(d => ({ profileId: profile.id, domainId: d.id }))
      })
    }

    // 4. Career goals (mảng, tuỳ chọn)
    await this.prisma.learnerProfileCareerGoal.deleteMany({ where: { profileId: profile.id } })
    if (dto.careerGoalCodes && dto.careerGoalCodes.length > 0) {
      const goals = await this.prisma.careerGoal.findMany({ where: { code: { in: dto.careerGoalCodes } } })
      if (goals.length > 0) {
        await this.prisma.learnerProfileCareerGoal.createMany({
          data: goals.map(g => ({ profileId: profile.id, careerGoalId: g.id }))
        })
      }
    }

    // 5. Certificate goals (mảng, tuỳ chọn)
    await this.prisma.learnerCertificateGoal.deleteMany({ where: { profileId: profile.id } })
    if (dto.certificateCodes && dto.certificateCodes.length > 0) {
      const certs = await this.prisma.certificate.findMany({ where: { code: { in: dto.certificateCodes } } })
      if (certs.length > 0) {
        await this.prisma.learnerCertificateGoal.createMany({
          data: certs.map(c => ({ profileId: profile.id, certificateId: c.id }))
        })
      }
    }

    return this.findByUser(userId)
  }

  async updateDomains(userId: string, domainCodes: string[]) {
    const profile = await this.findByUser(userId)
    await this.prisma.learnerProfileDomain.deleteMany({ where: { profileId: profile.id } })
    const domains = await this.prisma.domain.findMany({ where: { code: { in: domainCodes } } })
    await this.prisma.learnerProfileDomain.createMany({ data: domains.map(d => ({ profileId: profile.id, domainId: d.id })) })
    return this.findByUser(userId)
  }

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100)
    const { levelCode, domainCode } = params
    const skip = (page - 1) * limit
    const where: any = {}
    if (levelCode) where.level = { code: levelCode }
    if (domainCode) where.domains = { some: { domain: { code: domainCode } } }
    const [data, total] = await Promise.all([
      this.prisma.learnerProfile.findMany({ where, skip, take: limit, include: { user: { include: { userDetail: true } }, level: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.learnerProfile.count({ where })
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  private async assertLearner(userId: string) {
    const learner = await this.prisma.user.findFirst({
      where: { id: userId, userRoles: { some: { role: { code: 'learner', isActive: true } } } },
      select: { id: true },
    })
    if (!learner) throw new ForbiddenException('Admin và giảng viên không có learner profile')
  }
}

