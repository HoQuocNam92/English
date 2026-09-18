import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/database/prisma.service'

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const page = Math.max(1, Number(params?.page) || 1)
    const limit = Math.min(Math.max(1, Number(params?.limit) || 20), 100)
    const { search, domainCode, levelCode, status, type, examId } = params || {}
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.prompt = { contains: search, mode: 'insensitive' }
    if (domainCode) where.domain = { code: domainCode }
    if (levelCode) where.level = { code: levelCode }
    if (status) where.status = status
    if (type) where.type = type
    if (examId) where.examQuestions = { some: { examId } }
    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where, skip, take: limit,
        include: {
          domain: true,
          level: true,
          options: { orderBy: { order: 'asc' } },
          certificates: { include: { certificate: true } },
          examQuestions: { include: { exam: { select: { id: true, title: true } } }, orderBy: { order: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.question.count({ where }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const q = await this.prisma.question.findUnique({
      where: { id },
      include: {
        domain: true,
        level: true,
        options: { orderBy: { order: 'asc' } },
        certificates: { include: { certificate: true } },
        examQuestions: { include: { exam: { select: { id: true, title: true } } }, orderBy: { order: 'asc' } },
      },
    })
    if (!q) throw new NotFoundException('Question not found')
    return q
  }

  async create(dto: any) {
    const domain = await this.prisma.domain.findUnique({ where: { id: dto.domainId } })
    const level = await this.prisma.level.findUnique({ where: { id: dto.levelId } })
    if (!domain || !level) throw new NotFoundException('Domain or Level not found')
    return this.prisma.question.create({
      data: {
        type: dto.type, prompt: dto.prompt, context: dto.context,
        explanation: dto.explanation, points: dto.points ?? 1.0,
        status: dto.status ?? 'draft', topics: dto.topics ?? [],
        domainId: domain.id, levelId: level.id,
        options: dto.options ? { create: dto.options.map((o: any, i: number) => ({ key: o.key, text: o.text, isCorrect: o.isCorrect ?? false, explanation: o.explanation, order: i + 1 })) } : undefined,
        certificates: dto.certificateIds?.length ? { create: dto.certificateIds.map((certificateId: string) => ({ certificateId })) } : undefined,
      },
    })
  }

  async update(id: string, dto: any) {
    await this.findOne(id)
    const data: any = {}
    const fields = ['type','prompt','context','explanation','points','status','topics']
    for (const f of fields) if (dto[f] !== undefined) data[f] = dto[f]
    if (dto.domainId !== undefined) data.domain = { connect: { id: dto.domainId } }
    if (dto.levelId !== undefined) data.level = { connect: { id: dto.levelId } }
    return this.prisma.$transaction(async (tx) => {
      if (dto.options !== undefined) {
        await tx.questionOption.deleteMany({ where: { questionId: id } })
        data.options = { create: dto.options.map((option: any, index: number) => ({ ...option, order: index + 1 })) }
      }
      if (dto.certificateIds !== undefined) {
        await tx.questionCertificate.deleteMany({ where: { questionId: id } })
        data.certificates = { create: dto.certificateIds.map((certificateId: string) => ({ certificateId })) }
      }
      return tx.question.update({ where: { id }, data })
    })
  }

  async delete(id: string) {
    const q = await this.findOne(id)
    await this.prisma.$transaction([
      this.prisma.examQuestion.deleteMany({ where: { questionId: q.id } }),
      this.prisma.questionCertificate.deleteMany({ where: { questionId: q.id } }),
      this.prisma.questionOption.deleteMany({ where: { questionId: q.id } }),
      this.prisma.question.delete({ where: { id: q.id } }),
    ])
  }

  async bulkCreate(dtos: any[]) {
    if (!Array.isArray(dtos) || dtos.length === 0) {
      return { count: 0, success: true, message: 'Không có câu hỏi nào để nhập' }
    }

    const [allDomains, allLevels] = await Promise.all([
      this.prisma.domain.findMany(),
      this.prisma.level.findMany(),
    ])

    const domainMap = new Map<string, string>()
    for (const d of allDomains) {
      domainMap.set(d.id.toLowerCase(), d.id)
      domainMap.set(d.code.toLowerCase(), d.id)
      domainMap.set(d.name.toLowerCase(), d.id)
    }

    const levelMap = new Map<string, string>()
    for (const l of allLevels) {
      levelMap.set(l.id.toLowerCase(), l.id)
      levelMap.set(l.code.toLowerCase(), l.id)
      levelMap.set(l.name.toLowerCase(), l.id)
    }

    const defaultDomainId = allDomains[0]?.id
    const defaultLevelId = allLevels[0]?.id

    const created = await this.prisma.$transaction(async (tx) => {
      const results = []
      for (const item of dtos) {
        const dKey = String(item.domainId || item.domainCode || item.domain || '').trim().toLowerCase()
        const domainId = domainMap.get(dKey) || defaultDomainId

        const lKey = String(item.levelId || item.levelCode || item.level || '').trim().toLowerCase()
        const levelId = levelMap.get(lKey) || defaultLevelId

        if (!domainId || !levelId) continue

        const q = await tx.question.create({
          data: {
            type: item.type || 'single_choice',
            prompt: item.prompt,
            context: item.context || null,
            explanation: item.explanation || '',
            points: Number(item.points) || 1.0,
            status: item.status || 'published',
            topics: Array.isArray(item.topics) ? item.topics : [],
            domainId,
            levelId,
            options: item.options ? {
              create: item.options.map((o: any, idx: number) => ({
                key: o.key || String.fromCharCode(65 + idx),
                text: o.text,
                isCorrect: Boolean(o.isCorrect),
                explanation: o.explanation || null,
                order: idx + 1,
              })),
            } : undefined,
          },
        })
        results.push(q)
      }
      return results
    })

    return {
      count: created.length,
      success: true,
      message: `Đã nhập thành công ${created.length} câu hỏi.`,
    }
  }
}
