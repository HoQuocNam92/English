import { Module } from '@nestjs/common';
import { PaymentController } from '../presentation/payment.controller';
import { PaymentService } from '../application/payment/payment.service';
import { RedisLockService } from '../infrastructure/cache/redis-lock.service';

@Module({
  controllers: [PaymentController],
  // RedisLockService is globally available via RedisCacheModule but listed here for explicitness
  providers: [PaymentService, RedisLockService],
  exports: [PaymentService],
})
export class PaymentModule {}
