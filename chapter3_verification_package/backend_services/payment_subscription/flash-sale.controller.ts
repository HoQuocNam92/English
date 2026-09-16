import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { CreateFlashSaleDto, UpdateFlashSaleDto } from './http-dto/voucher.dto';
import { PLANS } from '../application/payment/payment.service';

@ApiTags('Vouchers & Promotions')
@Controller('flash-sales')
export class FlashSaleController {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public: Flash sales đang active ──────────────────────────────────────
  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách chương trình Flash Sale đang diễn ra' })
  async getActiveFlashSales(@Query('planId') planId?: string) {
    const now = new Date();
    const whereCondition: any = {
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
    };
    if (planId) whereCondition.planId = planId;

    const sales = await this.prisma.flashSale.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        description: true,
        planId: true,
        discountPercent: true,
        startTime: true,
        endTime: true,
      },
      orderBy: { endTime: 'asc' },
    });

    // Tính giá sau flash sale
    return sales.map((s) => {
      const plan = (PLANS as any)[s.planId];
      const originalAmount = plan?.amount ?? null;
      const discountedAmount =
        originalAmount !== null
          ? Math.floor(originalAmount * (1 - s.discountPercent / 100))
          : null;
      return { ...s, originalAmount, discountedAmount };
    });
  }

  // ─── Admin: danh sách có phân trang ───────────────────────────────────────
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('flash-sales:manage')
  @ApiOperation({ summary: '[Admin] Danh sách tất cả Flash Sale (có phân trang)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllFlashSales(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = Math.max(1, Number(page));
    const l = Math.min(Math.max(1, Number(limit)), 100);
    const skip = (p - 1) * l;
    const [data, total] = await Promise.all([
      this.prisma.flashSale.findMany({ skip, take: l, orderBy: { createdAt: 'desc' } }),
      this.prisma.flashSale.count(),
    ]);
    return { data, meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } };
  }

  // ─── Admin: tạo flash sale ────────────────────────────────────────────────
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('flash-sales:manage')
  @ApiOperation({ summary: '[Admin] Tạo chương trình Flash Sale mới' })
  async createFlashSale(@Body() dto: CreateFlashSaleDto) {
    return this.prisma.flashSale.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        planId: dto.planId,
        discountPercent: dto.discountPercent,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        isActive: dto.isActive ?? true,
      },
    });
  }

  // ─── Admin: cập nhật ──────────────────────────────────────────────────────
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('flash-sales:manage')
  @ApiOperation({ summary: '[Admin] Cập nhật Flash Sale' })
  async updateFlashSale(@Param('id') id: string, @Body() dto: UpdateFlashSaleDto) {
    const sale = await this.prisma.flashSale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Flash Sale không tồn tại.');
    const data: any = {};
    const fields = ['title', 'description', 'planId', 'discountPercent', 'isActive'] as const;
    for (const f of fields) if ((dto as any)[f] !== undefined) data[f] = (dto as any)[f];
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    return this.prisma.flashSale.update({ where: { id }, data });
  }

  // ─── Admin: bật/tắt ──────────────────────────────────────────────────────
  @Patch(':id/toggle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('flash-sales:manage')
  @ApiOperation({ summary: '[Admin] Bật hoặc tắt Flash Sale' })
  async toggleFlashSale(@Param('id') id: string) {
    const sale = await this.prisma.flashSale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Flash Sale không tồn tại.');
    return this.prisma.flashSale.update({ where: { id }, data: { isActive: !sale.isActive } });
  }

  // ─── Admin: xóa ──────────────────────────────────────────────────────────
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('flash-sales:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Xóa Flash Sale' })
  async deleteFlashSale(@Param('id') id: string) {
    const sale = await this.prisma.flashSale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException('Flash Sale không tồn tại.');
    await this.prisma.flashSale.delete({ where: { id } });
  }
}
