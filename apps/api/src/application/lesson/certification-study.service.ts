import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class CertificationStudyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCertificateProgress(learnerId: string, certificateId: string) {
    const certificate = await this.prisma.certificate.findUnique({ where: { id: certificateId }, select: { isActive: true } })
    if (!certificate?.isActive) throw new NotFoundException('Chứng chỉ không khả dụng.')
    const topics = await this.prisma.certificationTopic.findMany({
      where: { certificateId }, orderBy: [{ domainId: 'asc' }, { order: 'asc' }],
      select: { id: true, lessons: { where: { lesson: { status: 'published', type: 'certification_review' } }, select: { lesson: { select: { id: true, title: true, estimatedMinutes: true } } } } },
    })
    const ids = [...new Set(topics.flatMap(topic => topic.lessons.map(link => link.lesson.id)))]
    const progress = await this.prisma.learningProgress.findMany({ where: { learnerId, resourceType: 'lesson', resourceId: { in: ids } } })
    const byId = new Map(progress.map(item => [item.resourceId, item]))
    return { topics: topics.map(topic => {
      const lessons = topic.lessons.map(link => ({ ...link.lesson, progress: byId.get(link.lesson.id) ?? null }))
      const completed = lessons.filter(lesson => lesson.progress?.status === 'completed').length
      return { topicId: topic.id, total: lessons.length, completed, started: lessons.some(lesson => lesson.progress !== null), lessons }
    }) }
  }

  async getTopic(learnerId: string, topicId: string) {
    const topic = await this.prisma.certificationTopic.findUnique({
      where: { id: topicId },
      include: { certificateDomain: { include: { certificate: true, domain: true } }, lessons: { where: { lesson: { status: 'published', type: 'certification_review' } }, include: { lesson: { include: { sections: { orderBy: { order: 'asc' } }, domain: true, level: true } } } } },
    })
    if (!topic?.certificateDomain.certificate.isActive) throw new NotFoundException('Chủ đề không khả dụng.')
    const ids = topic.lessons.map(link => link.lesson.id)
    const [progress, exams] = await Promise.all([
      this.prisma.learningProgress.findMany({ where: { learnerId, resourceType: 'lesson', resourceId: { in: ids } } }),
      this.prisma.exam.findMany({ where: { certificateId: topic.certificateId, kind: 'practice', status: 'published', topics: { has: topic.code } }, select: { id: true, title: true, durationMinutes: true, _count: { select: { questions: true } } } }),
    ])
    const byId = new Map(progress.map(item => [item.resourceId, item]))
    return { id: topic.id, code: topic.code, name: topic.name, description: topic.description, certificate: topic.certificateDomain.certificate, domain: topic.certificateDomain.domain, lessons: topic.lessons.map(link => ({ ...link.lesson, progress: byId.get(link.lesson.id) ?? null })), exams }
  }
}
