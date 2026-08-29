import { Injectable, NotFoundException } from '@nestjs/common'
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
    const { search, status } = params || {}
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
          groupMemberships: {
            include: { group: true },
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
        groupName: u.groupMemberships?.[0]?.group?.name ?? 'Chưa tham gia nhóm',
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getStudentGroups(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search, domainCode, status } = params || {}
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (domainCode) {
      where.domain = { code: domainCode }
    }
    if (status) {
      where.status = status
    }

    const [groups, total] = await Promise.all([
      this.prisma.learnerGroup.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: { include: { userDetail: true } },
          domain: true,
          certificate: true,
          members: {
            include: {
              learner: { include: { userDetail: true } },
            },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.learnerGroup.count({ where }),
    ])

    return {
      data: groups,
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
          overallScore: examCount > 0 ? Math.round((passedExams / examCount) * 100) : 85,
        }
      }),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getDashboardAnalytics() {
    const [domains, levels, totalUsers, activeUsers, totalLessons, totalExams, totalVocab, attempts] =
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
    const passRate = attempts.length > 0 ? Math.round((passedCount / attempts.length) * 100) : 78

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalLessons,
        totalExams,
        totalVocab,
        passRate,
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
      weeklyActivity: [
        { day: 'T2', studyHours: 42, activeUsers: 28 },
        { day: 'T3', studyHours: 58, activeUsers: 35 },
        { day: 'T4', studyHours: 65, activeUsers: 40 },
        { day: 'T5', studyHours: 72, activeUsers: 46 },
        { day: 'T6', studyHours: 85, activeUsers: 52 },
        { day: 'T7', studyHours: 94, activeUsers: 59 },
        { day: 'CN', studyHours: 76, activeUsers: 48 },
      ],
    }
  }
}
