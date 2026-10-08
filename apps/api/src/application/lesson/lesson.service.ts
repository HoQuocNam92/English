import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { CreateLessonDto, UpdateLessonDto } from '../../presentation/http-dto/content.dto'

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: Record<string, unknown>) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20))
    const where: any = {}
    if (params.search) where.OR = [
      { title: { contains: String(params.search), mode: 'insensitive' } },
      { summary: { contains: String(params.search), mode: 'insensitive' } },
      { keyConcepts: { has: String(params.search) } },
      { domain: { name: { contains: String(params.search), mode: 'insensitive' } } },
      { domain: { code: { contains: String(params.search), mode: 'insensitive' } } },
      { certificates: { some: { certificate: { name: { contains: String(params.search), mode: 'insensitive' } } } } },
      { certificates: { some: { certificate: { code: { contains: String(params.search), mode: 'insensitive' } } } } },
      { vocabularies: { some: { vocabulary: { term: { contains: String(params.search), mode: 'insensitive' } } } } },
    ]
    if (params.domainCode) where.domain = { code: String(params.domainCode) }
    if (params.levelCode) where.level = { code: String(params.levelCode) }
    if (params.status) where.status = String(params.status)
    if (params.type) where.type = String(params.type)
    if (params.topicId) where.certificationTopics = { some: { topicId: String(params.topicId) } }
    if (params.certificateId) where.certificates = { some: { certificateId: String(params.certificateId) } }

    const [data, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          domain: true,
          level: true,
          certificates: { include: { certificate: true } },
        certificationTopics: { include: { topic: true } },
          vocabularies: { include: { vocabulary: { select: { id: true, term: true } } } },
          createdBy: { include: { userDetail: true } },
          _count: { select: { sections: true, vocabularies: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.lesson.count({ where }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async bulkUpdateStatus(dto: Record<string, any>) {
    const hasIds = Array.isArray(dto.ids) && dto.ids.length > 0
    const filters = ['search', 'domainCode', 'levelCode', 'currentStatus', 'type', 'topic', 'certificateId']
    const hasFilter = filters.some((key) => Boolean(dto[key]))
    if (!hasIds && !hasFilter && dto.confirmAll !== true) throw new BadRequestException('Cần chọn bài học, dùng bộ lọc hoặc xác nhận cập nhật toàn bộ danh sách')
    const where: any = hasIds ? { id: { in: dto.ids } } : {}
    if (!hasIds) {
      if (dto.search) where.OR = [
        { title: { contains: String(dto.search), mode: 'insensitive' } },
        { summary: { contains: String(dto.search), mode: 'insensitive' } },
        { keyConcepts: { has: String(dto.search) } },
        { domain: { name: { contains: String(dto.search), mode: 'insensitive' } } },
        { domain: { code: { contains: String(dto.search), mode: 'insensitive' } } },
        { certificates: { some: { certificate: { name: { contains: String(dto.search), mode: 'insensitive' } } } } },
        { certificates: { some: { certificate: { code: { contains: String(dto.search), mode: 'insensitive' } } } } },
        { vocabularies: { some: { vocabulary: { term: { contains: String(dto.search), mode: 'insensitive' } } } } },
      ]
      if (dto.domainCode) where.domain = { code: dto.domainCode }
      if (dto.levelCode) where.level = { code: dto.levelCode }
      if (dto.currentStatus) where.status = dto.currentStatus
      if (dto.type) where.type = dto.type
      if (dto.topic) where.certificationTopics = { some: { topicId: dto.topic } }
      if (dto.certificateId) where.certificates = { some: { certificateId: dto.certificateId } }
    }
    const result = await this.prisma.lesson.updateMany({
      where,
      data: { status: dto.status, ...(dto.status === 'published' ? { publishedAt: new Date() } : {}) },
    })
    return { updatedCount: result.count, status: dto.status }
  }

  async findOne(idOrSlug: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        domain: true,
        level: true,
        sections: { orderBy: { order: 'asc' } },
        vocabularies: { include: { vocabulary: true } },
        certificates: { include: { certificate: true } },
        certificationTopics: { include: { topic: true } },
        createdBy: { include: { userDetail: true } },
      },
    })
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học')
    return lesson
  }

  async create(dto: CreateLessonDto, createdById: string) {
    await this.assertTopicLinks(dto.topicIds, dto.certificateIds ?? [], dto.type)
    const slug = await this.uniqueSlug(dto.title)
    return this.prisma.lesson.create({
      data: {
        title: dto.title.trim(), slug, summary: dto.summary.trim(), type: dto.type as any,
        domainId: dto.domainId, levelId: dto.levelId, estimatedMinutes: dto.estimatedMinutes,
        thumbnailUrl: dto.thumbnailUrl, keyConcepts: dto.keyConcepts ?? [], status: (dto.status ?? 'draft') as any,
        publishedAt: dto.status === 'published' ? new Date() : undefined, createdById,
        certificationTopics: dto.topicIds?.length ? { create: dto.topicIds.map(topicId => ({ topicId })) } : undefined,
        sections: dto.sections?.length ? { create: dto.sections as any } : undefined,
        certificates: dto.certificateIds?.length ? { create: dto.certificateIds.map(certificateId => ({ certificateId })) } : undefined,
        vocabularies: dto.vocabularyIds?.length ? { create: dto.vocabularyIds.map(vocabularyId => ({ vocabularyId })) } : undefined,
      },
      include: { domain: true, level: true, sections: true, certificates: { include: { certificate: true } } },
    })
  }

  async update(id: string, dto: UpdateLessonDto) {
    const existing = await this.findOne(id)
    await this.assertTopicLinks(dto.topicIds ?? existing.certificationTopics.map(link => link.topicId), dto.certificateIds ?? existing.certificates.map(link => link.certificateId), dto.type ?? existing.type)
    return this.prisma.$transaction(async tx => {
      if (dto.sections) await tx.lessonSection.deleteMany({ where: { lessonId: id } })
      if (dto.certificateIds) await tx.lessonCertificate.deleteMany({ where: { lessonId: id } })
      if (dto.topicIds) await tx.certificationTopicLesson.deleteMany({ where: { lessonId: id } })
      if (dto.vocabularyIds) await tx.lessonVocabulary.deleteMany({ where: { lessonId: id } })
      const data: any = {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.summary !== undefined && { summary: dto.summary.trim() }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.domainId !== undefined && { domainId: dto.domainId }),
        ...(dto.levelId !== undefined && { levelId: dto.levelId }),
        ...(dto.estimatedMinutes !== undefined && { estimatedMinutes: dto.estimatedMinutes }),
        ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
        ...(dto.keyConcepts !== undefined && { keyConcepts: dto.keyConcepts }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.status === 'published' && { publishedAt: new Date() }),
        ...(dto.topicIds && { certificationTopics: { create: dto.topicIds.map(topicId => ({ topicId })) } }),
        ...(dto.sections && { sections: { create: dto.sections } }),
        ...(dto.certificateIds && { certificates: { create: dto.certificateIds.map(certificateId => ({ certificateId })) } }),
        ...(dto.vocabularyIds && { vocabularies: { create: dto.vocabularyIds.map(vocabularyId => ({ vocabularyId })) } }),
      }
      return tx.lesson.update({ where: { id }, data, include: { domain: true, level: true, sections: { orderBy: { order: 'asc' } }, certificates: { include: { certificate: true } } } })
    })
  }

  async remove(id: string) {
    const lesson = await this.findOne(id)
    if (lesson.status === 'published') throw new ConflictException('Hãy chuyển bài học về bản nháp hoặc lưu trữ trước khi xóa')
    await this.prisma.lesson.delete({ where: { id } })
  }

  private async assertTopicLinks(topicIds: string[] | undefined, certificateIds: string[], type: string) {
    if (!topicIds?.length) return
    if (type !== 'certification_review') throw new BadRequestException('Chủ đề chứng chỉ chỉ nhận bài học ôn chứng chỉ.')
    const topics = await this.prisma.certificationTopic.findMany({ where: { id: { in: topicIds } }, select: { id: true, certificateId: true } })
    if (topics.length !== topicIds.length || topics.some(topic => !certificateIds.includes(topic.certificateId))) throw new BadRequestException('Chủ đề phải thuộc chứng chỉ đã chọn.')
  }

  private async uniqueSlug(title: string) {
    const base = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 190) || 'bai-hoc'
    for (let suffix = 0; suffix < 1000; suffix += 1) {
      const slug = suffix ? `${base}-${suffix + 1}` : base
      if (!(await this.prisma.lesson.findUnique({ where: { slug }, select: { id: true } }))) return slug
    }
    throw new ConflictException('Không thể tạo đường dẫn duy nhất cho bài học')
  }
}
