import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { IsString, IsOptional, IsDateString, IsInt, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanItemDto {
  @ApiProperty({ example: 'AWS S3 Storage Basics' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @ApiProperty({ example: '2026-09-03T09:00:00Z' })
  @IsDateString()
  plannedAt: string;

  @ApiProperty({ example: 45 })
  @IsOptional()
  @IsInt()
  durationMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdatePlanItemDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsDateString() plannedAt?: string;
  @IsOptional() @IsInt() durationMin?: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsBoolean() isCompleted?: boolean;
}

@ApiTags('Learning Planner')
@Controller('planner')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlannerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  @ApiOperation({ summary: 'Lấy kế hoạch học trong tuần/tháng' })
  async getMyPlan(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const where: any = { userId: user.sub };
    if (from || to) {
      where.plannedAt = {};
      if (from) where.plannedAt.gte = new Date(from);
      if (to) where.plannedAt.lte = new Date(to);
    }
    const items = await this.prisma.learningPlanItem.findMany({
      where,
      include: { lesson: { select: { id: true, title: true, estimatedMinutes: true } } },
      orderBy: { plannedAt: 'asc' },
    });
    return items;
  }

  @Post('my')
  @ApiOperation({ summary: 'Thêm bài học vào kế hoạch' })
  async addPlanItem(@CurrentUser() user: JwtPayload, @Body() dto: CreatePlanItemDto) {
    const item = await this.prisma.learningPlanItem.create({
      data: {
        userId: user.sub,
        title: dto.title,
        lessonId: dto.lessonId || null,
        plannedAt: new Date(dto.plannedAt),
        durationMin: dto.durationMin ?? 30,
        note: dto.note,
      },
      include: { lesson: { select: { id: true, title: true } } },
    });
    return item;
  }

  @Patch('my/:id')
  @ApiOperation({ summary: 'Cập nhật hoặc đánh dấu hoàn thành kế hoạch' })
  async updatePlanItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePlanItemDto,
  ) {
    await this.prisma.learningPlanItem.updateMany({
      where: { id, userId: user.sub },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.plannedAt && { plannedAt: new Date(dto.plannedAt) }),
        ...(dto.durationMin !== undefined && { durationMin: dto.durationMin }),
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
      },
    });
    return { success: true };
  }

  @Delete('my/:id')
  @ApiOperation({ summary: 'Xóa mục kế hoạch học' })
  async deletePlanItem(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.prisma.learningPlanItem.deleteMany({ where: { id, userId: user.sub } });
    return { success: true };
  }
}
