import { Module } from '@nestjs/common';
import { PaymentController } from '../presentation/payment.controller';
import { VoucherController } from '../presentation/voucher.controller';
import { FlashSaleController } from '../presentation/flash-sale.controller';
import { PaymentService } from '../application/payment/payment.service';
import { RedisLockService } from '../infrastructure/cache/redis-lock.service';

@Module({
  controllers: [PaymentController, VoucherController, FlashSaleController],
  providers: [PaymentService, RedisLockService],
  exports: [PaymentService],
})
export class PaymentModule {}
