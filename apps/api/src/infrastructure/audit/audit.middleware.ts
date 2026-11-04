import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function auditEvent(req: any, statusCode: number) {
  const route = String(req.route?.path ?? '').slice(0, 300)
  if (!route) return null
  const authEvent = route.includes('/auth/') && !route.endsWith('/me') && !route.endsWith('/mfa/status')
  if (!authEvent && (!req.user || (req.method === 'GET' && !route.includes('audit-logs')))) return null
  const params = Object.values(req.params ?? {}).filter((id): id is string => typeof id === 'string' && uuid.test(id))
  // Only UUID identifiers are retained from bodies; credential values and personal text never enter the log.
  const candidates = [...(Array.isArray(req.body?.ids) ? req.body.ids : []), req.body?.userId, req.body?.questionId, req.body?.permissionId]
  const selected = candidates.filter((id: any) => typeof id === 'string' && uuid.test(id)).slice(0, 3000)
  const loginUser = req.user?.user
  return {
    actorId: uuid.test(req.user?.sub ?? loginUser?.id ?? '') ? (req.user?.sub ?? loginUser?.id) : null,
    actorEmail: req.user?.email ?? loginUser?.email ?? null,
    method: req.method, action: ['draft', 'published', 'archived', 'active', 'inactive'].includes(req.body?.status) ? req.body.status : null,
    route, targetIds: [...new Set<string>([...params, ...selected])], statusCode,
    // Use the socket peer; never trust a client-supplied forwarded-for header.
    ipAddress: String(req.socket?.remoteAddress ?? '').slice(0, 64) || null,
  }
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private logger = new Logger(AuditMiddleware.name)
  constructor(private prisma: PrismaService) {}
  use(req: any, res: any, next: () => void) {
    res.once('finish', () => {
      const event = auditEvent(req, res.statusCode)
      if (event) void this.prisma.auditLog.create({ data: event }).catch(() => this.logger.error('Không thể ghi audit log; cần kiểm tra kết nối cơ sở dữ liệu'))
    })
    next()
  }
}
