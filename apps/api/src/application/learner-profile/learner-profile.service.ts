import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { CompleteOnboardingDto, UpdateLearnerGoalsDto } from '../../presentation/http-dto/content.dto'
import { vietnamPeriods } from '../progress/learning-agenda.service'

@Injectable()
export class LearnerProfilesService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    await this.assertLearner(userId)
    const p = await this.prisma.learnerProfile.findUnique({ where: { userId }, include: { level: true, domains: { include: { domain: true } }, certGoals: { include: { certificate: true } }, careerGoals: { include: { careerGoal: true } } } })
    if (!p) throw new NotFoundException('Không tìm thấy hồ sơ học viên')
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
      include: { level: true, domains: { include: { domain: true } }, certGoals: { include: { certificate: true } } }
    })
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    await this.assertLearner(userId)
    this.assertCompleteGoal(dto.learningGoal, dto.domainCodes?.length ?? 0, dto.certificateCodes?.length ?? 0)
    if (dto.reminderTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dto.reminderTime)) {
      throw new BadRequestException('Giờ nhắc học phải có định dạng HH:mm')
    }

    const requestedDomainCodes = [...new Set(dto.domainCodes ?? [])]
    const requestedCertificateCodes = [...new Set(dto.certificateCodes ?? [])]
    const requestedCareerGoalCodes = [...new Set(dto.careerGoalCodes ?? [])]
    const [selectedDomains, selectedCertificates, selectedCareerGoals] = await Promise.all([
      requestedDomainCodes.length
        ? this.prisma.domain.findMany({ where: { code: { in: requestedDomainCodes }, isActive: true } })
        : Promise.resolve([]),
      requestedCertificateCodes.length
        ? this.prisma.certificate.findMany({ where: { code: { in: requestedCertificateCodes }, isActive: true } })
        : Promise.resolve([]),
      requestedCareerGoalCodes.length
        ? this.prisma.careerGoal.findMany({ where: { code: { in: requestedCareerGoalCodes }, isActive: true } })
        : Promise.resolve([]),
    ])
    if (selectedDomains.length !== requestedDomainCodes.length) {
      throw new BadRequestException('Có chuyên ngành không tồn tại hoặc đã ngừng hoạt động')
    }
    if (selectedCertificates.length !== requestedCertificateCodes.length) {
      throw new BadRequestException('Có chứng chỉ không tồn tại hoặc đã ngừng hoạt động')
    }
    if (selectedCareerGoals.length !== requestedCareerGoalCodes.length) throw new BadRequestException('Có mục tiêu nghề nghiệp không tồn tại hoặc đã ngừng hoạt động')
    // 1. Tìm level (mặc định beginner nếu không cung cấp)
    const targetLevelCode = (dto.levelCode ? dto.levelCode.toLowerCase() : 'beginner') as any
    const level = (await this.prisma.level.findUnique({ where: { code: targetLevelCode } })) ??
      (await this.prisma.level.findFirst({ where: { code: 'beginner' } }))

    // 2. Upsert profile với level + onboardingCompleted
    const profile = await this.prisma.learnerProfile.upsert({
      where: { userId },
      update: {
        levelId: level?.id,
        weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes ?? 120,
        onboardingCompleted: true,
        learningGoal: dto.learningGoal,
        learningPathMode: dto.learningPathMode ?? 'smart',
        dailyVocabularyTarget: dto.dailyVocabularyTarget ?? 20,
        weeklyExamTarget: dto.weeklyExamTarget ?? 2,
        dailyStudyTargetMinutes: dto.dailyStudyTargetMinutes ?? 30,
        reminderTime: dto.reminderTime || null,
        reminderEnabled: dto.reminderEnabled ?? false,
      },
      create: {
        userId,
        levelId: level?.id ?? '',
        weeklyStudyTargetMinutes: dto.weeklyStudyTargetMinutes ?? 120,
        onboardingCompleted: true,
        learningGoal: dto.learningGoal,
        learningPathMode: dto.learningPathMode ?? 'smart',
        dailyVocabularyTarget: dto.dailyVocabularyTarget ?? 20,
        weeklyExamTarget: dto.weeklyExamTarget ?? 2,
        dailyStudyTargetMinutes: dto.dailyStudyTargetMinutes ?? 30,
        reminderTime: dto.reminderTime || null,
        reminderEnabled: dto.reminderEnabled ?? false,
      },
    })

    // 3. Cập nhật domains
    await this.prisma.learnerProfileDomain.deleteMany({ where: { profileId: profile.id } })
    if (selectedDomains.length > 0) {
      await this.prisma.learnerProfileDomain.createMany({
        data: selectedDomains.map(d => ({ profileId: profile.id, domainId: d.id }))
      })
    }

    // 4. Certificate goals (mảng, tuỳ chọn)
    await this.prisma.learnerCertificateGoal.deleteMany({ where: { profileId: profile.id } })
    if (selectedCertificates.length > 0) {
      await this.prisma.learnerCertificateGoal.createMany({
        data: selectedCertificates.map(c => ({ profileId: profile.id, certificateId: c.id }))
      })
    }
    await this.prisma.learnerProfileCareerGoal.deleteMany({ where: { profileId: profile.id } })
    if (selectedCareerGoals.length > 0) await this.prisma.learnerProfileCareerGoal.createMany({ data: selectedCareerGoals.map(goal => ({ profileId: profile.id, careerGoalId: goal.id })) })

    return this.findByUser(userId)
  }

  async updateDomains(userId: string, domainCodes: string[]) {
    const profile = await this.findByUser(userId)
    const domains = await this.activeChoices(this.prisma.domain, domainCodes, 'chuyên ngành')
    if (!domains) throw new BadRequestException('Danh sách chuyên ngành không hợp lệ')
    if (profile.onboardingCompleted) this.assertCompleteGoal(profile.learningGoal, domains.length, profile.certGoals.length)
    await this.prisma.$transaction(async tx => {
      await tx.learnerProfileDomain.deleteMany({ where: { profileId: profile.id } })
      if (domains.length) await tx.learnerProfileDomain.createMany({ data: domains.map(d => ({ profileId: profile.id, domainId: d.id })) })
    })
    return this.findByUser(userId)
  }

  private async activeChoices(model: { findMany: Function }, codes: unknown, label: string): Promise<any[] | undefined> {
    if (codes === undefined) return undefined
    if (!Array.isArray(codes) || codes.some(code => typeof code !== 'string' || !code.trim())) throw new BadRequestException(`Danh sách ${label} không hợp lệ`)
    const unique = [...new Set(codes.map(code => code.trim()))]
    if (!unique.length) return []
    const choices = await model.findMany({ where: { code: { in: unique }, isActive: true } })
    if (choices.length !== unique.length) throw new BadRequestException(`Có ${label} không tồn tại hoặc đã ngừng hoạt động`)
    return choices
  }

  private assertCompleteGoal(goal: unknown, domainCount: number, certificateCount: number) {
    if (!['vocabulary', 'certification', 'both'].includes(String(goal))) throw new BadRequestException('Vui lòng chọn mục tiêu học tập')
    if ((goal === 'vocabulary' || goal === 'both') && domainCount === 0) throw new BadRequestException('Vui lòng chọn ít nhất một chuyên ngành')
    if ((goal === 'certification' || goal === 'both') && certificateCount === 0) throw new BadRequestException('Vui lòng chọn ít nhất một chứng chỉ mục tiêu')
  }

  async updateGoals(userId: string, dto: UpdateLearnerGoalsDto) {
    await this.assertLearner(userId)
    const existing = await this.prisma.learnerProfile.findUnique({ where: { userId }, include: { domains: true, certGoals: true } })
    if (!existing) throw new NotFoundException('Không tìm thấy hồ sơ học viên')

    let levelId = existing.levelId
    if (dto.levelCode !== undefined) {
      if (typeof dto.levelCode !== 'string' || !dto.levelCode.trim()) throw new BadRequestException('Trình độ không hợp lệ')
      const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
      if (!level?.isActive) throw new BadRequestException('Trình độ không tồn tại hoặc đã ngừng hoạt động')
      levelId = level.id
    }

    // Resolve every reference before changing either the profile or its links.
    const [domains, certs, goals] = await Promise.all([
      this.activeChoices(this.prisma.domain, dto.domainCodes, 'chuyên ngành'),
      this.activeChoices(this.prisma.certificate, dto.certificateCodes, 'chứng chỉ'),
      this.activeChoices(this.prisma.careerGoal, dto.careerGoalCodes, 'mục tiêu nghề nghiệp'),
    ])

    const updateData: any = {
      levelId,
    }
    // Editing preferences must not bypass the explicit completion flow.
    if (existing.onboardingCompleted) this.assertCompleteGoal(dto.learningGoal ?? existing.learningGoal, domains?.length ?? existing.domains.length, certs?.length ?? existing.certGoals.length)
    if (dto.weeklyStudyTargetMinutes !== undefined) {
      updateData.weeklyStudyTargetMinutes = dto.weeklyStudyTargetMinutes
    }
    if (dto.dailyVocabularyTarget !== undefined) updateData.dailyVocabularyTarget = dto.dailyVocabularyTarget
    if (dto.weeklyExamTarget !== undefined) updateData.weeklyExamTarget = dto.weeklyExamTarget
    if (dto.dailyStudyTargetMinutes !== undefined) updateData.dailyStudyTargetMinutes = dto.dailyStudyTargetMinutes
    if (dto.reminderTime !== undefined) {
      if (dto.reminderTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dto.reminderTime)) {
        throw new BadRequestException('Giờ nhắc học phải có định dạng HH:mm')
      }
      updateData.reminderTime = dto.reminderTime || null
    }
    if (dto.reminderEnabled !== undefined) updateData.reminderEnabled = dto.reminderEnabled
    if (dto.learningPathMode !== undefined) updateData.learningPathMode = dto.learningPathMode
    if (dto.learningGoal !== undefined) updateData.learningGoal = dto.learningGoal

    await this.prisma.$transaction(async tx => {
      await tx.learnerProfile.update({ where: { userId }, data: updateData })
      if (domains !== undefined) {
        await tx.learnerProfileDomain.deleteMany({ where: { profileId: existing.id } })
        if (domains.length) await tx.learnerProfileDomain.createMany({ data: domains.map(d => ({ profileId: existing.id, domainId: d.id })) })
      }
      if (certs !== undefined) {
        await tx.learnerCertificateGoal.deleteMany({ where: { profileId: existing.id } })
        if (certs.length) await tx.learnerCertificateGoal.createMany({ data: certs.map(c => ({ profileId: existing.id, certificateId: c.id })) })
      }
      if (goals !== undefined) {
        await tx.learnerProfileCareerGoal.deleteMany({ where: { profileId: existing.id } })
        if (goals.length) await tx.learnerProfileCareerGoal.createMany({ data: goals.map(goal => ({ profileId: existing.id, careerGoalId: goal.id })) })
      }
    })

    return this.findByUser(userId)
  }

  async trackStudyTime(userId: string, sessionId: string, seconds: number) {
    await this.assertLearner(userId)
    if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{10,100}$/.test(sessionId) || !Number.isInteger(seconds) || seconds < 0 || seconds > 86400) throw new BadRequestException('Phiên học không hợp lệ')
    // Cumulative heartbeats are idempotent and capped by elapsed server time.
    await this.prisma.$executeRaw`
      INSERT INTO study_time_sessions (id, learner_id, seconds) VALUES (${sessionId}, ${userId}::uuid, 0)
      ON CONFLICT (id) DO UPDATE SET seconds = GREATEST(study_time_sessions.seconds, LEAST(${seconds}, GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - study_time_sessions.started_at)))::int)))
      WHERE study_time_sessions.learner_id = ${userId}::uuid
    `
    return { saved: true }
  }

  async getJourney(userId: string) {
    await this.assertLearner(userId)
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId },
      include: { domains: true, certGoals: true },
    })
    if (!profile) throw new NotFoundException('Không tìm thấy hồ sơ học viên')

    const hasPath = profile.onboardingCompleted && (profile.domains.length > 0 || profile.certGoals.length > 0)
    if (!hasPath) return { configured: false }

    const now = new Date()
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0)
    const startWeek = new Date(startToday); startWeek.setDate(startToday.getDate() - ((startToday.getDay() + 6) % 7))
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startYear = new Date(now.getFullYear(), 0, 1)

    const [vocabularyToday, examsWeek, examsMonth, examsYear] = await Promise.all([
      this.prisma.vocabularyProgress.count({ where: { learnerId: userId, updatedAt: { gte: startToday }, status: { in: ['learning', 'mastered'] } } }),
      this.prisma.examAttempt.count({ where: { learnerId: userId, submittedAt: { gte: startWeek } } }),
      this.prisma.examAttempt.count({ where: { learnerId: userId, submittedAt: { gte: startMonth } } }),
      this.prisma.examAttempt.count({ where: { learnerId: userId, submittedAt: { gte: startYear } } }),
    ])
    const period = vietnamPeriods(now)
    const measured = await this.prisma.$queryRaw<{ seconds: number }[]>`
      SELECT COALESCE(SUM(seconds), 0)::int AS seconds FROM study_time_sessions
      WHERE learner_id = ${userId}::uuid AND started_at >= ${period.today} AND started_at < ${period.tomorrow}
    `
    const studyMinutesToday = Math.floor((measured[0]?.seconds ?? 0) / 60)
    const weeklyExamTarget = profile.weeklyExamTarget
    const monthlyExamTarget = weeklyExamTarget * 4
    const yearlyExamTarget = weeklyExamTarget * 52
    const percent = (value: number, target: number) => Math.min(100, Math.round((value / Math.max(1, target)) * 100))

    return {
      configured: true,
      targets: {
        vocabularyPerDay: profile.dailyVocabularyTarget,
        examsPerWeek: weeklyExamTarget,
        examsPerMonth: monthlyExamTarget,
        examsPerYear: yearlyExamTarget,
        minutesPerDay: profile.dailyStudyTargetMinutes,
        reminderTime: profile.reminderTime,
        reminderEnabled: profile.reminderEnabled,
        learningPathMode: profile.learningPathMode,
        learningGoal: profile.learningGoal,
      },
      progress: {
        vocabularyToday,
        examsWeek,
        examsMonth,
        examsYear,
        studyMinutesToday,
        vocabularyPercent: percent(vocabularyToday, profile.dailyVocabularyTarget),
        examWeekPercent: percent(examsWeek, weeklyExamTarget),
        studyMinutesPercent: percent(studyMinutesToday, profile.dailyStudyTargetMinutes),
      },
    }
  }

  async findPlacementExam(userId: string) {
    const profile = await this.prisma.learnerProfile.findUnique({ where: { userId }, include: { domains: true, certGoals: true } })
    if (!profile) throw new NotFoundException('Không tìm thấy hồ sơ học viên')
    const domainIds = profile.domains.map(item => item.domainId)
    const certificateIds = profile.certGoals.map(item => item.certificateId)
    if (!domainIds.length && !certificateIds.length) return { available: false, message: 'Vui lòng chọn chuyên ngành hoặc chứng chỉ trước khi làm bài kiểm tra đầu vào.' }
    const exam = await this.prisma.exam.findFirst({
      where: { status: 'published', OR: [
        ...(domainIds.length ? [{ domainId: { in: domainIds } }] : []),
        ...(certificateIds.length ? [{ certificateId: { in: certificateIds } }] : []),
      ] },
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, durationMinutes: true, passingScorePercent: true },
    })
    return exam ? { available: true, exam } : { available: false, message: 'Hiện chưa có bài kiểm tra đầu vào phù hợp với lộ trình đã chọn.' }
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
    if (!learner) throw new ForbiddenException('Quản trị viên và giảng viên không có hồ sơ học viên')
  }
}
