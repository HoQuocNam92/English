import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const { page = 1, limit = 20, search, domainCode, levelCode, status, type } = params
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { summary: { contains: search, mode: 'insensitive' } }]
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    if (type) where.type = type
    const [data, total] = await Promise.all([
      this.prisma.lesson.findMany({ where, skip, take: limit, include: { domain: true, level: true, createdBy: { include: { userDetail: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.lesson.count({ where })
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findFirst({ where: { OR: [{ id }, { slug: id }] }, include: { domain: true, level: true, sections: { orderBy: { order: 'asc' } }, vocabularies: { include: { vocabulary: true } }, certificates: { include: { certificate: true } } } })
    if (!lesson) throw new NotFoundException('Lesson not found')
    return lesson
  }

  async create(dto: any, createdById: string) {
    const domain = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
    if (!domain || !level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.lesson.create({ data: { title: dto.title, slug: dto.slug ?? dto.title.toLowerCase().replace(/\s+/g,'-').slice(0,200), summary: dto.summary, type: dto.type, domainId: domain.id, levelId: level.id, estimatedMinutes: dto.estimatedMinutes, thumbnailUrl: dto.thumbnailUrl, status: dto.status ?? 'draft', createdById, sections: dto.sections ? { create: dto.sections } : undefined } })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    const fields = ['title','summary','type','estimatedMinutes','thumbnailUrl','status']
    for (const f of fields) if (dto[f] !== undefined) data[f] = dto[f]
    if (dto.status === 'published' && !data.publishedAt) data.publishedAt = new Date()
    return this.prisma.lesson.update({ where: { id }, data })
  }

  async delete(id: string) { await this.findOne(id); await this.prisma.lesson.delete({ where: { id } }) }
  async publish(id: string) { await this.findOne(id); return this.prisma.lesson.update({ where: { id }, data: { status: 'published', publishedAt: new Date() } }) }
  async archive(id: string) { await this.findOne(id); return this.prisma.lesson.update({ where: { id }, data: { status: 'archived' } }) }
}
