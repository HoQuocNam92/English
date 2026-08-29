import { Controller, Post, Get, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../application/payment/payment.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private svc: PaymentService) {}

  @Post('create-order')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() u: JwtPayload, @Body() dto: { planId: string }) {
    return this.svc.createOrder(u.sub, dto.planId);
  }

  @Post('webhook')
  webhook(@Headers('x-sepay-signature') sig: string, @Body() payload: any) {
    return this.svc.handleWebhook(sig, payload);
  }

  @Get('status/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getStatus(@Param('orderId') orderId: string) {
    return this.svc.getOrderStatus(orderId);
  }
}
