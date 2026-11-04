import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { auditContext } from '../audit/audit-context'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super()
    // Only requests explicitly wrapped by the audit interceptor participate.
    // Existing services keep their Prisma API; nested transactions join the outer unit of work.
    return new Proxy(this, {
      get: (target, property, receiver) => {
        const tx = auditContext.getStore()?.transaction
        if (tx && property === '$transaction') return (run: any) => typeof run === 'function' ? run(tx) : Promise.all(run)
        if (tx && typeof property === 'string' && /^[a-z]/.test(property) && property in tx && typeof (tx as any)[property] === 'object') return (tx as any)[property]
        return Reflect.get(target, property, receiver)
      },
    })
  }
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
