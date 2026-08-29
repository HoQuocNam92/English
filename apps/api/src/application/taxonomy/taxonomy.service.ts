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
    const { search, examId, isPassed } = params || {}
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
    if (isPassed !== undefined && isPassed !== '') {
      where.isPassed = isPassed === 'true' || isPassed === true
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
}
