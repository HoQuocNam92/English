import { ForbiddenException } from '@nestjs/common'

export const SUPER_ADMIN = 'SUPER_ADMIN'

export function hasSuperAdminRole(user: any): boolean {
  return (user?.userRoles ?? []).some((link: any) => link.role?.code === SUPER_ADMIN)
}

export async function requireSuperAdmin(db: any, actorId?: string): Promise<void> {
  if (!actorId) throw new ForbiddenException('Chỉ Super Admin mới được thực hiện thao tác này')
  const actor = await db.user.findUnique({ where: { id: actorId }, include: { userRoles: { include: { role: true } } } })
  const now = new Date()
  if (!actor || actor.status !== 'active' || actor.deletedAt || !(actor.userRoles ?? []).some((link: any) =>
    link.role?.code === SUPER_ADMIN && link.role.isActive !== false && (!link.expiresAt || link.expiresAt > now),
  )) throw new ForbiddenException('Chỉ Super Admin mới được thực hiện thao tác này')
}

export async function protectSuperAdmin(db: any, target: any, actorId?: string): Promise<void> {
  // A protected membership remains protected even if it is expired or disabled.
  if (hasSuperAdminRole(target) || target?.roles?.includes(SUPER_ADMIN)) await requireSuperAdmin(db, actorId)
}
