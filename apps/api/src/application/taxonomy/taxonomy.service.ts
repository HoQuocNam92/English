import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  async getLevels() {
    const levels = await this.prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            lessons: true,
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
            lessons: true,
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
            lessons: true,
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
            lessons: true,
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
            lessons: true,
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
      level._count.lessons +
      level._count.vocabularies +
      level._count.questions +
      level._count.exams +
      level._count.learnerProfiles

    if (linked > 0) {
      const details: string[] = []
      if (level._count.lessons > 0) details.push(`${level._count.lessons} bài học`)
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

  async getDomains() {
    const domains = await this.prisma.domain.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            lessons: true,
            vocabularies: true,
            questions: true,
            exams: true,
          },
        },
      },
    })
    return { data: domains }
  }

  async getCareerGoals() {
    const goals = await this.prisma.careerGoal.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { profileCareerGoals: true } } },
    })
    return { data: goals }
  }

  async getCertificates() {
    const certs = await this.prisma.certificate.findMany({
      orderBy: { name: 'asc' },
      include: {
        domains: { include: { domain: true } },
        _count: {
          select: {
            exams: true,
            lessonCerts: true,
            questionCerts: true,
          },
        },
      },
    })
    return { data: certs }
  }

  async getStudents(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search, status, domainId, careerGoalId } = params || {}
    const skip = (page - 1) * limit

    const where: any = {
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
    if (domainId) {
      where.learnerProfile = { is: { domains: { some: { domainId } } } }
    }
    if (careerGoalId) {
      const profileFilter = where.learnerProfile?.is ?? {}
      where.learnerProfile = { is: { ...profileFilter, careerGoals: { some: { careerGoalId } } } }
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
              careerGoals: { include: { careerGoal: true } },
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
        careerGoals: u.learnerProfile?.careerGoals?.map((c) => c.careerGoal.name) ?? [],
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

    return {
      data: attempts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getStudentProgress(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search } = params || {}
    const skip = (page - 1) * limit

    const where: any = {
      userRoles: { some: { role: { code: 'learner' } } },
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userDetail: { displayName: { contains: search, mode: 'insensitive' } } },
      ]
    }

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
        const completedLessons = l.learnerProgress.reduce((sum, p) => sum + (p.completedLessonCount || 0), 0)
        const avgCompletion = l.learnerProgress.length > 0
          ? Math.round(l.learnerProgress.reduce((sum, p) => sum + (p.completionPercent || 0), 0) / l.learnerProgress.length)
          : 0
        const examCount = l.examAttempts.length
        const passedExams = l.examAttempts.filter((e) => e.passed).length

        return {
          id: l.id,
          displayName: l.userDetail?.displayName ?? l.email,
          email: l.email,
          level: l.learnerProfile?.level?.name ?? 'Beginner',
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

  async getDashboardAnalytics() {
    const [domains, levels, careerGoals, totalUsers, activeUsers, totalLessons, totalExams, totalVocab, attempts] =
      await Promise.all([
        this.prisma.domain.findMany({
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
        this.prisma.careerGoal.findMany({
          where: { isActive: true },
          include: { _count: { select: { profileCareerGoals: true } } },
          orderBy: { name: 'asc' },
        }),
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: 'active' } }),
        this.prisma.lesson.count(),
        this.prisma.exam.count(),
        this.prisma.vocabulary.count(),
        this.prisma.examAttempt.findMany({
          take: 50,
          orderBy: { createdAt: 'desc' },
        }),
      ])

    const passedCount = attempts.filter((a) => a.passed).length
    const passRate = attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 0
    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, attempt) => sum + Number(attempt.scorePercent ?? 0), 0) / attempts.length)
      : 0

    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const weeklyActivity = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const startOfDay = new Date(date.setHours(0,0,0,0));
      const endOfDay = new Date(date.setHours(23,59,59,999));
      
      const activity = await this.prisma.learningProgress.findMany({
        where: { updatedAt: { gte: startOfDay, lte: endOfDay } },
        select: { learnerId: true },
      });
      const activeUsers = new Set(activity.map(item => item.learnerId)).size;
      
      weeklyActivity.push({
        day: days[new Date(startOfDay).getDay()],
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
      careerGoalsDistribution: careerGoals.map((goal) => ({
        id: goal.id,
        code: goal.code,
        name: goal.name,
        learners: goal._count.profileCareerGoals,
      })),
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
    const [totalLessons, totalExams, totalVocab] = await Promise.all([
      this.prisma.lesson.count({ where: { domainId } }),
      this.prisma.exam.count({ where: { domainId } }),
      this.prisma.vocabulary.count({ where: { domainId } }),
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
      const progress = l.learnerProgress.filter(p => p.resourceType === 'lesson')
      const avgCompletion = progress.length > 0
        ? Math.round(progress.reduce((sum, p) => sum + (p.completionPercent || 0), 0) / progress.length)
        : 0
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
        examUrl: dto.examUrl || null,
      },
      include: {
        domains: { include: { domain: true } },
        _count: {
          select: {
            exams: true,
            lessonCerts: true,
            questionCerts: true,
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
        domains: { include: { domain: true } },
        lessonCerts: { include: { lesson: { include: { domain: true, level: true } } } },
        questionCerts: { include: { question: { include: { domain: true, level: true } } } },
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
    const certificate = await this.prisma.certificate.findUnique({ where: { id }, include: { _count: { select: { exams: true, lessonCerts: true, questionCerts: true, profileGoals: true } } } })
    if (!certificate) throw new NotFoundException('Chứng chỉ không tồn tại')
    const linked = certificate._count.exams + certificate._count.lessonCerts + certificate._count.questionCerts + certificate._count.profileGoals
    if (linked > 0) throw new BadRequestException('Không thể xóa chứng chỉ đang có bài học, câu hỏi, bài thi hoặc học viên liên kết')
    await this.prisma.certificate.delete({ where: { id } })
    return { success: true }
  }

  async updateCertificateLinks(id: string, dto: { lessons?: string[]; questions?: string[]; exams?: string[] }) {
    const exists = await this.prisma.certificate.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new NotFoundException('Chứng chỉ không tồn tại')
    await this.prisma.$transaction(async (tx) => {
      if (dto.lessons !== undefined) {
        await tx.lessonCertificate.deleteMany({ where: { certificateId: id } })
        if (dto.lessons.length) await tx.lessonCertificate.createMany({ data: [...new Set(dto.lessons)].map(lessonId => ({ certificateId: id, lessonId })) })
      }
      if (dto.questions !== undefined) {
        await tx.questionCertificate.deleteMany({ where: { certificateId: id } })
        if (dto.questions.length) await tx.questionCertificate.createMany({ data: [...new Set(dto.questions)].map(questionId => ({ certificateId: id, questionId })) })
      }
      if (dto.exams !== undefined) {
        await tx.exam.updateMany({ where: { certificateId: id, id: { notIn: dto.exams } }, data: { certificateId: null } })
        if (dto.exams.length) await tx.exam.updateMany({ where: { id: { in: [...new Set(dto.exams)] } }, data: { certificateId: id } })
      }
    })
    return this.getCertificate(id)
  }

  async updateCertificate(id: string, dto: any) {
    const data: any = {}
    if (dto.code !== undefined) data.code = dto.code
    if (dto.name !== undefined) data.name = dto.name
    if (dto.provider !== undefined) data.provider = dto.provider
    if (dto.description !== undefined) data.description = dto.description
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
            lessonCerts: true,
            questionCerts: true,
          },
        },
      },
    })
    return { data: cert }
  }
}
