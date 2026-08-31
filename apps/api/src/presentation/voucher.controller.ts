import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { ApplyVoucherDto } from './http-dto/payment.dto';
import { PLANS, PlanId } from '../application/payment/payment.service';

@ApiTags('Vouchers & Promotions')
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly prisma: PrismaService) {}

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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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
      throw new BadRequestException(`Mã giảm giá yêu cầu đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')} VNĐ.`);
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
}
