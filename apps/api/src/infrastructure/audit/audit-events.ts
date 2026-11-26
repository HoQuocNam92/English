import { isUUID } from 'class-validator'
import { createHash } from 'node:crypto'

export const safeId = (value: unknown): value is string => typeof value === 'string' && isUUID(value, 'all')
export const routineAuditEvents = ['audit.read', 'auth.session_refresh'];
export function eventDefinition(req: any) {
  const path = String(req.route?.path ?? '').replace(/^\/api\/v1/, '')
  const method = req.method
  const auth: Record<string, string> = { '/auth/login': 'auth.login', '/auth/google/mobile': 'auth.login', '/auth/google/callback': 'auth.login', '/auth/logout': 'auth.logout', '/auth/register': 'user.create', '/auth/change-password': 'auth.password_change', '/users/me/change-password': 'auth.password_change', '/auth/reset-password': 'auth.password_reset', '/auth/mfa/setup': 'mfa.setup', '/auth/mfa/verify': req.body?.recover === true ? 'mfa.reset' : 'mfa.verify', '/auth/mfa/reconfigure': 'mfa.reset', '/auth/refresh': 'auth.session_refresh' }
  if (auth[path]) return { eventKey: auth[path], targetType: auth[path].startsWith('mfa.') ? 'mfa' : 'user', transactional: (!path.includes('/mfa/') || path === '/auth/mfa/setup') && path !== '/auth/google/callback' }
  if (path.startsWith('/audit-logs') && method === 'GET') return { eventKey: 'audit.read', targetType: 'audit', transactional: false }
  if (method === 'GET') return null
  const root = path.split('/')[1]
  const targetType = ({ users: 'user', roles: 'role', lessons: 'lesson', vocabulary: 'vocabulary', questions: 'question', exams: 'exam', certificates: 'certificate', levels: 'level' } as Record<string, string>)[root]
  if (!targetType) return null
  if (root === 'roles' && path.startsWith('/roles/permissions')) return { eventKey: `permission.${method === 'POST' ? 'create' : method === 'DELETE' ? 'delete' : 'update'}`, targetType: 'permission', transactional: true }
  if (root === 'roles' && path.includes('/permissions')) return { eventKey: method === 'DELETE' ? 'permission.revoke' : 'permission.grant', targetType: 'role', transactional: true }
  if (root === 'roles' && path.includes('/users')) return { eventKey: method === 'DELETE' ? 'role.revoke' : 'role.assign', targetType: 'user_role', transactional: true }
  if (path.endsWith('/bulk-status')) return { eventKey: req.body?.status === 'published' ? 'content.bulk_publish' : 'content.bulk_draft', targetType, transactional: true }
  if (path.endsWith('/bulk-activity')) return { eventKey: req.body?.isActive === true ? 'content.bulk_activate' : 'content.bulk_deactivate', targetType, transactional: true }
  if (root === 'users' && /\/(suspend|activate|restore)$/.test(path)) return { eventKey: `user.${path.split('/').pop()}`, targetType, transactional: true }
  // Learning attempts and nested links are not creation/update of their parent resource.
  if (path.split('/').filter(Boolean).length > 2) return null
  const action = method === 'DELETE' ? 'delete' : method === 'POST' ? 'create' : method === 'PATCH' || method === 'PUT' ? 'update' : null
  return action ? { eventKey: `${targetType}.${action}`, targetType, transactional: true } : null
}

// Strict allowlist: credentials, body text, email-like attacker input and provider errors are never copied.
const allowed = new Set(['id', 'code', 'title', 'term', 'type', 'skill', 'status', 'isActive', 'deletedAt', 'publishedAt', 'roleId', 'userId', 'permissionId', 'expiresAt', 'roles', 'permissions', 'enabled', 'count', 'sectionCount', 'contentDigest'])
export function safeValues(value: any, depth = 0): any {
  if (depth > 4 || value == null) return null
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.slice(0, 100).map(item => safeValues(item, depth + 1))
  if (typeof value === 'string') return value.slice(0, 100)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (typeof value !== 'object') return null
  return Object.fromEntries(Object.entries(value).filter(([key]) => allowed.has(key)).map(([key, item]) => [key, safeValues(item, depth + 1)]))
}

