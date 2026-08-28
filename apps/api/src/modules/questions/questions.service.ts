import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service'

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const { page=1, limit=20, search, domainCode, levelCode, type, status } = params
    const skip=(page-1)*limit; const where: any = {}
    if (search) where.prompt = { contains: search, mode: 'insensitive' }
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (type) where.type = type
    if (status) where.status = status
    const [data,total] = await Promise.all([
      this.prisma.question.findMany({ where, skip, take: limit, include: { domain: true, level: true, options: { orderBy: { order: 'asc' } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.question.count({ where })
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total/limit) } }
  }

  async findOne(id: string) {
    const q = await this.prisma.question.findUnique({ where: { id }, include: { domain: true, level: true, options: { orderBy: { order: 'asc' } }, certificates: { include: { certificate: true } } } })
    if (!q) throw new NotFoundException('Question not found')
    return q
  }

  async create(dto: any) {
    const domain = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
    if (!domain||!level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.question.create({ data: { type: dto.type, prompt: dto.prompt, context: dto.context, codeSnippet: dto.codeSnippet, explanation: dto.explanation, domainId: domain.id, levelId: level.id, topics: dto.topics??[], acceptedAnswers: dto.acceptedAnswers??[], points: dto.points??1.0, status: dto.status??'draft', options: dto.options ? { create: dto.options } : undefined } })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    for (const f of ['type','prompt','context','explanation','topics','acceptedAnswers','points','status']) if (dto[f]!==undefined) data[f]=dto[f]
    return this.prisma.question.update({ where: { id }, data })
  }

  async delete(id: string) { await this.findOne(id); await this.prisma.question.delete({ where: { id } }) }
}
