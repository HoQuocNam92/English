import { Module } from '@nestjs/common';
import { PaymentController } from '../presentation/payment.controller';
import { PaymentService } from '../application/payment/payment.service';
import { RedisLockService } from '../infrastructure/cache/redis-lock.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, RedisLockService],
  exports: [PaymentService],
})
export class PaymentModule {}
