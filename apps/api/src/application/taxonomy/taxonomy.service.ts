import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { JwtPayload } from '../../presentation/decorators/current-user.decorator'
import { CreateStudentGroupDto, UpdateStudentGroupDto } from '../../presentation/http-dto/group-planner.dto'

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

  async getStudentGroups(params: any, user: JwtPayload) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search, domainCode, status } = params || {}
    const skip = (page - 1) * limit

    const where: any = {}
    if (!user.roles?.includes('admin')) where.teacherId = user.sub
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
          overallScore: examCount > 0 ? Math.round((passedExams / examCount) * 100) : 0,
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
      weeklyActivity,
    }
  }

  async createStudentGroup(dto: CreateStudentGroupDto, user: JwtPayload) {
    const teacherId = dto.teacherId || user.sub
    if (!user.roles?.includes('admin') && teacherId !== user.sub) {
      throw new ForbiddenException('Teachers can only create their own groups')
    }
    await this.validateGroupReferences(dto.domainId, dto.certificateId, teacherId)
    this.validateGroupDates(dto.startsAt, dto.endsAt)

    const group = await this.prisma.learnerGroup.create({
      data: {
        code: await this.nextGroupCode(),
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        domainId: dto.domainId,
        certificateId: dto.certificateId,
        teacherId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
      include: {
        teacher: { include: { userDetail: true } },
        domain: true,
        certificate: true,
        members: { include: { learner: { include: { userDetail: true } } } },
        _count: { select: { members: true } },
      },
    })
    return group
  }

  async getStudentGroup(id: string, user: JwtPayload) {
    await this.assertGroupAccess(id, user)
    return this.prisma.learnerGroup.findUnique({
      where: { id },
      include: {
        teacher: { include: { userDetail: true } }, domain: true, certificate: true,
        members: { include: { learner: { include: { userDetail: true } } }, orderBy: { joinedAt: 'asc' } },
        _count: { select: { members: true } },
      },
    })
  }

  async updateStudentGroup(id: string, dto: UpdateStudentGroupDto, user: JwtPayload) {
    const current = await this.assertGroupAccess(id, user)
    const teacherId = dto.teacherId || current.teacherId
    if (!user.roles?.includes('admin') && teacherId !== user.sub) {
      throw new ForbiddenException('Teachers cannot transfer group ownership')
    }
    await this.validateGroupReferences(dto.domainId || current.domainId, dto.certificateId || current.certificateId, teacherId)
    this.validateGroupDates(dto.startsAt, dto.endsAt, current.startsAt, current.endsAt)
    return this.prisma.learnerGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
        ...(dto.domainId !== undefined ? { domainId: dto.domainId } : {}),
        ...(dto.certificateId !== undefined ? { certificateId: dto.certificateId } : {}),
        ...(dto.teacherId !== undefined ? { teacherId: dto.teacherId } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.startsAt !== undefined ? { startsAt: new Date(dto.startsAt) } : {}),
        ...(dto.endsAt !== undefined ? { endsAt: new Date(dto.endsAt) } : {}),
      },
      include: { teacher: { include: { userDetail: true } }, domain: true, certificate: true, members: true, _count: { select: { members: true } } },
    })
  }

  async deleteStudentGroup(id: string, user: JwtPayload) {
    await this.assertGroupAccess(id, user)
    await this.prisma.learnerGroup.delete({ where: { id } })
    return { deleted: true }
  }

  async addStudentGroupMember(id: string, learnerId: string, user: JwtPayload) {
    await this.assertGroupAccess(id, user)
    const learner = await this.prisma.user.findFirst({
      where: { id: learnerId, status: 'active', userRoles: { some: { role: { code: 'learner' } } } },
      select: { id: true },
    })
    if (!learner) throw new BadRequestException('Active learner not found')
    return this.prisma.learnerGroupMember.upsert({
      where: { groupId_learnerId: { groupId: id, learnerId } }, update: {}, create: { groupId: id, learnerId },
      include: { learner: { include: { userDetail: true } } },
    })
  }

  async removeStudentGroupMember(id: string, learnerId: string, user: JwtPayload) {
    await this.assertGroupAccess(id, user)
    const deleted = await this.prisma.learnerGroupMember.deleteMany({ where: { groupId: id, learnerId } })
    if (!deleted.count) throw new NotFoundException('Learner is not a member of this group')
    return { deleted: true }
  }

  private async assertGroupAccess(id: string, user: JwtPayload) {
    const group = await this.prisma.learnerGroup.findUnique({ where: { id } })
    if (!group) throw new NotFoundException('Student group not found')
    if (!user.roles?.includes('admin') && group.teacherId !== user.sub) {
      throw new ForbiddenException('You can only manage your own groups')
    }
    return group
  }

  private async validateGroupReferences(domainId: string, certificateId: string, teacherId: string) {
    const [domain, certificate, teacher] = await Promise.all([
      this.prisma.domain.findFirst({ where: { id: domainId, isActive: true }, select: { id: true } }),
      this.prisma.certificate.findFirst({ where: { id: certificateId, isActive: true }, select: { id: true } }),
      this.prisma.user.findFirst({
        where: { id: teacherId, status: 'active', userRoles: { some: { role: { code: { in: ['teacher', 'admin'] } } } } },
        select: { id: true },
      }),
    ])
    if (!domain) throw new BadRequestException('Active domain not found')
    if (!certificate) throw new BadRequestException('Active certificate not found')
    if (!teacher) throw new BadRequestException('Teacher or admin not found')
  }

  private validateGroupDates(startsAt?: string, endsAt?: string, currentStart?: Date | null, currentEnd?: Date | null) {
    const start = startsAt !== undefined ? new Date(startsAt) : currentStart
    const end = endsAt !== undefined ? new Date(endsAt) : currentEnd
    if (start && end && start > end) throw new BadRequestException('Start date must be before or equal to end date')
  }

  private async nextGroupCode() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `GRP-${randomBytes(4).toString('hex').toUpperCase()}`
      if (!(await this.prisma.learnerGroup.findUnique({ where: { code }, select: { id: true } }))) return code
    }
    throw new BadRequestException('Could not generate a unique group code')
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
