import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { auditContext } from '../audit/audit-context'
import { FileState, FileTask, FILE_MODELS } from './file-state'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  get adminMfa(): any { throw new Error("File delegate is not initialized") }
  get auditLog(): any { throw new Error("File delegate is not initialized") }
  get auditAlert(): any { throw new Error("File delegate is not initialized") }
  get studyTimeSession(): any { throw new Error("File delegate is not initialized") }
  declare $transaction: any
  constructor() {
    super()
    const original = super.$transaction.bind(this)
    const files = new FileState(original)
    const models = Object.fromEntries(FILE_MODELS.map(name => [name, files.model(name)]))
    const wrap = (target: any): any => new Proxy(target, {
      get: (target, property, receiver) => {
        if (typeof property === 'string' && property in models) return models[property]
        if (property === '$transaction') return (run: any, options?: any) => {
          const active = files.current?.tx ?? auditContext.getStore()?.transaction
          if (active) return typeof run === 'function' ? run(wrap(active)) : Promise.all(run)
          if (Array.isArray(run) && !run.some(item => item instanceof FileTask)) return original(run, options)
          return files.run(tx => typeof run === 'function' ? run(wrap(tx)) : Promise.all(run), options)
        }
        const tx = files.current?.tx ?? auditContext.getStore()?.transaction
        if (tx && typeof property === 'string' && /^[a-z]/.test(property) && property in tx && typeof tx[property] === 'object') return tx[property]
        return Reflect.get(target, property, receiver)
      },
    })
    // Only requests explicitly wrapped by the audit interceptor participate.
    // Existing services keep their Prisma API; nested transactions join the outer unit of work.
    return wrap(this)
  }
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
