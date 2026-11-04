import { CallHandler, ConflictException, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { from, lastValueFrom, Observable } from 'rxjs'
import { PrismaService } from '../database/prisma.service'
import { auditContext } from './audit-context'
import { eventBase, eventDefinition, safeId, safeValues, saveEvent, snapshot } from './audit-events'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const definition = eventDefinition(request)
    if (!definition) return next.handle()
    // OAuth's session is created by its guard and the controller owns a redirect response.
    // Record its verified guard result in the finish observer, without failing an already-sent redirect.
    if (String(request.route?.path).endsWith('/auth/google/callback')) return next.handle()
    return from(this.execute(request, response, definition, () => lastValueFrom(next.handle())))
  }
  async execute(request: any, response: any, definition: NonNullable<ReturnType<typeof eventDefinition>>, invoke: () => Promise<any>) {
    const run = async (db: any) => {
      const before = await snapshot(db, request, definition)
      const result = await invoke()
      if (request.auditCommitted) return result
      if (request.user?.authError) {
        await saveEvent(db, { ...eventBase(request, response.statusCode), outcome: 'failure', failureReason: 'AUTHENTICATION_FAILED' })
        request.auditPendingCommit = true
        return result
      }
      const after = await snapshot(db, request, definition, result)
      const base = eventBase(request, response.statusCode)
      const unchangedPermissions = (definition.eventKey.startsWith('role.') || definition.eventKey.startsWith('permission.')) && before != null && after != null && JSON.stringify(before) === JSON.stringify(after)
      const outcome = unchangedPermissions || (typeof result?.updatedCount === 'number' && result.updatedCount === 0) ? 'noop' : 'success'
      // Google callback guard can return an error redirect without authenticating a user.
      const targetIds = [...new Set([...base.targetIds, ...(safeId(result?.id) ? [result.id] : [])])]
      const data: any = { ...base, targetIds, outcome,
        ...(before != null ? { oldValues: safeValues(before) } : {}),
        ...(after != null ? { newValues: safeValues(after) } : {}),
        ...(typeof result?.updatedCount === 'number' ? { requestedCount: result.requestedCount ?? request.body?.ids?.length ?? null, updatedCount: result.updatedCount, skippedCount: result.skippedCount ?? null } : {}),
      }
      if (before?.status !== after?.status && after?.status === 'published') data.eventKey = 'content.publish'
      if (before?.status !== after?.status && before?.status === 'published' && after?.status === 'draft') data.eventKey = 'content.draft'
      if (definition.eventKey.startsWith('content.bulk_') && typeof result?.updatedCount === 'number' && result.updatedCount > 0) {
        data.oldValues = { status: request.body?.status === 'published' ? 'draft' : request.body?.status === 'draft' ? 'published' : request.body?.isActive === true ? 'inactive' : 'active', count: result.updatedCount }
        data.newValues = { status: request.body?.status ?? (request.body?.isActive ? 'active' : 'inactive'), count: result.updatedCount }
      }
      // Non-mutating security reads are recorded, but never ordinary catalog reads.
      await saveEvent(db, data)
      if (['auth.password_change', 'auth.password_reset', 'user.suspend', 'user.delete'].includes(definition.eventKey)) {
        const count = request.auditRevokedCount
        await saveEvent(db, { ...base, targetIds, outcome: count === 0 ? 'noop' : 'success', eventKey: 'auth.session_revoke', severity: 'warning', ...(typeof count === 'number' ? {requestedCount:count,updatedCount:count,skippedCount:0} : {}) })
      }
      request.auditPendingCommit = true
      return result
    }
    if (!definition.transactional) {
      const result = await run(this.prisma)
      request.auditCommitted = true
      return result
    }
    try {
      const result = await this.prisma.$transaction(tx => auditContext.run({ request, transaction: tx }, () => run(tx)), { isolationLevel: 'Serializable', timeout: 30000, maxWait: 5000 })
      request.auditCommitted = true
      return result
    } catch (error) {
      if ((error as any)?.code === 'P2034') throw new ConflictException('Dữ liệu vừa thay đổi bởi yêu cầu khác. Hãy tải lại và thử lại thao tác.')
      throw error
    }
  }
}
