import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service'

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async learnersByDomain() {
    const domains = await this.prisma.domain.findMany({ where: { isActive: true }, include: { profileDomains: { include: { profile: { include: { user: { include: { userDetail: true } } } } } } } })
    return domains.map(d => ({ domainCode: d.code, domainName: d.name, learnerCount: d.profileDomains.length }))
  }

  async scoresByCertificate() {
    const certs = await this.prisma.certificate.findMany({ where: { isActive: true } })
    const result = []
    for (const cert of certs) {
      const attempts = await this.prisma.examAttempt.findMany({ where: { exam: { certificateId: cert.id }, status: 'graded' }, select: { scorePercent: true, passed: true } })
      const avgScore = attempts.length ? attempts.reduce((s,a) => s + (a.scorePercent??0), 0) / attempts.length : 0
      const passRate = attempts.length ? attempts.filter(a => a.passed).length / attempts.length * 100 : 0
      result.push({ certCode: cert.code, certName: cert.name, totalAttempts: attempts.length, avgScore: Math.round(avgScore*10)/10, passRate: Math.round(passRate*10)/10 })
    }
    return result
  }

  async overallStats() {
    const [totalUsers, totalLearners, totalTeachers, totalLessons, totalExams, totalAttempts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.userRole.count({ where: { role: { code: 'learner' } } }),
      this.prisma.userRole.count({ where: { role: { code: 'teacher' } } }),
      this.prisma.lesson.count({ where: { status: 'published' } }),
      this.prisma.exam.count({ where: { status: 'published' } }),
      this.prisma.examAttempt.count()
    ])
    return { totalUsers, totalLearners, totalTeachers, totalLessons, totalExams, totalAttempts }
  }
}
