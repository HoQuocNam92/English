import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../database/prisma.service'
import { auditContext } from './audit-context'
import { eventBase, eventDefinition, saveEvent } from './audit-events'
import { safeId } from './audit-events'

export function auditEvent(req: any, statusCode: number) {
  if (!req.route?.path) return null
  if (String(req.route.path).endsWith('/auth/google/callback')) {
    const success = !req.user?.authError && typeof req.user?.accessToken === 'string' && safeId(req.user?.user?.id) && statusCode < 400
    return { ...eventBase(req, statusCode), outcome: success ? 'success' : 'failure', ...(success ? {} : {failureReason:'AUTHENTICATION_FAILED'}) }
  }
  if (statusCode < 400) return null // completed business events are written by the interceptor
  const definition = eventDefinition(req)
  if (!definition && statusCode !== 403) return null
  const base = eventBase(req, statusCode)
  return { ...base, ...(statusCode === 403 ? { eventKey: 'security.access_denied' } : {}), outcome: 'failure', ...(Array.isArray(req.body?.ids) ? {requestedCount:req.body.ids.length,updatedCount:0,skippedCount:0} : {}), failureReason: statusCode === 403 ? 'ACCESS_DENIED' : statusCode === 401 ? 'AUTHENTICATION_FAILED' : statusCode === 400 ? 'VALIDATION_OR_BUSINESS_REJECTION' : statusCode === 409 ? 'CONCURRENT_OR_CONFLICT' : 'REQUEST_FAILED', severity: base.severity === 'critical' ? 'critical' : 'info' }
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private logger = new Logger(AuditMiddleware.name)
  constructor(private prisma: PrismaService) {}
  use(req: any, res: any, next: () => void) {
    req.auditRequestId = randomUUID()
    res.setHeader('X-Request-ID', req.auditRequestId)
    res.once('finish', () => {
      if (req.auditCommitted) return
      const event = auditEvent(req, res.statusCode)
      if (event) void this.persist(event, req.auditRequestId)
    })
    auditContext.run({ request: req }, next)
  }
  private async persist(event: any, requestId: string) {
    // Failure telemetry has no business mutation to roll back; expose storage faults to operators.
    try {
      await this.prisma.$transaction(async tx => {
        if (event.eventKey === 'auth.login' && event.outcome === 'failure' && event.ipAddress) {
          await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${event.ipAddress}, 0))::text AS locked`
        }
        await saveEvent(tx, event)
      }, { timeout: 10000 })
    }
    catch { this.logger.error('AUDIT_WRITE_FAILED requestId=' + requestId) }
  }
}
