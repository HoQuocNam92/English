import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { LoginDto, ChangePasswordDto } from '../../presentation/http-dto/auth.dto'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private async getUserWithPermissions(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userDetail: true,
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } }
            }
          }
        }
      }
    })
  }

  private buildPayload(user: any) {
    const roles = user.userRoles.map((ur: any) => ur.role.code)
    const permissions = [...new Set<string>(
      user.userRoles.flatMap((ur: any) => ur.role.rolePermissions.map((rp: any) => rp.permission.code))
    )]
    return { sub: user.id, email: user.email, roles, permissions }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || user.status !== 'active') throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const full = await this.getUserWithPermissions(user.id)
    return this.generateTokensForUser(full)
  }

  private async generateTokensForUser(full: any) {
    const payload = this.buildPayload(full)

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' })
    const refreshToken = crypto.randomBytes(40).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    await this.prisma.refreshToken.create({
      data: {
        userId: full.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    // Update last login
    await this.prisma.userDetail.update({
      where: { userId: full.id },
      data: { lastLoginAt: new Date() }
    }).catch(() => {})

    return {
      accessToken,
      refreshToken,
      user: {
        id: full.id,
        email: full.email,
        displayName: full?.userDetail?.displayName,
        avatarUrl: full?.userDetail?.avatarUrl,
        roles: payload.roles,
        permissions: payload.permissions,
      }
    }
  }

  async findOrCreateGoogleUser(profile: { googleId: string; email: string; displayName: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    })

    if (!user) {
      const learnerRole = await this.prisma.role.findUnique({ where: { code: 'learner' } })
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          passwordHash: '',
          status: 'active',
          userDetail: {
            create: {
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
            },
          },
          userRoles: learnerRole ? { create: { roleId: learnerRole.id } } : undefined,
        },
      })
    } else if (profile.avatarUrl) {
      const full = await this.getUserWithPermissions(user.id)
      if (!full?.userDetail?.avatarUrl) {
        await this.prisma.userDetail.update({
          where: { userId: user.id },
          data: { avatarUrl: profile.avatarUrl },
        })
      }
    }

    const fullUser = await this.getUserWithPermissions(user.id)
    return this.generateTokensForUser(fullUser)
  }

  async verifyGoogleIdToken(idToken: string) {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    if (!response.ok) throw new UnauthorizedException('Invalid Google token')
    const payload = await response.json() as any
    
    const email = payload.email
    const displayName = payload.name ?? email
    const avatarUrl = payload.picture
    const googleId = payload.sub
    
    if (!email) throw new UnauthorizedException('No email in Google token')
    
    return this.findOrCreateGoogleUser({ googleId, email, displayName, avatarUrl })
  }

  async refresh(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    const full = await this.getUserWithPermissions(stored.userId)
    if (!full || full.status !== 'active') throw new UnauthorizedException()

    const payload = this.buildPayload(full)
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' })

    return { accessToken }
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }

  async me(userId: string) {
    const user = await this.getUserWithPermissions(userId)
    if (!user) throw new UnauthorizedException()
    const payload = this.buildPayload(user)
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      displayName: user.userDetail?.displayName,
      avatarUrl: user.userDetail?.avatarUrl,
      bio: user.userDetail?.bio,
      timezone: user.userDetail?.timezone,
      locale: user.userDetail?.locale,
      lastLoginAt: user.userDetail?.lastLoginAt,
      roles: payload.roles,
      permissions: payload.permissions,
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException()

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Current password is incorrect')

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }
}
