import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/database/prisma.service';

@ApiTags('Vouchers & Promotions')
@Controller('flash-sales')
export class FlashSaleController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách chương trình Flash Sale đang diễn ra' })
  async getActiveFlashSales(@Query('planId') planId?: string) {
    const now = new Date();
    const whereCondition: any = {
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
    };

    if (planId) {
      whereCondition.planId = planId;
    }

    return this.prisma.flashSale.findMany({
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
  }
}
