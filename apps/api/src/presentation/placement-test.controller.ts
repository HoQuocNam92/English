import { BadRequestException, Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { PrismaService } from '../infrastructure/database/prisma.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'

type PlacementAnswer = { questionId: string; optionId: string }

@Controller('placement-test')
@UseGuards(JwtAuthGuard)
export class PlacementTestController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getTest() {
    const questions = await this.prisma.question.findMany({
      where: { status: 'published', type: 'multiple_choice', topics: { has: 'placement' } },
      include: { options: { orderBy: { order: 'asc' } }, level: true, domain: true },
      orderBy: [{ level: { order: 'asc' } }, { createdAt: 'asc' }],
      take: 20,
    })

    return {
      data: questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        context: question.context,
        level: { code: question.level.code, name: question.level.name },
        domain: { code: question.domain.code, name: question.domain.name },
        options: question.options.map((option) => ({ id: option.id, key: option.key, text: option.text })),
      })),
    }
  }

  @Post('submit')
  async submit(@Request() req: any, @Body() body: { answers?: PlacementAnswer[] }) {
    if (!Array.isArray(body.answers) || body.answers.length === 0) {
      throw new BadRequestException('Cần trả lời ít nhất một câu hỏi xếp trình độ')
    }
    const questionIds = [...new Set(body.answers.map((answer) => answer.questionId))]
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds }, status: 'published', topics: { has: 'placement' } },
      include: { options: true },
    })
    if (questions.length !== questionIds.length) throw new BadRequestException('Bộ câu trả lời không hợp lệ')

    const correct = questions.reduce((total, question) => {
      const answer = body.answers.find((item) => item.questionId === question.id)
      return total + (question.options.some((option) => option.id === answer?.optionId && option.isCorrect) ? 1 : 0)
    }, 0)
    const percent = Math.round((correct / questions.length) * 100)
    const levelCode = percent < 40 ? 'beginner' : percent < 70 ? 'intermediate' : percent < 90 ? 'advanced' : 'professional'
    const level = await this.prisma.level.findUnique({ where: { code: levelCode } })
    if (level) {
      await this.prisma.learnerProfile.updateMany({ where: { userId: req.user.sub }, data: { levelId: level.id } })
    }
    return { correct, total: questions.length, percent, levelCode, levelName: level?.name ?? levelCode }
  }
}
