import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  async getCareerGoals() {
    const data = await this.prisma.careerGoal.findMany({ where: { isActive: true }, include: { _count: { select: { profileGoals: true, learnerGroups: true } } }, orderBy: { name: 'asc' } })
    return { data }
  }

  createCareerGoal(dto: any) {
    return this.prisma.careerGoal.create({ data: { code: String(dto.code).trim().toUpperCase(), name: String(dto.name).trim(), description: String(dto.description ?? '').trim(), isActive: dto.isActive ?? true } })
  }

  updateCareerGoal(id: string, dto: any) {
    return this.prisma.careerGoal.update({ where: { id }, data: { ...(dto.code !== undefined && { code: String(dto.code).trim().toUpperCase() }), ...(dto.name !== undefined && { name: String(dto.name).trim() }), ...(dto.description !== undefined && { description: String(dto.description).trim() }), ...(dto.isActive !== undefined && { isActive: Boolean(dto.isActive) }) } })
  }

  async getLevels() {
    const levels = await this.prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            vocabularies: true,
            questions: true,
            exams: true,
            learnerProfiles: true,
          },
        },
      },
    })
    return { data: levels }
  }

  async getLevel(id: string) {
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            vocabularies: true,
            questions: true,
            exams: true,
            learnerProfiles: true,
          },
        },
      },
    })
    if (!level) throw new NotFoundException('Cấp độ không tồn tại')
    return { data: level }
  }

  async createLevel(dto: { code: string; name: string; order?: number; description?: string; isActive?: boolean }) {
    const code = dto.code?.trim().toLowerCase()
    if (!code) throw new BadRequestException('Mã cấp độ không được để trống')
    if (!dto.name?.trim()) throw new BadRequestException('Tên cấp độ không được để trống')

    const existingCode = await this.prisma.level.findUnique({ where: { code } })
    if (existingCode) throw new BadRequestException(`Mã cấp độ "${code}" đã tồn tại`)

    let order = Number(dto.order)
    if (!order || isNaN(order) || order <= 0) {
      const maxOrder = await this.prisma.level.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      order = (maxOrder?.order ?? 0) + 1
    }

    const level = await this.prisma.level.create({
      data: {
        code,
        name: dto.name.trim(),
        order,
        description: dto.description?.trim() ?? '',
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      },
      include: {
        _count: {
          select: {
            vocabularies: true,
            questions: true,
            exams: true,
            learnerProfiles: true,
          },
        },
      },
    })
    return { data: level }
  }

  async updateLevel(id: string, dto: { code?: string; name?: string; order?: number; description?: string; isActive?: boolean }) {
    const existing = await this.prisma.level.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Cấp độ không tồn tại')

    const data: any = {}
    if (dto.code !== undefined) {
      const code = dto.code.trim().toLowerCase()
      if (!code) throw new BadRequestException('Mã cấp độ không được để trống')
      if (code !== existing.code) {
        const dup = await this.prisma.level.findUnique({ where: { code } })
        if (dup) throw new BadRequestException(`Mã cấp độ "${code}" đã tồn tại`)
        data.code = code
      }
    }
    if (dto.name !== undefined) {
      if (!dto.name.trim()) throw new BadRequestException('Tên cấp độ không được để trống')
      data.name = dto.name.trim()
    }
    if (dto.order !== undefined) {
      const order = Number(dto.order)
      if (isNaN(order) || order <= 0) throw new BadRequestException('Thứ tự phải là số nguyên dương')
      data.order = order
    }
    if (dto.description !== undefined) {
      data.description = dto.description.trim()
    }
    if (dto.isActive !== undefined) {
      data.isActive = Boolean(dto.isActive)
    }

    const level = await this.prisma.level.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            vocabularies: true,
            questions: true,
            exams: true,
            learnerProfiles: true,
          },
        },
      },
    })
    return { data: level }
  }

  async deleteLevel(id: string) {
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            vocabularies: true,
            questions: true,
            exams: true,
            learnerProfiles: true,
          },
        },
      },
    })
    if (!level) throw new NotFoundException('Cấp độ không tồn tại')

    const linked =
      level._count.vocabularies +
      level._count.questions +
      level._count.exams +
      level._count.learnerProfiles

    if (linked > 0) {
      const details: string[] = []
      if (level._count.vocabularies > 0) details.push(`${level._count.vocabularies} từ vựng`)
      if (level._count.questions > 0) details.push(`${level._count.questions} câu hỏi`)
      if (level._count.exams > 0) details.push(`${level._count.exams} bài thi`)
      if (level._count.learnerProfiles > 0) details.push(`${level._count.learnerProfiles} học viên`)

      throw new BadRequestException(
        `Không thể xóa cấp độ "${level.name}" vì đang có dữ liệu liên kết: ${details.join(', ')}. Vui lòng chuyển dữ liệu sang cấp độ khác hoặc tắt kích hoạt (Ngừng hoạt động) cấp độ này.`
      )
    }

    await this.prisma.level.delete({ where: { id } })
    return { success: true, message: `Đã xóa cấp độ "${level.name}" thành công` }
  }

  async getDomains(activeOnly = false) {
    const domains = await this.prisma.domain.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            vocabularies: true,
            questions: true,
            exams: true,
          },
        },
      },
    })
    return { data: domains }
  }

  async getCertificates(activeOnly = false) {
    const certs = await this.prisma.certificate.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
      include: {
        domains: {
          include: {
            domain: true,
            certificationTopics: {
              orderBy: { order: 'asc' },
              include: { _count: { select: { vocabularies: true, questions: true } } },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            exams: true,
          },
        },
      },
    })
    return { data: certs }
  }

  async getStudents(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search, status, domainId, certificateId } = params || {}
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null,
      userRoles: { some: { role: { code: 'learner' } } },
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userDetail: { displayName: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (status) {
      where.status = status
    }
    if (domainId || certificateId) {
      where.learnerProfile = { is: {
        ...(domainId && { domains: { some: { domainId } } }),
        ...(certificateId && { certGoals: { some: { certificateId } } }),
      } }
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userDetail: true,
          learnerProfile: {
            include: {
              level: true,
              domains: { include: { domain: true } },
              certGoals: { include: { certificate: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        status: u.status,
        displayName: u.userDetail?.displayName,
        avatarUrl: u.userDetail?.avatarUrl,
        phoneNumber: u.userDetail?.phoneNumber,
        createdAt: u.createdAt,
        level: u.learnerProfile?.level?.name ?? 'Beginner',
        weeklyTarget: u.learnerProfile?.weeklyStudyTargetMinutes ?? 180,
        domains: u.learnerProfile?.domains?.map((d) => d.domain.name) ?? [],
        certGoals: u.learnerProfile?.certGoals?.map((c) => c.certificate.name) ?? [],
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getTestResults(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search, examId, passed } = params || {}
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { learner: { email: { contains: search, mode: 'insensitive' } } },
        { learner: { userDetail: { displayName: { contains: search, mode: 'insensitive' } } } },
        { exam: { title: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (examId) where.examId = examId
    if (passed !== undefined && passed !== '') {
      where.passed = passed === 'true' || passed === true
    }

    const [attempts, total] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where,
        skip,
        take: limit,
        include: {
          learner: { include: { userDetail: true } },
          exam: { include: { domain: true, level: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.examAttempt.count({ where }),
    ])

    const formattedAttempts = attempts.map((a: any) => {
      const timeSpentSeconds = a.submittedAt && a.startedAt
        ? Math.max(0, Math.round((new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) / 1000))
        : 0
      const isPassed = a.passed ?? ((a.scorePercent ?? 0) >= (a.exam?.passingScorePercent ?? 70))
      const score = Math.round(a.scorePercent ?? a.score ?? 0)

      return {
        ...a,
        timeSpentSeconds,
        isPassed,
        score,
        completedAt: a.submittedAt ?? a.createdAt,
      }
    })

    return {
      data: formattedAttempts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getStudentProgress(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search } = params || {}
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null,
      userRoles: { some: { role: { code: 'learner' } } },
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userDetail: { displayName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const profileFilter: any = {
      ...(params.levelCode ? { level: { code: params.levelCode } } : {}),
      ...(params.domainCode ? { domains: { some: { domain: { code: params.domainCode } } } } : {}),
      ...(params.certificateId ? { certGoals: { some: { certificateId: params.certificateId } } } : {}),
    }
    if (Object.keys(profileFilter).length) where.learnerProfile = { is: profileFilter }

    const [learners, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userDetail: true,
          learnerProfile: { include: { level: true } },
          learnerProgress: true,
          examAttempts: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: learners.map((l) => {
        const completedLessons = l.learnerProgress.filter(progress => progress.resourceType === 'lesson' && (progress.status === 'completed' || progress.completionPercent >= 100)).length
        const lessonProgress = l.learnerProgress.filter(p => p.resourceType === 'lesson')
        const avgCompletion = lessonProgress.length > 0
          ? Math.round(lessonProgress.reduce((sum, p) => sum + (p.completionPercent || 0), 0) / lessonProgress.length)
          : 0
        const examCount = l.examAttempts.length
        const passedExams = l.examAttempts.filter((e) => e.passed).length

        return {
          id: l.id,
          displayName: l.userDetail?.displayName ?? l.email,
          email: l.email,
          level: l.learnerProfile?.level?.name ?? 'Chưa thiết lập',
          completedLessons,
          avgCompletion,
          examCount,
          passedExams,
          overallScore: examCount > 0 ? Math.round((passedExams / examCount) * 100) : 0,
        }
      }),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getDashboardAnalytics(params: { dateFrom?: string; dateTo?: string; domainCode?: string; certificateId?: string } = {}) {
    const dateFrom = params.dateFrom ? new Date(`${params.dateFrom}T00:00:00.000`) : undefined
    const dateTo = params.dateTo ? new Date(`${params.dateTo}T23:59:59.999`) : undefined
    if (dateFrom && Number.isNaN(dateFrom.getTime())) throw new BadRequestException('Ngày bắt đầu không hợp lệ')
    if (dateTo && Number.isNaN(dateTo.getTime())) throw new BadRequestException('Ngày kết thúc không hợp lệ')
    if (dateFrom && dateTo && dateFrom > dateTo) throw new BadRequestException('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc')
    const createdAt = dateFrom || dateTo ? { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } : undefined
    const domainRelation = params.domainCode ? { domain: { code: params.domainCode } } : {}
    const examCertificateRelation = params.certificateId ? { certificateId: params.certificateId } : {}
    const examWhere: any = { ...(createdAt ? { createdAt } : {}), ...domainRelation, ...examCertificateRelation }
    const vocabularyWhere: any = { ...(createdAt ? { createdAt } : {}), ...domainRelation }
    const attemptWhere: any = {
      ...(createdAt ? { createdAt } : {}),
      ...((params.domainCode || params.certificateId) ? { exam: { ...domainRelation, ...examCertificateRelation } } : {}),
    }
    const selectedDomain = params.domainCode
      ? await this.prisma.domain.findUnique({ where: { code: params.domainCode }, select: { id: true } })
      : null
    const learnerProfileFilter: any = {
      ...(selectedDomain ? { domains: { some: { domainId: selectedDomain.id } } } : {}),
      ...(params.certificateId ? { certGoals: { some: { certificateId: params.certificateId } } } : {}),
    }
    const hasAudienceFilter = Boolean(selectedDomain || params.certificateId)
    const userWhere: any = {
      deletedAt: null,
      userRoles: { some: { role: { code: 'learner' } } },
      ...(createdAt ? { createdAt } : {}),
      ...(hasAudienceFilter ? { learnerProfile: { is: learnerProfileFilter } } : {}),
    }
    const domainWhere: any = {
      ...(params.domainCode ? { code: params.domainCode } : {}),
      ...(params.certificateId ? { certificateDomains: { some: { certificateId: params.certificateId } } } : {}),
    }
    const [domains, levels, totalUsers, activeUsers, totalExams, totalVocab, totalLessons, attempts] =
      await Promise.all([
        this.prisma.domain.findMany({
          where: domainWhere,
          include: {
            _count: {
              select: { lessons: true, vocabularies: true, questions: true, exams: true },
            },
          },
        }),
        this.prisma.level.findMany({
          include: {
            _count: {
              select: { lessons: true, vocabularies: true, questions: true, exams: true },
            },
          },
          orderBy: { order: 'asc' },
        }),
        this.prisma.user.count({ where: userWhere }),
        this.prisma.user.count({ where: { ...userWhere, status: 'active' } }),
        this.prisma.exam.count({ where: examWhere }),
        this.prisma.vocabulary.count({ where: vocabularyWhere }),
        this.prisma.lesson.count({ where: { ...(createdAt ? { createdAt } : {}), ...domainRelation } }),
        this.prisma.examAttempt.findMany({
          where: attemptWhere,
          take: 500,
          orderBy: { createdAt: 'desc' },
        }),
      ])

    const passedCount = attempts.filter((a) => a.passed).length
    const passRate = attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 0
    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, attempt) => sum + Number(attempt.scorePercent ?? 0), 0) / attempts.length)
      : 0

    const [certificateRows, completedProgress, completionLeaders] = await Promise.all([
      this.prisma.certificate.findMany({
        where: params.certificateId ? { id: params.certificateId } : { isActive: true },
        include: {
          _count: { select: { profileGoals: true, exams: true } },
          exams: { select: { attempts: { where: { status: { in: ['graded', 'submitted'] }, ...(createdAt ? { createdAt } : {}) }, select: { scorePercent: true, passed: true, learnerId: true } } } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.learningProgress.findMany({ where: { status: 'completed', ...(createdAt ? { completedAt: createdAt } : {}), ...(hasAudienceFilter ? { learner: { learnerProfile: { is: learnerProfileFilter } } } : {}) }, select: { learnerId: true } }),
      this.prisma.learningProgress.groupBy({ by: ['learnerId'], where: { status: 'completed', ...(createdAt ? { completedAt: createdAt } : {}), ...(hasAudienceFilter ? { learner: { learnerProfile: { is: learnerProfileFilter } } } : {}) }, _count: { _all: true }, orderBy: { _count: { learnerId: 'desc' } }, take: 10 }),
    ])
    const leaderUsers = completionLeaders.length ? await this.prisma.user.findMany({ where: { id: { in: completionLeaders.map(item => item.learnerId) } }, include: { userDetail: true } }) : []
    const leaderMap = new Map(leaderUsers.map(user => [user.id, user.userDetail?.displayName ?? user.email]))
    const certificatesDistribution = certificateRows.map(certificate => {
      const certificateAttempts = certificate.exams.flatMap(exam => exam.attempts)
      return {
        id: certificate.id,
        code: certificate.code,
        name: certificate.name,
        goalLearners: certificate._count.profileGoals,
        exams: certificate._count.exams,
        learnersAttempted: new Set(certificateAttempts.map(item => item.learnerId)).size,
        attempts: certificateAttempts.length,
        averageScore: certificateAttempts.length ? Math.round(certificateAttempts.reduce((sum, item) => sum + Number(item.scorePercent ?? 0), 0) / certificateAttempts.length) : 0,
        passRate: certificateAttempts.length ? Math.round(certificateAttempts.filter(item => item.passed).length / certificateAttempts.length * 100) : 0,
      }
    })

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = dateTo ?? new Date();
    const activityStart = dateFrom ?? new Date(new Date(today).setDate(today.getDate() - 6));
    const rangeDays = Math.min(31, Math.max(1, Math.floor((today.getTime() - activityStart.getTime()) / 86400000) + 1));
    const weeklyActivity = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const startOfDay = new Date(date.setHours(0,0,0,0));
      const endOfDay = new Date(date.setHours(23,59,59,999));
      
      const activity = await this.prisma.learningProgress.findMany({
        where: {
          updatedAt: { gte: startOfDay, lte: endOfDay },
          ...(hasAudienceFilter ? { learner: { learnerProfile: { is: learnerProfileFilter } } } : {}),
        },
        select: { learnerId: true },
      });
      const activeUsers = new Set(activity.map(item => item.learnerId)).size;
      
      weeklyActivity.push({
        day: rangeDays > 7 ? `${String(startOfDay.getDate()).padStart(2, '0')}/${String(startOfDay.getMonth() + 1).padStart(2, '0')}` : days[new Date(startOfDay).getDay()],
        activityCount: activity.length,
        activeUsers
      });
    }

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalLessons,
        totalExams,
        totalVocab,
        passRate,
        averageScore,
      },
      domainsDistribution: domains.map((d) => ({
        code: d.code,
        name: d.name,
        lessons: d._count.lessons,
        vocabularies: d._count.vocabularies,
        questions: d._count.questions,
        exams: d._count.exams,
        totalItems: d._count.lessons + d._count.vocabularies + d._count.questions + d._count.exams,
      })),
      levelsDistribution: levels.map((l) => ({
        code: l.code,
        name: l.name,
        order: l.order,
        lessons: l._count.lessons,
        vocabularies: l._count.vocabularies,
        questions: l._count.questions,
        exams: l._count.exams,
      })),
      certificatesDistribution,
      completionStats: {
        completedLearners: new Set(completedProgress.map(item => item.learnerId)).size,
        completedItems: completedProgress.length,
        topLearners: completionLeaders.map(item => ({ learnerId: item.learnerId, displayName: leaderMap.get(item.learnerId) ?? 'Học viên', completedItems: item._count._all })),
      },
      weeklyActivity,
    }
  }

  async getDomainReport(domainId: string) {
    const domain = await this.prisma.domain.findUnique({ where: { id: domainId } })
    if (!domain) throw new NotFoundException('Lĩnh vực không tồn tại')

    // Learners who selected this domain
    const learners = await this.prisma.user.findMany({
      where: {
        userRoles: { some: { role: { code: 'learner' } } },
        learnerProfile: { is: { domains: { some: { domainId } } } },
      },
      include: {
        userDetail: true,
        learnerProfile: {
          include: {
            level: true,
            certGoals: { include: { certificate: true } },
          },
        },
        learnerProgress: true,
        examAttempts: { where: { exam: { domainId } }, include: { exam: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Content stats for this domain
    const [totalExams, totalVocab, totalLessons] = await Promise.all([
      this.prisma.exam.count({ where: { domainId } }),
      this.prisma.vocabulary.count({ where: { domainId } }),
      this.prisma.lesson.count({ where: { domainId } }),
    ])

    // Exam attempts in this domain for average score
    const domainAttempts = await this.prisma.examAttempt.findMany({
      where: { exam: { domainId }, status: { in: ['graded', 'submitted'] } },
      select: { scorePercent: true, passed: true, learnerId: true },
    })
    const avgScore = domainAttempts.length > 0
      ? Math.round(domainAttempts.reduce((sum, a) => sum + Number(a.scorePercent ?? 0), 0) / domainAttempts.length)
      : 0
    const passRate = domainAttempts.length > 0
      ? Math.round(domainAttempts.filter(a => a.passed).length / domainAttempts.length * 100)
      : 0

    // Top certificate goal among these learners
    const certCounts: Record<string, { name: string; count: number }> = {}
    learners.forEach(l => {
      l.learnerProfile?.certGoals?.forEach(cg => {
        const name = cg.certificate.name
        if (!certCounts[name]) certCounts[name] = { name, count: 0 }
        certCounts[name].count++
      })
    })
    const topCert = Object.values(certCounts).sort((a, b) => b.count - a.count)[0] ?? null

    // Map learner details
    const learnerData = learners.map(l => {
      const domainProgress = l.learnerProgress.filter(item => item.resourceType === 'domain' && item.resourceId === domainId)
      const avgCompletion = domainProgress.length ? Math.round(domainProgress.reduce((sum, item) => sum + item.completionPercent, 0) / domainProgress.length) : 0
      const examCount = l.examAttempts.length
      const passedExams = l.examAttempts.filter(e => e.passed).length
      const lastActive = l.examAttempts[0]?.startedAt ?? l.learnerProgress[0]?.updatedAt ?? l.createdAt

      return {
        id: l.id,
        displayName: l.userDetail?.displayName ?? l.email,
        email: l.email,
        avatarUrl: l.userDetail?.avatarUrl,
        level: l.learnerProfile?.level?.name ?? 'Beginner',
        certGoal: l.learnerProfile?.certGoals?.[0]?.certificate?.name ?? null,
        avgCompletion,
        examCount,
        passedExams,
        lastActive,
      }
    })

    return {
      domain: { id: domain.id, code: domain.code, name: domain.name, description: domain.description },
      stats: {
        totalLearners: learners.length,
        avgScore,
        passRate,
        totalLessons,
        totalExams,
        totalVocab,
        topCertGoal: topCert ? { name: topCert.name, percent: Math.round(topCert.count / learners.length * 100) } : null,
      },
      learners: learnerData,
    }
  }

  async createCertificate(dto: any) {
    const cert = await this.prisma.certificate.create({
      data: {
        code: dto.code,
        name: dto.name,
        provider: dto.provider,
        description: dto.description,
        category: dto.category || null,
        examDurationMinutes: dto.examDurationMinutes == null ? null : Number(dto.examDurationMinutes),
        examQuestionCount: dto.examQuestionCount == null ? null : Number(dto.examQuestionCount),
        passingScaledScore: dto.passingScaledScore == null ? null : Number(dto.passingScaledScore),
        examUrl: dto.examUrl || null,
        isActive: dto.isActive ?? true,
      },
      include: {
        domains: { include: { domain: true } },
        _count: {
          select: {
            exams: true,
          },
        },
      },
    })
    return { data: cert }
  }

  async getCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      include: {
        domains: {
          include: {
            domain: true,
            certificationTopics: {
              orderBy: { order: 'asc' },
              include: {
                vocabularies: { include: { vocabulary: true } },
                questions: { include: { question: true } },
                _count: { select: { vocabularies: true, questions: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        exams: { include: { domain: true, level: true, _count: { select: { questions: true, attempts: true } } } },
        profileGoals: true,
      },
    })
    if (!certificate) throw new NotFoundException('Chứng chỉ không tồn tại')
    const attempts = await this.prisma.examAttempt.findMany({ where: { exam: { certificateId: id } }, select: { scorePercent: true, passed: true, learnerId: true } })
    return {
      ...certificate,
      stats: {
        learners: new Set(attempts.map(attempt => attempt.learnerId)).size,
        goalLearners: certificate.profileGoals.length,
        attempts: attempts.length,
        averageScore: attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + Number(attempt.scorePercent), 0) / attempts.length) : 0,
        passRate: attempts.length ? Math.round(attempts.filter(attempt => attempt.passed).length / attempts.length * 100) : 0,
      },
    }
  }

  async deleteCertificate(id: string) {
    const certificate = await this.prisma.certificate.findUnique({ where: { id }, include: { _count: { select: { exams: true, profileGoals: true } } } })
    if (!certificate) throw new NotFoundException('Chứng chỉ không tồn tại')
    const linked = certificate._count.exams + certificate._count.profileGoals
    if (linked > 0) throw new BadRequestException('Không thể xóa chứng chỉ đang có câu hỏi, bài thi hoặc học viên liên kết')
    await this.prisma.certificate.delete({ where: { id } })
    return { success: true }
  }

  async updateCertificateLinks(id: string, dto: { exams?: string[] }) {
    const exists = await this.prisma.certificate.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new NotFoundException('Chứng chỉ không tồn tại')
    await this.prisma.$transaction(async (tx) => {
      if (dto.exams !== undefined) {
        await tx.exam.updateMany({ where: { certificateId: id, id: { notIn: dto.exams } }, data: { certificateId: null } })
        if (dto.exams.length) await tx.exam.updateMany({ where: { id: { in: [...new Set(dto.exams)] } }, data: { certificateId: id } })
      }
    })
    return this.getCertificate(id)
  }

  async addCertificateDomain(certificateId: string, dto: { domainId: string; weightPercent?: number; order?: number }) {
    const [certificate, domain, count] = await Promise.all([
      this.prisma.certificate.findUnique({ where: { id: certificateId }, select: { id: true } }),
      this.prisma.domain.findUnique({ where: { id: dto.domainId }, select: { id: true } }),
      this.prisma.certificateDomain.count({ where: { certificateId } }),
    ])
    if (!certificate) throw new NotFoundException('Chứng chỉ không tồn tại')
    if (!domain) throw new NotFoundException('Lĩnh vực không tồn tại')
    await this.prisma.certificateDomain.upsert({
      where: { certificateId_domainId: { certificateId, domainId: dto.domainId } },
      update: { weightPercent: Number(dto.weightPercent ?? 0), order: Number(dto.order ?? count + 1) },
      create: { certificateId, domainId: dto.domainId, weightPercent: Number(dto.weightPercent ?? 0), order: Number(dto.order ?? count + 1) },
    })
    return this.getCertificate(certificateId)
  }

  async addCertificationTopic(certificateId: string, dto: { domainId: string; code: string; name: string; description?: string; order?: number }) {
    const certificateDomain = await this.prisma.certificateDomain.findUnique({
      where: { certificateId_domainId: { certificateId, domainId: dto.domainId } },
      select: { certificateId: true },
    })
    if (!certificateDomain) throw new BadRequestException('Hãy thêm Domain vào chứng chỉ trước khi tạo Topic')
    const count = await this.prisma.certificationTopic.count({ where: { certificateId, domainId: dto.domainId } })
    await this.prisma.certificationTopic.create({
      data: {
        certificateId,
        domainId: dto.domainId,
        code: dto.code.trim(),
        name: dto.name.trim(),
        description: dto.description?.trim() || '',
        order: Number(dto.order ?? count + 1),
      },
    })
    return this.getCertificate(certificateId)
  }

  async updateCertificationTopicLinks(topicId: string, dto: { vocabularies?: string[]; questions?: string[] }) {
    const topic = await this.prisma.certificationTopic.findUnique({ where: { id: topicId }, select: { id: true, certificateId: true } })
    if (!topic) throw new NotFoundException('Topic không tồn tại')
    await this.prisma.$transaction(async (tx) => {
      if (dto.vocabularies !== undefined) {
        await tx.certificationTopicVocabulary.deleteMany({ where: { topicId } })
        if (dto.vocabularies.length) await tx.certificationTopicVocabulary.createMany({ data: [...new Set(dto.vocabularies)].map(vocabularyId => ({ topicId, vocabularyId })) })
      }
      if (dto.questions !== undefined) {
        await tx.certificationTopicQuestion.deleteMany({ where: { topicId } })
        if (dto.questions.length) await tx.certificationTopicQuestion.createMany({ data: [...new Set(dto.questions)].map(questionId => ({ topicId, questionId })) })
      }
    })
    return this.getCertificate(topic.certificateId)
  }

  async updateCertificate(id: string, dto: any) {
    const data: any = {}
    if (dto.code !== undefined) data.code = dto.code
    if (dto.name !== undefined) data.name = dto.name
    if (dto.provider !== undefined) data.provider = dto.provider
    if (dto.description !== undefined) data.description = dto.description
    if (dto.category !== undefined) data.category = dto.category || null
    if (dto.examDurationMinutes !== undefined) data.examDurationMinutes = dto.examDurationMinutes == null ? null : Number(dto.examDurationMinutes)
    if (dto.examQuestionCount !== undefined) data.examQuestionCount = dto.examQuestionCount == null ? null : Number(dto.examQuestionCount)
    if (dto.passingScaledScore !== undefined) data.passingScaledScore = dto.passingScaledScore == null ? null : Number(dto.passingScaledScore)
    if (dto.examUrl !== undefined) data.examUrl = dto.examUrl
    if (dto.isActive !== undefined) data.isActive = dto.isActive

    const cert = await this.prisma.certificate.update({
      where: { id },
      data,
      include: {
        domains: { include: { domain: true } },
        _count: {
          select: {
            exams: true,
          },
        },
      },
    })
    return { data: cert }
  }
}
