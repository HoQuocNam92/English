import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisLockService } from './redis-lock.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { redisStore } = require('cache-manager-ioredis-yet');
          return {
            store: redisStore,
            url: redisUrl,
            ttl: 300_000, // ms
          } as any;
        }
        // In-memory fallback for development (no Redis)
        return {
          ttl: 300_000,
          max: 1000,
        } as any;
      },
      isGlobal: true,
    }),
  ],
  providers: [RedisLockService],
  exports: [CacheModule, RedisLockService],
})
export class RedisCacheModule {}
