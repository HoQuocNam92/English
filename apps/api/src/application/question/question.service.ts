import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const { page = 1, limit = 20, search, domainCode, levelCode, status, type } = params
    const skip = (Number(page) - 1) * Number(limit)
    const where: any = {}
    if (search) where.prompt = { contains: search, mode: 'insensitive' }
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    if (type) where.type = type
    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where, skip, take: Number(limit),
        include: { domain: true, level: true, options: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({ where }),
    ])
    return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } }
  }

  async findOne(id: string) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: { domain: true, level: true, options: { orderBy: { order: 'asc' } } },
    })
    if (!q) throw new NotFoundException('Question not found')
    return q
  }

  async create(dto: any) {
    const domain = await this.prisma.domain.findUnique({ where: { code: dto.domainCode } })
    const level = await this.prisma.level.findUnique({ where: { code: dto.levelCode } })
    if (!domain || !level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.question.create({
      data: {
        type: dto.type, prompt: dto.prompt, context: dto.context,
        explanation: dto.explanation, points: dto.points ?? 1.0,
        status: dto.status ?? 'draft', topics: dto.topics ?? [],
        domainId: domain.id, levelId: level.id,
        options: dto.options ? { create: dto.options.map((o: any, i: number) => ({ key: o.key, text: o.text, isCorrect: o.isCorrect ?? false, explanation: o.explanation, order: i + 1 })) } : undefined,
      },
    })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    const fields = ['type','prompt','context','explanation','points','status','topics']
    for (const f of fields) if (dto[f] !== undefined) data[f] = dto[f]
    return this.prisma.question.update({ where: { id }, data })
  }

  async delete(id: string) {
    const q = await this.findOne(id)
    await this.prisma.questionOption.deleteMany({ where: { questionId: q.id } })
    await this.prisma.question.delete({ where: { id: q.id } })
  }
}