export function eventBase(req: any, statusCode: number) {
  const definition = eventDefinition(req)
  const targetIds = [...new Set<string>([...Object.values(req.params ?? {}), ...(Array.isArray(req.body?.ids) ? req.body.ids : []), req.body?.userId, req.body?.permissionId, req.auditTargetId, ...(definition?.targetType === 'user' && definition.eventKey.startsWith('auth.') ? [req.user?.sub] : [])].filter(safeId))].slice(0, 10000)
  return {
    actorId: safeId(req.user?.sub ?? req.user?.user?.id) ? (req.user.sub ?? req.user.user.id) : null,
    actorEmail: safeId(req.user?.sub ?? req.user?.user?.id) ? String(req.user.email ?? req.user?.user?.email ?? '').slice(0, 254) || null : null,
    method: String(req.method).slice(0, 10), route: String(req.route?.path ?? '').slice(0, 300),
    action: ['draft', 'published', 'archived', 'active', 'inactive'].includes(req.body?.status) ? req.body.status : typeof req.body?.isActive === 'boolean' ? (req.body.isActive ? 'active' : 'inactive') : null,
    targetIds, statusCode, eventKey: definition?.eventKey ?? 'request.unconfirmed', targetType: definition?.targetType ?? null,
    requestId: req.auditRequestId ?? null, userAgent: String(req.headers?.['user-agent'] ?? '').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 500) || null,
    // req.ip is only proxy-aware when the operator explicitly configures Express trust proxy.
    ipAddress: String(req.ip ?? req.socket?.remoteAddress ?? '').slice(0, 64) || null,
    severity: definition?.eventKey.startsWith('role.') || definition?.eventKey.startsWith('permission.') || definition?.eventKey === 'mfa.reset' ? 'critical' : 'info',
  }
}

export async function snapshot(db: any, req: any, definition: NonNullable<ReturnType<typeof eventDefinition>>, result?: any) {
  const id = req.auditTargetId ?? req.params?.permissionId ?? req.params?.userId ?? req.body?.userId ?? (req.params?.id === 'me' || req.route?.path?.endsWith('/users/me') ? req.user?.sub : req.params?.id) ?? result?.id ?? (definition.targetType === 'user' && definition.eventKey.startsWith('auth.') ? req.user?.sub : undefined)
  if (definition.targetType === 'user_role' && safeId(id)) {
    const roles = await db.userRole.findMany({ where: { userId: id }, select: { roleId: true, expiresAt: true, role: { select: { code: true } } }, orderBy: { roleId: 'asc' } })
    return { userId: id, roles: roles.map((item: any) => ({ roleId: item.roleId, code: item.role.code, expiresAt: item.expiresAt })) }
  }
  if (definition.eventKey.startsWith('permission.') && safeId(req.params?.id)) {
    const permissions = await db.rolePermission.findMany({ where: { roleId: req.params.id }, select: { permissionId: true }, orderBy: { permissionId: 'asc' } })
    return { roleId: req.params.id, permissions }
  }
  if (!safeId(id)) return undefined
  const model = definition.targetType
  if (model === 'lesson') {
    const row = await db.lesson.findUnique({ where: { id }, select: { id:true,title:true,status:true,publishedAt:true,summary:true,sections:{select:{type:true,order:true,title:true,content:true},orderBy:{order:'asc'}} } })
    if (!row) return null
    return {id:row.id,title:row.title,status:row.status,publishedAt:row.publishedAt,sectionCount:row.sections.length,contentDigest:createHash('sha256').update(JSON.stringify({title:row.title,summary:row.summary,sections:row.sections})).digest('hex')}
  }
  const selects: Record<string, any> = { permission: {id:true,code:true}, user: { id: true, status: true, deletedAt: true }, role: { id: true, code: true, isActive: true }, lesson: { id: true, title:true, status: true, publishedAt: true }, vocabulary: { id: true, term:true, status: true }, question: { id: true, type:true, skill:true, status: true }, exam: { id: true, title:true, status: true, publishedAt: true }, certificate: { id: true, isActive: true }, level: { id: true, isActive: true } }
  return selects[model] ? db[model].findUnique({ where: { id }, select: selects[model] }) : undefined
}

export async function saveEvent(db: any, data: any) {
  const window = Math.floor(Date.now() / 300000)
  let kind: string | null = data.severity === 'critical' && data.outcome === 'success' ? 'sensitive_change' : null
  if (data.eventKey === 'auth.login' && data.outcome === 'failure' && data.ipAddress) {
    const count = await db.auditLog.count({ where: { eventKey: 'auth.login', outcome: 'failure', ipAddress: data.ipAddress, createdAt: { gte: new Date(Date.now() - 300000) } } })
    if (count >= 4) { kind = 'repeated_login_failure'; data.severity = 'warning' }
  }
  if (data.eventKey === 'security.access_denied' && /\/roles/.test(data.route)) kind = 'denied_privilege_change'
  const event = await db.auditLog.create({ data })
  if (kind) await db.auditAlert.upsert({ where: { dedupeKey: `${kind}:${data.actorId ?? data.ipAddress ?? 'unknown'}:${window}` }, update: {}, create: { dedupeKey: `${kind}:${data.actorId ?? data.ipAddress ?? 'unknown'}:${window}`, kind, severity: kind === 'repeated_login_failure' ? 'warning' : 'critical', eventId: event.id } })
  return event
}
