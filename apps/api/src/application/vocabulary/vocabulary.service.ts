import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.min(Math.max(1, Number(params.limit) || 20), 100)
    const { search, domainCode, levelCode, status } = params
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.OR = [{ term: { contains: search, mode: 'insensitive' } }, { definitionEn: { contains: search, mode: 'insensitive' } }]
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
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
    const domain = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
    if (!domain || !level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.vocabulary.create({
      data: { term: dto.term, pronunciationIpa: dto.pronunciationIpa, audioUrl: dto.audioUrl, partOfSpeech: dto.partOfSpeech, definitionEn: dto.definitionEn, definitionVi: dto.definitionVi, tags: dto.tags ?? [], domainId: domain.id, levelId: level.id, status: dto.status ?? 'draft',
        examples: dto.examples ? { create: dto.examples.map((e: any, i: number) => ({ sentenceEn: e.sentenceEn, translationVi: e.translationVi, order: i + 1 })) } : undefined }
    })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    if (dto.term) data.term = dto.term
    if (dto.definitionEn) data.definitionEn = dto.definitionEn
    if (dto.definitionVi) data.definitionVi = dto.definitionVi
    if (dto.pronunciationIpa !== undefined) data.pronunciationIpa = dto.pronunciationIpa
    if (dto.tags) data.tags = dto.tags
    if (dto.status) data.status = dto.status
    if (dto.domainCode) { const d = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } }); if (d) data.domainId = d.id }
    if (dto.levelCode) { const l = await this.prisma.level.findUnique({ where: { code: dto.levelCode } }); if (l) data.levelId = l.id }
    return this.prisma.vocabulary.update({ where: { id }, data })
  }

  async delete(id: string) { await this.findOne(id); await this.prisma.vocabulary.delete({ where: { id } }) }
}
