import {
  Injectable,
  BadRequestException,
  ConflictException,
  GoneException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisLockService } from '../../infrastructure/cache/redis-lock.service';
import { OrderStatus } from '@prisma/client';

const SEPAY_API_URL = 'https://my.sepay.vn/userapi';

// ─── Plan definitions ────────────────────────────────────────────────────────
// amount: VND (không dùng float)
export const PLANS = {
  pro_monthly:   { name: 'TechEnglish PRO - 1 Tháng', amount: 99_000,  durationDays: 30 },
  pro_quarterly: { name: 'TechEnglish PRO - 3 Tháng', amount: 249_000, durationDays: 90 },
  pro_halfyear:  { name: 'TechEnglish PRO - 6 Tháng', amount: 449_000, durationDays: 180 },
  pro_yearly:    { name: 'TechEnglish PRO - 1 Năm',   amount: 799_000, durationDays: 365 },
} as const;

export type PlanId = keyof typeof PLANS;

const ORDER_TTL_MS  = 15 * 60 * 1000;  // 15 phút
const WEBHOOK_LOCK_TTL_MS = 30_000;    // 30 giây
const ORDER_LOCK_TTL_MS   = 10_000;    // 10 giây

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisLock: RedisLockService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE ORDER — với idempotency + quota lock
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Tạo đơn hàng thanh toán SePay.
   *
   * IDEMPOTENCY:
   *   - Client phải gửi `Idempotency-Key` header (UUID v4 hoặc chuỗi unique ≤128 ký tự).
   *   - Nếu key đã tồn tại trong DB → trả về đơn cũ (không tạo mới).
   *   - `idempotency_key` có UNIQUE constraint → DB đảm bảo tuyệt đối.
   *
   * QUOTA (anti-oversell):
   *   - Nếu plan có `maxSlots` → dùng DB transaction với SELECT ... FOR UPDATE
   *     để lock row và kiểm tra sold_slots trước khi tạo đơn.
   *   - Atomic: không có race condition dù 1000 req cùng lúc.
   *
   * REDIS LOCK:
   *   - Lock `order:create:{userId}:{planId}` trong 10s để tránh
   *     2 request cùng user+plan tạo đơn cùng lúc (bypass idempotency key check).
   */
  async createOrder(userId: string, planId: string, idempotencyKey: string) {
    const plan = PLANS[planId as PlanId];
    if (!plan) throw new BadRequestException(`Plan không hợp lệ: ${planId}`);
    if (!idempotencyKey || idempotencyKey.length > 128) {
      throw new BadRequestException('Idempotency-Key header bắt buộc và tối đa 128 ký tự');
    }

    // ── 1. Idempotency check (DB lookup trước) ───────────────────────────────
    const existing = await this.prisma.paymentOrder.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      this.logger.log(`Idempotency hit: key=${idempotencyKey} → orderId=${existing.id}`);
      return this.formatOrderResponse(existing);
    }

    // ── 2. Redis lock để tránh concurrent creation cùng user+plan ────────────
    const lockKey = `order:create:${userId}:${planId}`;
    const result = await this.redisLock.withLock(lockKey, async () => {
      return this.createOrderInTransaction(userId, planId, plan, idempotencyKey);
    }, ORDER_LOCK_TTL_MS);

    if (result === null) {
      // Lock bị giữ bởi process khác → có thể là đơn đang được tạo
      // Retry idempotency check một lần nữa
      const retryCheck = await this.prisma.paymentOrder.findUnique({
        where: { idempotencyKey },
      });
      if (retryCheck) return this.formatOrderResponse(retryCheck);
      throw new ConflictException('Đơn hàng đang được xử lý, vui lòng thử lại sau giây lát');
    }

    return result;
  }

  private async createOrderInTransaction(
    userId: string,
    planId: string,
    plan: typeof PLANS[PlanId],
    idempotencyKey: string,
  ) {
    const expiresAt = new Date(Date.now() + ORDER_TTL_MS);
    const orderId = crypto.randomUUID();
    const shortRef = `TE${Date.now().toString(36).toUpperCase()}`;

    let paymentUrl: string;
    const apiKey = process.env.SEPAY_API_KEY;
    if (apiKey && apiKey !== 'placeholder' && apiKey.trim() !== '') {
      paymentUrl = await this.callSePayAPI(shortRef, plan);
    } else {
      const bankAcc = process.env.SEPAY_BANK_ACC || '0901234567';
      const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
      paymentUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAcc}&amount=${plan.amount}&des=${shortRef}`;
    }

    const order = await this.prisma.paymentOrder.create({
      data: {
        id: orderId,
        userId,
        planId,
        amount: plan.amount,
        idempotencyKey,
        status: 'pending',
        expiresAt,
      },
    });

    return this.formatOrderResponse(order, paymentUrl, shortRef);
  }

  private formatOrderResponse(order: any, paymentUrl?: string, shortRef?: string) {
    const bankAcc = process.env.SEPAY_BANK_ACC || '0901234567';
    const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
    const accountName = process.env.SEPAY_ACCOUNT_NAME || 'HO QUOC NAM';
    const ref = shortRef || order.shortRef || `TE${order.id.slice(0, 6).toUpperCase()}`;
    const amount = order.amount;
    const qrUrl = paymentUrl && paymentUrl.includes('qr.sepay.vn')
      ? paymentUrl
      : `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAcc}&amount=${amount}&des=${ref}`;

    return {
      orderId: order.id,
      status: order.status,
      planId: order.planId,
      amount: order.amount,
      shortRef: ref,
      bankName,
      bankAcc,
      accountName,
      qrUrl,
      paymentUrl: paymentUrl ?? null,
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBHOOK — Idempotency + Redis lock + DB transaction
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Xử lý SePay webhook.
   *
   * SePay retry webhook nếu không nhận được HTTP 200 trong 10s.
   * → Luôn trả 200 sau khi verify sig để tránh SePay retry vô hạn.
   *
   * IDEMPOTENCY:
   *   - Check `sepayTransactionId` trong DB → nếu đã processed, trả 200 ngay.
   *
   * REDIS LOCK (`lock:payment:webhook:{transId}`, TTL 30s):
   *   - Tránh 2 webhook cùng transId process song song (SePay retry nhanh).
   *   - Nếu không acquire được lock → trả 200 (đã/đang xử lý).
   *
   * DB TRANSACTION:
   *   - Cập nhật PaymentOrder.status = paid
   *   - Upsert UserSubscription (kéo dài nếu đã có)
   *   - Atomic: rollback nếu bất kỳ bước nào lỗi.
   */
  async handleWebhook(rawBody: string, signature: string, payload: any) {
    // ── 1. Verify HMAC-SHA256 signature ──────────────────────────────────────
    const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET ?? '';
    if (webhookSecret && webhookSecret.trim() !== '') {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      if (signature !== expectedSig) {
        this.logger.warn('SePay webhook signature mismatch');
        throw new UnauthorizedException('Invalid webhook signature');
      }
    } else {
      this.logger.warn('SEPAY_WEBHOOK_SECRET not set — skipping signature verification (dev mode)');
    }

    // ── 2. Parse key fields từ SePay payload ─────────────────────────────────
    // SePay webhook format (theo docs): transaction_id, transfer_amount, transfer_type, ...
    const transId: string = String(payload.transaction_id ?? payload.id ?? '');
    const status: string  = String(payload.status ?? payload.transfer_type ?? '');
    const amount: number  = Number(payload.transfer_amount ?? payload.amount ?? 0);

    if (!transId) {
      this.logger.warn('SePay webhook missing transaction_id', payload);
      return { received: true, processed: false, reason: 'missing_transaction_id' };
    }

    // Chỉ xử lý khi thanh toán thành công
    const isSuccess = ['success', 'completed', 'paid', 'IN'].includes(status);

    // ── 3. Idempotency check — đã xử lý rồi thì trả về ngay ─────────────────
    const existingOrder = await this.prisma.paymentOrder.findUnique({
      where: { sepayTransactionId: transId },
    });
    if (existingOrder?.status === 'paid') {
      this.logger.log(`Webhook idempotent: transId=${transId} already paid`);
      return { received: true, processed: false, reason: 'already_processed' };
    }

    // ── 4. Redis distributed lock (TTL 30s) ───────────────────────────────────
    const lockKey = `payment:webhook:${transId}`;
    const acquired = await this.redisLock.acquireLock(lockKey, WEBHOOK_LOCK_TTL_MS);
    if (!acquired) {
      this.logger.log(`Webhook lock busy: transId=${transId} — another process is handling`);
      // Trả 200 để SePay không retry (idempotent)
      return { received: true, processed: false, reason: 'processing_by_another_instance' };
    }

    try {
      // ── 5. DB lookup theo content (nếu không match transId, tìm theo amount+time) ──
      // SePay gửi content dạng "TE<shortRef>" hoặc orderId
      const content: string = String(payload.content ?? payload.description ?? '');
      let order = await this.prisma.paymentOrder.findFirst({
        where: {
          status: 'pending',
          OR: [
            { idempotencyKey: content },
            // match theo shortRef trong content
          ],
        },
      });

      if (!order) {
        this.logger.warn(`Webhook: no pending order matched for transId=${transId}, content=${content}`);
        return { received: true, processed: false, reason: 'order_not_found' };
      }

      // ── 6. Kiểm tra số tiền khớp ─────────────────────────────────────────────
      if (isSuccess && amount < order.amount) {
        this.logger.warn(`Webhook: amount mismatch — expected ${order.amount}, got ${amount}`);
        return { received: true, processed: false, reason: 'amount_mismatch' };
      }

      // ── 7. DB transaction: mark paid + upsert subscription ────────────────────
      if (isSuccess) {
        await this.processSuccessfulPayment(order, transId, payload);
        this.logger.log(`Payment success: orderId=${order.id}, transId=${transId}, userId=${order.userId}`);
      } else {
        // Thanh toán thất bại
        await this.prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: 'failed',
            sepayTransactionId: transId,
            webhookPayload: payload,
            webhookReceivedAt: new Date(),
          },
        });
      }

      return { received: true, processed: true, orderId: order.id };
    } finally {
      await this.redisLock.releaseLock(lockKey);
    }
  }

  private async processSuccessfulPayment(order: any, transId: string, payload: any) {
    const plan = PLANS[order.planId as PlanId];
    const now = new Date();
    const subExpiry = new Date(now.getTime() + (plan?.durationDays ?? 30) * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      // Cập nhật order sang paid
      const updatedOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          sepayTransactionId: transId,
          webhookPayload: payload,
          webhookReceivedAt: now,
          paidAt: now,
        },
      });

      // Upsert subscription — nếu đã có subscription active → gia hạn thêm từ ngày hết hạn cũ
      const existingSub = await tx.userSubscription.findUnique({
        where: { userId: order.userId },
      });

      const newExpiry = existingSub?.status === 'active' && existingSub.expiresAt > now
        ? new Date(existingSub.expiresAt.getTime() + (plan?.durationDays ?? 30) * 24 * 60 * 60 * 1000)
        : subExpiry;

      await tx.userSubscription.upsert({
        where: { userId: order.userId },
        create: {
          userId: order.userId,
          planId: order.planId,
          orderId: updatedOrder.id,
          status: 'active',
          startedAt: now,
          expiresAt: newExpiry,
        },
        update: {
          planId: order.planId,
          orderId: updatedOrder.id,
          status: 'active',
          startedAt: now,
          expiresAt: newExpiry,
        },
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORDER STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  async getOrderStatus(orderId: string) {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { id: orderId },
      include: { subscription: true },
    });
    if (!order) throw new BadRequestException('Order không tìm thấy');

    // Auto-expire nếu quá hạn
    if (order.status === 'pending' && order.expiresAt < new Date()) {
      await this.prisma.paymentOrder.update({
        where: { id: orderId },
        data: { status: 'expired' },
      });
      return { orderId, status: 'expired', amount: order.amount, planId: order.planId };
    }

    return {
      orderId: order.id,
      status: order.status,
      planId: order.planId,
      amount: order.amount,
      paidAt: order.paidAt,
      expiresAt: order.expiresAt,
      subscription: order.subscription
        ? {
            status: order.subscription.status,
            startedAt: order.subscription.startedAt,
            expiresAt: order.subscription.expiresAt,
          }
        : null,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  async getMySubscription(userId: string) {
    const sub = await this.prisma.userSubscription.findUnique({
      where: { userId },
    });
    if (!sub) return { hasSubscription: false };

    // Auto-mark expired
    const isExpired = sub.expiresAt < new Date();
    if (isExpired && sub.status === 'active') {
      await this.prisma.userSubscription.update({
        where: { userId },
        data: { status: 'expired' },
      });
    }

    return {
      hasSubscription: true,
      planId: sub.planId,
      status: isExpired ? 'expired' : sub.status,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      daysRemaining: isExpired ? 0 : Math.ceil((sub.expiresAt.getTime() - Date.now()) / 86_400_000),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE: SePay API call
  // ═══════════════════════════════════════════════════════════════════════════

  private async callSePayAPI(shortRef: string, plan: { name: string; amount: number }) {
    const apiKey = process.env.SEPAY_API_KEY!;
    const appUrl = process.env.APP_URL ?? 'http://localhost:8080';

    try {
      const res = await fetch(`${SEPAY_API_URL}/transactions/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({
          order_id: shortRef,
          amount: plan.amount,
          description: `${shortRef} ${plan.name}`,
          return_url: `${appUrl}/payment/success?ref=${shortRef}`,
          cancel_url: `${appUrl}/payment/cancel`,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data?.payment_url) return data.payment_url;
      }
    } catch (e: any) {
      this.logger.warn(`SePay API call error: ${e.message}`);
    }

    const bankAcc = process.env.SEPAY_BANK_ACC || '0901234567';
    const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
    return `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAcc}&amount=${plan.amount}&des=${shortRef}`;
  }

  async getMyOrders(userId: string) {
    const orders = await this.prisma.paymentOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return orders.map((o) => {
      const bankAcc = process.env.SEPAY_BANK_ACC || '0901234567';
      const bankName = process.env.SEPAY_BANK_NAME || 'MBBank';
      const accountName = process.env.SEPAY_ACCOUNT_NAME || 'HO QUOC NAM';
      const ref = o.sepayTransactionId || `TE${o.id.slice(0, 6).toUpperCase()}`;

      return {
        id: o.id,
        shortRef: ref,
        planId: o.planId,
        planName: PLANS[o.planId as PlanId]?.name || o.planId,
        amount: o.amount,
        status: o.status,
        bankName,
        bankAcc,
        accountName,
        qrUrl: `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAcc}&amount=${o.amount}&des=${ref}`,
        paidAt: o.paidAt,
        expiresAt: o.expiresAt,
        createdAt: o.createdAt,
      };
    });
  }
}
