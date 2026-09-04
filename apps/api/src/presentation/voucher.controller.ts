import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { ApplyVoucherDto } from './http-dto/payment.dto';
import { PLANS, PlanId } from '../application/payment/payment.service';
import {
  CreateVoucherDto,
  UpdateVoucherDto,
} from './http-dto/voucher.dto';

@ApiTags('Vouchers & Promotions')
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public: lấy danh sách voucher đang active ────────────────────────────
  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách mã giảm giá Voucher đang có hiệu lực' })
  async getActiveVouchers() {
    const now = new Date();
    return this.prisma.voucher.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        code: true,
        name: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        maxDiscountAmount: true,
        endDate: true,
        usageLimit: true,
        usedCount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Public: áp dụng voucher ──────────────────────────────────────────────
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Áp dụng mã giảm giá và tính toán số tiền sau chiết khấu' })
  async applyVoucher(@Body() dto: ApplyVoucherDto) {
    const plan = PLANS[dto.planId as PlanId];
    if (!plan) {
      throw new BadRequestException(`Gói dịch vụ không hợp lệ: ${dto.planId}`);
    }

    const now = new Date();
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase().trim() },
    });

    if (!voucher || !voucher.isActive) {
      throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã bị khóa.');
    }
    if (now < voucher.startDate || now > voucher.endDate) {
      throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng.');
    }
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng.');
    }
    if (plan.amount < voucher.minOrderAmount) {
      throw new BadRequestException(
        `Mã giảm giá yêu cầu đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')} VNĐ.`,
      );
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = Math.floor((plan.amount * voucher.discountValue) / 100);
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    const finalAmount = Math.max(0, plan.amount - discountAmount);

    return {
      valid: true,
      code: voucher.code,
      name: voucher.name,
      originalAmount: plan.amount,
      discountAmount,
      finalAmount,
      message: `Áp dụng thành công! Bạn được giảm ${discountAmount.toLocaleString('vi-VN')} VNĐ.`,
    };
  }

  // ─── Admin: danh sách có phân trang ───────────────────────────────────────
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('vouchers:manage')
  @ApiOperation({ summary: '[Admin] Danh sách tất cả voucher (có phân trang)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getAllVouchers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, Number(page));
    const l = Math.min(Math.max(1, Number(limit)), 100);
    const skip = (p - 1) * l;
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.voucher.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' } }),
      this.prisma.voucher.count({ where }),
    ]);
    return { data, meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } };
  }

  // ─── Admin: tạo voucher mới ───────────────────────────────────────────────
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('vouchers:manage')
  @ApiOperation({ summary: '[Admin] Tạo mã giảm giá mới' })
  async createVoucher(@Body() dto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase().trim() },
    });
    if (existing) throw new BadRequestException(`Mã voucher "${dto.code}" đã tồn tại.`);
    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase().trim(),
        name: dto.name,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount ?? 0,
        maxDiscountAmount: dto.maxDiscountAmount ?? null,
        usageLimit: dto.usageLimit ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
      },
    });
  }

  // ─── Admin: cập nhật voucher ──────────────────────────────────────────────
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('vouchers:manage')
  @ApiOperation({ summary: '[Admin] Cập nhật mã giảm giá' })
  async updateVoucher(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher không tồn tại.');
    const data: any = {};
    const fields = ['name', 'discountType', 'discountValue', 'minOrderAmount', 'maxDiscountAmount', 'usageLimit', 'isActive'] as const;
    for (const f of fields) if ((dto as any)[f] !== undefined) data[f] = (dto as any)[f];
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.voucher.update({ where: { id }, data });
  }

  // ─── Admin: bật/tắt voucher ───────────────────────────────────────────────
  @Patch(':id/toggle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('vouchers:manage')
  @ApiOperation({ summary: '[Admin] Bật hoặc tắt mã giảm giá' })
  async toggleVoucher(@Param('id') id: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher không tồn tại.');
    return this.prisma.voucher.update({ where: { id }, data: { isActive: !voucher.isActive } });
  }

  // ─── Admin: xóa voucher ───────────────────────────────────────────────────
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('vouchers:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Xóa mã giảm giá' })
  async deleteVoucher(@Param('id') id: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new NotFoundException('Voucher không tồn tại.');
    await this.prisma.voucher.delete({ where: { id } });
  }
}
