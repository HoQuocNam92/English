import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

const SEPAY_API_URL = 'https://my.sepay.vn/userapi';
const PLANS = {
  pro_monthly: { name: 'TechEnglish PRO - 1 Tháng', amount: 99000, duration: 30 },
  pro_yearly: { name: 'TechEnglish PRO - 1 Năm', amount: 799000, duration: 365 },
};

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, planId: string) {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) throw new BadRequestException('Invalid plan');
    
    const apiKey = process.env.SEPAY_API_KEY ?? 'placeholder';
    const orderId = `TE-${Date.now()}-${userId.slice(0, 8)}`;
    
    // Create SePay payment link
    // Real integration: POST to SePay API
    // For now return mock structure that can be activated with real API key
    const paymentUrl = apiKey !== 'placeholder'
      ? await this.callSePayAPI(orderId, plan)
      : `https://my.sepay.vn/pay?order=${orderId}&amount=${plan.amount}`;

    return {
      orderId,
      paymentUrl,
      amount: plan.amount,
      planName: plan.name,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    };
  }

  private async callSePayAPI(orderId: string, plan: any) {
    const apiKey = process.env.SEPAY_API_KEY;
    // Full SePay API call
    const res = await fetch(`${SEPAY_API_URL}/transactions/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        amount: plan.amount,
        description: plan.name,
        return_url: `${process.env.APP_URL}/payment/success`,
        cancel_url: `${process.env.APP_URL}/payment/cancel`,
      })
    });
    const data = await res.json() as any;
    return data.payment_url ?? `https://my.sepay.vn/pay?order=${orderId}`;
  }

  async handleWebhook(signature: string, payload: any) {
    // Verify SePay webhook signature
    const secret = process.env.SEPAY_WEBHOOK_SECRET ?? '';
    // TODO: Verify HMAC signature
    // If verified and status=paid, upgrade user subscription
    console.log('SePay webhook received:', payload);
    return { received: true };
  }

  async getOrderStatus(orderId: string) {
    return { orderId, status: 'pending' };
  }
}
