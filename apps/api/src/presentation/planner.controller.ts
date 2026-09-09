import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../infrastructure/database/prisma.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { CreateLearningPlanItemDto, UpdateLearningPlanItemDto } from './http-dto/group-planner.dto'

@ApiTags('Learning Planner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planner')
export class PlannerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  @ApiOperation({ summary: 'List my learning plan items' })
  async list(@CurrentUser() user: JwtPayload, @Query('from') from?: string, @Query('to') to?: string) {
    const plannedAt: { gte?: Date; lte?: Date } = {}
    if (from) {
      const date = new Date(`${from}T00:00:00.000Z`)
      if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid from date')
      plannedAt.gte = date
    }
    if (to) {
      const date = new Date(`${to}T23:59:59.999Z`)
      if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid to date')
      plannedAt.lte = date
    }
    if (plannedAt.gte && plannedAt.lte && plannedAt.gte > plannedAt.lte) {
      throw new BadRequestException('from must be before or equal to to')
    }

    return this.prisma.learningPlanItem.findMany({
      where: { userId: user.sub, ...(Object.keys(plannedAt).length ? { plannedAt } : {}) },
      include: { lesson: { select: { id: true, title: true, slug: true } } },
      orderBy: [{ plannedAt: 'asc' }, { createdAt: 'asc' }],
    })
  }

  @Post('my')
  @ApiOperation({ summary: 'Create a learning plan item' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLearningPlanItemDto) {
    if (dto.lessonId) await this.ensureLesson(dto.lessonId)
    return this.prisma.learningPlanItem.create({
      data: {
        userId: user.sub,
        title: dto.title.trim(),
        note: dto.note?.trim() || null,
        plannedAt: new Date(dto.plannedAt),
        durationMin: dto.durationMin,
        lessonId: dto.lessonId || null,
      },
      include: { lesson: { select: { id: true, title: true, slug: true } } },
    })
  }

  @Patch('my/:id')
  @ApiOperation({ summary: 'Update or complete my learning plan item' })
  async update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateLearningPlanItemDto) {
    await this.ensureOwned(id, user.sub)
    if (dto.lessonId) await this.ensureLesson(dto.lessonId)
    return this.prisma.learningPlanItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.note !== undefined ? { note: dto.note.trim() || null } : {}),
        ...(dto.plannedAt !== undefined ? { plannedAt: new Date(dto.plannedAt) } : {}),
        ...(dto.durationMin !== undefined ? { durationMin: dto.durationMin } : {}),
        ...(dto.lessonId !== undefined ? { lessonId: dto.lessonId || null } : {}),
        ...(dto.isCompleted !== undefined ? { isCompleted: dto.isCompleted } : {}),
      },
      include: { lesson: { select: { id: true, title: true, slug: true } } },
    })
  }

  @Delete('my/:id')
  @ApiOperation({ summary: 'Delete my learning plan item' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.ensureOwned(id, user.sub)
    await this.prisma.learningPlanItem.delete({ where: { id } })
    return { deleted: true }
  }

  private async ensureOwned(id: string, userId: string) {
    const item = await this.prisma.learningPlanItem.findFirst({ where: { id, userId }, select: { id: true } })
    if (!item) throw new NotFoundException('Learning plan item not found')
  }

  private async ensureLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, select: { id: true } })
    if (!lesson) throw new BadRequestException('Lesson not found')
  }
}
