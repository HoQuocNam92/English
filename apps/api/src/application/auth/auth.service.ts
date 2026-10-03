import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { EmailService } from '../../infrastructure/email/email.service'
import { LoginDto, RegisterDto, AuthChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, ValidatePasswordResetDto } from '../../presentation/http-dto/auth.dto'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
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
    if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản với email này')
    if (user.deletedAt || user.status === 'inactive') throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa hoặc chưa được kích hoạt')
    if (user.status === 'suspended') throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Mật khẩu không chính xác')

    const full = await this.getUserWithPermissions(user.id)
    return this.generateTokensForUser(full)
  }

  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email đã được sử dụng')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const learnerRole = await this.prisma.role.findUnique({ where: { code: 'learner' } })
    const defaultLevel = await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
    if (!learnerRole || !defaultLevel) throw new BadRequestException('Hệ thống chưa cấu hình vai trò hoặc cấp độ mặc định cho học viên')

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        status: 'active',
        userDetail: {
          create: { displayName: dto.displayName },
        },
        userRoles: { create: { roleId: learnerRole.id } },
        learnerProfile: { create: { levelId: defaultLevel.id, onboardingCompleted: false } },
      },
    })

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
      const defaultLevel = await this.prisma.level.findFirst({ orderBy: { order: 'asc' } })
      if (!learnerRole || !defaultLevel) throw new BadRequestException('Hệ thống chưa cấu hình vai trò hoặc cấp độ mặc định cho học viên')
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
          userRoles: { create: { roleId: learnerRole.id } },
          learnerProfile: { create: { levelId: defaultLevel.id, onboardingCompleted: false } },
        },
      })
    } else {
      if (user.status !== 'active' || user.deletedAt) throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa')
      const full = profile.avatarUrl ? await this.getUserWithPermissions(user.id) : null
      if (profile.avatarUrl && !full?.userDetail?.avatarUrl) {
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
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let response: globalThis.Response
    try {
      response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, { signal: controller.signal })
    } catch {
      throw new ServiceUnavailableException('Không thể kết nối Google để xác thực. Vui lòng thử lại.')
    } finally {
      clearTimeout(timeout)
    }
    if (!response.ok) throw new UnauthorizedException('Thông tin đăng nhập Google không hợp lệ hoặc đã hết hạn')
    const payload = await response.json() as any

    const allowedAudiences = [this.config.get<string>('GOOGLE_CLIENT_ID'), this.config.get<string>('GOOGLE_ANDROID_CLIENT_ID'), this.config.get<string>('GOOGLE_IOS_CLIENT_ID'), this.config.get<string>('GOOGLE_WEB_CLIENT_ID')].filter(Boolean)
    if (!allowedAudiences.length || !allowedAudiences.includes(payload.aud)) throw new UnauthorizedException('Google token không dành cho ứng dụng này')
    if (String(payload.email_verified) !== 'true') throw new UnauthorizedException('Email Google chưa được xác minh')
    const email = payload.email
    const displayName = payload.name ?? email
    const avatarUrl = payload.picture
    const googleId = payload.sub
    
    if (!email || !googleId) throw new UnauthorizedException('Google token thiếu thông tin tài khoản')
    
    return this.findOrCreateGoogleUser({ googleId, email, displayName, avatarUrl })
  }

  async refresh(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
    }

    const full = await this.getUserWithPermissions(stored.userId)
    if (!full || full.status !== 'active' || full.deletedAt) throw new UnauthorizedException('Tài khoản không còn hoạt động hoặc phiên đăng nhập không hợp lệ')

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
    if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản hoặc phiên đăng nhập không hợp lệ')
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

  async changePassword(userId: string, dto: AuthChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản hoặc phiên đăng nhập không hợp lệ')

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Mật khẩu hiện tại không chính xác')

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }

  private async getPasswordResetUser(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new BadRequestException('Email chưa được đăng ký trên hệ thống')
    if (user.deletedAt || user.status !== 'active') {
      throw new BadRequestException('Tài khoản không hoạt động. Vui lòng liên hệ quản trị viên')
    }
    // Google-created accounts have no local password hash.
    if (!user.passwordHash) {
      throw new BadRequestException('Tài khoản này sử dụng Google. Vui lòng đăng nhập bằng Google')
    }
    return user
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase()
    const user = await this.getPasswordResetUser(email)
    const tokenValue = crypto.randomBytes(32).toString('hex')
    const otpHash = crypto.createHash('sha256').update(tokenValue).digest('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    const webUrl = new URL(this.config.getOrThrow<string>('WEB_URL'))
    if (!['http:', 'https:'].includes(webUrl.protocol)) throw new ServiceUnavailableException('Địa chỉ trang đặt lại mật khẩu chưa được cấu hình')
    const resetUrl = new URL('/reset-password', webUrl)
    resetUrl.searchParams.set('token', tokenValue)
    const token = await this.prisma.passwordResetToken.create({
      data: { userId: user.id, email: user.email, otpHash, expiresAt }
    })

    try {
      const sent = await this.emailService.sendPasswordResetLink(user.email, resetUrl.toString())
      if (!sent) throw new Error('Email delivery failed')
    } catch {
      await this.prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
      throw new ServiceUnavailableException('Không thể gửi liên kết. Vui lòng thử lại sau')
    }
    return { resetLinkSent: true, message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.' }
  }

  private async getResetLinkUser(tokenValue: string) {
    if (!/^[a-f0-9]{64}$/.test(tokenValue)) throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ')
    const otpHash = crypto.createHash('sha256').update(tokenValue).digest('hex')
    const token = await this.prisma.passwordResetToken.findFirst({
      where: { otpHash, userId: { not: null }, usedAt: null, expiresAt: { gt: new Date() } }
    })
    if (!token) throw new BadRequestException('Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng')
    const user = await this.getPasswordResetUser(token.email)
    if (token.userId !== user.id) throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ')
    return { user, otpHash }
  }

  async validatePasswordReset(dto: ValidatePasswordResetDto) {
    await this.getResetLinkUser(dto.token)
    return { valid: true }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { user, otpHash } = await this.getResetLinkUser(dto.token)
    const passwordHash = await bcrypt.hash(dto.newPassword, 12)

    await this.prisma.$transaction(async (tx) => {
      const token = await tx.passwordResetToken.findFirst({
        where: { userId: user.id, email: user.email, otpHash, usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' }
      })
      if (!token) throw new BadRequestException('Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng')
      // Consume the reset link atomically: concurrent requests cannot reuse it.
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: token.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() }
      })
      if (claimed.count !== 1) throw new BadRequestException('Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng')
      const updated = await tx.user.updateMany({
        where: { id: user.id, email: user.email, status: 'active', deletedAt: null, passwordHash: user.passwordHash },
        data: { passwordHash }
      })
      if (updated.count !== 1) throw new BadRequestException('Tài khoản đã thay đổi. Vui lòng yêu cầu liên kết mới')
      await tx.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } })
      await tx.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } })
    })
    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.' }
  }
}
