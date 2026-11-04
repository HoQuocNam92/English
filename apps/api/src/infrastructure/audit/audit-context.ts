import { AsyncLocalStorage } from 'node:async_hooks'
import type { Prisma } from '@prisma/client'

export type AuditScope = { request: any; transaction?: Prisma.TransactionClient }
export const auditContext = new AsyncLocalStorage<AuditScope>()
