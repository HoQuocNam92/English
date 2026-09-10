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
          },
        },
      },
    })
    return { data: levels }
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
      include: { _count: { select: { skills: true, profileCareerGoals: true } } },
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
          : 65
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
      
      const [activeUsers, studyMinutes] = await Promise.all([
        this.prisma.learningSession.findMany({
          where: { studyDate: { gte: startOfDay, lte: endOfDay } },
          select: { userId: true },
          distinct: ['userId']
        }).then(r => r.length),
        this.prisma.learningSession.aggregate({
          where: { studyDate: { gte: startOfDay, lte: endOfDay } },
          _sum: { durationSeconds: true },
        }).then(result => (result._sum.durationSeconds ?? 0) / 60)
      ]);
      
      weeklyActivity.push({
        day: days[new Date(startOfDay).getDay()],
        studyHours: Math.round(studyMinutes / 60 * 10) / 10,
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
        certContent: { orderBy: { order: 'asc' } },
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

  async createCertificationContent(certificateId: string, dto: any) {
    const certificate = await this.prisma.certificate.findUnique({ where: { id: certificateId }, select: { id: true } })
    if (!certificate) throw new NotFoundException('Chứng chỉ không tồn tại')
    if (!dto.title?.trim() || !dto.body?.trim()) throw new BadRequestException('Tiêu đề và nội dung là bắt buộc')
    return this.prisma.certificationContent.create({
      data: {
        certificateId,
        title: dto.title.trim(),
        body: dto.body.trim(),
        topic: dto.topic?.trim() || null,
        order: Number(dto.order) || 0,
        status: dto.status ?? 'draft',
      },
    })
  }

  async updateCertificationContent(id: string, dto: any) {
    const exists = await this.prisma.certificationContent.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new NotFoundException('Nội dung ôn tập không tồn tại')
    return this.prisma.certificationContent.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.body !== undefined ? { body: dto.body.trim() } : {}),
        ...(dto.topic !== undefined ? { topic: dto.topic.trim() || null } : {}),
        ...(dto.order !== undefined ? { order: Number(dto.order) || 0 } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    })
  }

  async deleteCertificationContent(id: string) {
    const deleted = await this.prisma.certificationContent.deleteMany({ where: { id } })
    if (!deleted.count) throw new NotFoundException('Nội dung ôn tập không tồn tại')
    return { deleted: true }
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
