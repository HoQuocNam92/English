import {
  Controller, Post, Get, Body, Param, UseGuards,
  Headers, RawBodyRequest, Req, HttpCode, HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from '../application/payment/payment.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { CreateOrderDto } from './http-dto/payment.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly svc: PaymentService) {}

  // ─── Tạo đơn hàng ───────────────────────────────────────────────────────────
  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Tạo đơn hàng thanh toán SePay',
    description: `
**Idempotency**: Client phải gửi header \`Idempotency-Key\` (UUID hoặc chuỗi unique ≤128 ký tự).
Nếu gọi lại với cùng key → server trả về đơn cũ, không tạo mới.

**Quota**: Nếu plan có giới hạn slot, server sẽ kiểm tra và lock row trong DB transaction.
    `.trim(),
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'UUID hoặc chuỗi unique do client generate. Bắt buộc.',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const key = idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return this.svc.createOrder(user.sub, dto.planId, key);
  }

  // ─── SePay Webhook ──────────────────────────────────────────────────────────
  /**
   * SePay gọi endpoint này khi có giao dịch mới.
   * QUAN TRỌNG: Endpoint này phải nhận raw body để verify HMAC signature.
   *
   * Cấu hình trong NestJS main.ts:
   *   app.use('/api/v1/payment/webhook', rawBodyMiddleware)
   *
   * Luôn trả HTTP 200 sau khi verify sig để SePay không retry vô hạn.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SePay webhook receiver — KHÔNG cần auth',
    description: 'SePay gọi endpoint này khi có giao dịch. Verify HMAC-SHA256 signature từ header x-sepay-signature.',
  })
  async webhook(
    @Headers('x-sepay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
  ) {
    const rawBody = req.rawBody?.toString('utf8') ?? JSON.stringify(payload);
    return this.svc.handleWebhook(rawBody, signature ?? '', payload);
  }

  // ─── Status ─────────────────────────────────────────────────────────────────
  @Get('orders/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kiểm tra trạng thái đơn hàng' })
  getOrderStatus(@Param('orderId') orderId: string) {
    return this.svc.getOrderStatus(orderId);
  }

  @Get('status/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Alias cho /orders/:orderId (backward compat)' })
  getStatus(@Param('orderId') orderId: string) {
    return this.svc.getOrderStatus(orderId);
  }

  @Get('subscription/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kiểm tra subscription hiện tại của user' })
  getMySubscription(@CurrentUser() user: JwtPayload) {
    return this.svc.getMySubscription(user.sub);
  }

  @Get('history/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách lịch sử đơn hàng/giao dịch thanh toán của user' })
  getMyOrders(@CurrentUser() user: JwtPayload) {
    return this.svc.getMyOrders(user.sub);
  }

  @Get('orders/my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Alias cho /history/me' })
  getMyOrdersAlias(@CurrentUser() user: JwtPayload) {
    return this.svc.getMyOrders(user.sub);
  }
}
