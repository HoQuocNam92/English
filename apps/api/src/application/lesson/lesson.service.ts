import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
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

  async findOne(idOrSlug: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        domain: true,
        level: true,
        sections: { orderBy: { order: 'asc' } },
        vocabularies: { include: { vocabulary: true } },
        certificates: { include: { certificate: true } },
        createdBy: { include: { userDetail: true } },
      },
    })
    if (!lesson) throw new NotFoundException('Không tìm thấy bài học')
    return lesson
  }

  async create(dto: CreateLessonDto, createdById: string) {
    const slug = await this.uniqueSlug(dto.title)
    return this.prisma.lesson.create({
      data: {
        title: dto.title.trim(), slug, summary: dto.summary.trim(), type: dto.type as any,
        domainId: dto.domainId, levelId: dto.levelId, estimatedMinutes: dto.estimatedMinutes,
        thumbnailUrl: dto.thumbnailUrl, keyConcepts: dto.keyConcepts ?? [], status: (dto.status ?? 'draft') as any,
        publishedAt: dto.status === 'published' ? new Date() : undefined, createdById,
        sections: dto.sections?.length ? { create: dto.sections as any } : undefined,
        certificates: dto.certificateIds?.length ? { create: dto.certificateIds.map(certificateId => ({ certificateId })) } : undefined,
        vocabularies: dto.vocabularyIds?.length ? { create: dto.vocabularyIds.map(vocabularyId => ({ vocabularyId })) } : undefined,
      },
      include: { domain: true, level: true, sections: true, certificates: { include: { certificate: true } } },
    })
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findOne(id)
    return this.prisma.$transaction(async tx => {
      if (dto.sections) await tx.lessonSection.deleteMany({ where: { lessonId: id } })
      if (dto.certificateIds) await tx.lessonCertificate.deleteMany({ where: { lessonId: id } })
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
