import { suspensionMessage } from '../../application/auth/suspension-message'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { privileged } from '../../application/auth/admin-mfa.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-in-production'),
    })
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    })
    if (user?.status === 'suspended' && !user.deletedAt) throw new UnauthorizedException(suspensionMessage(user))
    if (!user || user.status !== 'active' || user.deletedAt) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc tài khoản không còn hoạt động')

    const activeRoles = user.userRoles.filter(ur => ur.role.isActive !== false && (!ur.expiresAt || ur.expiresAt > new Date()))
    const roles = activeRoles.map((ur) => ur.role.code)
    const permissions = [
      ...new Set(
        activeRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.code),
        ),
      ),
    ]

    let mfaVerified = false
    if (!payload.sid) throw new UnauthorizedException('Vui lòng đăng nhập lại để cập nhật bảo mật phiên')
    const session = await this.prisma.refreshToken.findUnique({ where: { id: payload.sid } })
    if (!session || session.userId !== user.id || session.revokedAt || session.expiresAt <= new Date()) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn')
    if (privileged(roles)) {
      const at = session.mfaVerifiedAt?.getTime()
      // MFA belongs to this live session; logout, revocation and expiry invalidate it.
      mfaVerified = Boolean(at && payload.mfaAt === at)
    }
    return { sub: user.id, email: user.email, roles, permissions, sid: payload.sid, mfaVerified }
  }
}
