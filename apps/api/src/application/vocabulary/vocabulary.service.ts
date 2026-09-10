import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 3000)
    const { search, domainCode, levelCode, status, lessonId } = params
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.OR = [{ term: { contains: search, mode: 'insensitive' } }, { definitionEn: { contains: search, mode: 'insensitive' } }]
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    if (lessonId) {
      where.lessonVocabs = { some: { lessonId } }
    }
    const [data, total] = await Promise.all([
      this.prisma.vocabulary.findMany({ where, skip, take: limit, include: { domain: true, level: true, examples: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.vocabulary.count({ where })
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const v = await this.prisma.vocabulary.findUnique({ where: { id }, include: { domain: true, level: true, examples: { orderBy: { order: 'asc' } } } })
    if (!v) throw new NotFoundException('Vocabulary not found')
    return v
  }

  async create(dto: any) {
    const domain = dto.domainId
      ? await this.prisma.domain.findUnique({ where: { id: dto.domainId } })
      : dto.domainCode
      ? await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
      : null
    const level = dto.levelId
      ? await this.prisma.level.findUnique({ where: { id: dto.levelId } })
      : dto.levelCode
      ? await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
      : null
    if (!domain || !level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.vocabulary.create({
      data: {
        term: dto.term,
        pronunciationIpa: dto.pronunciationIpa,
        audioUrl: dto.audioUrl,
        partOfSpeech: dto.partOfSpeech,
        definitionEn: dto.definitionEn,
        definitionVi: dto.definitionVi,
        tags: dto.tags ?? [],
        domainId: domain.id,
        levelId: level.id,
        status: dto.status ?? 'draft',
        examples: dto.examples
          ? {
              create: dto.examples.map((e: any, i: number) => ({
                sentenceEn: e.sentenceEn,
                translationVi: e.translationVi,
                order: i + 1,
              })),
            }
          : undefined,
      },
      include: { domain: true, level: true, examples: true },
    })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    if (dto.term !== undefined) data.term = dto.term
    if (dto.definitionEn !== undefined) data.definitionEn = dto.definitionEn
    if (dto.definitionVi !== undefined) data.definitionVi = dto.definitionVi
    if (dto.pronunciationIpa !== undefined) data.pronunciationIpa = dto.pronunciationIpa
    if (dto.partOfSpeech !== undefined) data.partOfSpeech = dto.partOfSpeech
    if (dto.audioUrl !== undefined) data.audioUrl = dto.audioUrl
    if (dto.tags !== undefined) data.tags = dto.tags
    if (dto.status !== undefined) data.status = dto.status
    if (dto.domainId) {
      const d = await this.prisma.domain.findUnique({ where: { id: dto.domainId } })
      if (d) data.domainId = d.id
    } else if (dto.domainCode) {
      const d = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
      if (d) data.domainId = d.id
    }
    if (dto.levelId) {
      const l = await this.prisma.level.findUnique({ where: { id: dto.levelId } })
      if (l) data.levelId = l.id
    } else if (dto.levelCode) {
      const l = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
      if (l) data.levelId = l.id
    }
    return this.prisma.vocabulary.update({
      where: { id },
      data,
      include: { domain: true, level: true, examples: true },
    })
  }

  async bulkUpdateStatus(dto: any) {
    const hasIds = Array.isArray(dto.ids) && dto.ids.length > 0
    const hasFilter = Boolean(dto.domainCode || dto.currentStatus || dto.search)
    if (!hasIds && !hasFilter && dto.confirmAll !== true) {
      throw new BadRequestException('Cần chọn từ vựng, dùng bộ lọc hoặc xác nhận cập nhật toàn bộ kho')
    }
    const where: any = hasIds ? { id: { in: dto.ids } } : {}
    if (!hasIds && dto.domainCode) where.domain = { code: dto.domainCode }
    if (!hasIds && dto.currentStatus) where.status = dto.currentStatus
    if (!hasIds && dto.search) where.OR = [
      { term: { contains: dto.search, mode: 'insensitive' } },
      { definitionEn: { contains: dto.search, mode: 'insensitive' } },
      { definitionVi: { contains: dto.search, mode: 'insensitive' } },
    ]
    const result = await this.prisma.vocabulary.updateMany({ where, data: { status: dto.status } })
    return { updatedCount: result.count, status: dto.status }
  }

  async delete(id: string) { await this.findOne(id); await this.prisma.vocabulary.delete({ where: { id } }) }
}
