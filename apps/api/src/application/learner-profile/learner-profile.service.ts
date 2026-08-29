import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

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
