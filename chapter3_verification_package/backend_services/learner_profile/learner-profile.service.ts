import { Injectable, NotFoundException } from '@nestjs/common'
import { LevelCode } from '@prisma/client'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { CompleteOnboardingDto } from '../../presentation/http-dto/content.dto'

@Injectable()
export class LearnerProfilesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    const p = await this.prisma.learnerProfile.findUnique({ where: { userId }, include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } }, certGoals: { include: { certificate: true } } } })
    if (!p) throw new NotFoundException('Learner profile not found')
    return p
  }

  async upsert(userId: string, dto: any) {
    const level = dto.levelCode ? await this.prisma.level.findUnique({ where: { code: dto.levelCode } }) : null
    return this.prisma.learnerProfile.upsert({
      where: { userId },
      update: { bio: dto.bio, weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes, onboardingCompleted: dto.onboardingCompleted, ...(level && { levelId: level.id }) },
      create: { userId, levelId: level?.id ?? (await this.prisma.level.findFirst({ where: { code: 'beginner' } }))!.id, bio: dto.bio, weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes ?? 180 },
      include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } }, certGoals: { include: { certificate: true } } }
    })
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    // 1. Tìm level
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode as LevelCode } })

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

    // 4. Career goal (tuỳ chọn)
    if (dto.careerGoalCode) {
      const goal = await this.prisma.careerGoal.findUnique({ where: { code: dto.careerGoalCode } })
      if (goal) {
        await this.prisma.learnerProfileCareerGoal.deleteMany({ where: { profileId: profile.id } })
        await this.prisma.learnerProfileCareerGoal.create({ data: { profileId: profile.id, careerGoalId: goal.id } })
      }
    }

    // 5. Certificate goal (tuỳ chọn)
    if (dto.certificateCode) {
      const cert = await this.prisma.certificate.findFirst({ where: { OR: [{ code: dto.certificateCode }, { name: dto.certificateCode }] } })
      if (cert) {
        await this.prisma.learnerCertificateGoal.deleteMany({ where: { profileId: profile.id } })
        await this.prisma.learnerCertificateGoal.create({ data: { profileId: profile.id, certificateId: cert.id } })
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
}

