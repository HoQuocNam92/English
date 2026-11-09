import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from 'node:crypto'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { base32, matchingStep } from './totp'
import { JwtPayload } from '../../presentation/decorators/current-user.decorator'
import { auditContext } from '../../infrastructure/audit/audit-context'
import { eventBase, saveEvent } from '../../infrastructure/audit/audit-events'

export const privileged = (roles: string[]) => roles.some(role => role === 'admin' || role === 'teacher')

@Injectable()
export class AdminMfaService {
  constructor(private prisma: PrismaService, private config: ConfigService, private jwt: JwtService) {}

  private key() {
    const key = this.config.get<string>('MFA_ENCRYPTION_KEY') || this.config.get<string>('JWT_SECRET')
    if (!key || key === 'change-me' || key === 'change-me-in-production') throw new BadRequestException('Máy chủ chưa cấu hình khóa bảo vệ MFA')
    return Buffer.from(hkdfSync('sha256', key, 'techenglish', 'admin-mfa-encryption-v1', 32))
  }
  private encrypt(secret: Buffer) {
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', this.key(), iv)
    return Buffer.concat([iv, cipher.update(secret), cipher.final(), cipher.getAuthTag()]).toString('base64')
  }
  private decrypt(value: string) {
    const data = Buffer.from(value, 'base64'), decipher = createDecipheriv('aes-256-gcm', this.key(), data.subarray(0, 12))
    decipher.setAuthTag(data.subarray(-16))
    return Buffer.concat([decipher.update(data.subarray(12, -16)), decipher.final()])
  }
  private hash(code: string) { return createHash('sha256').update(code).digest('hex') }

  async status(user: JwtPayload) {
    const state = await this.prisma.adminMfa.findUnique({ where: { userId: user.sub } })
    return { required: privileged(user.roles), enabled: Boolean(state?.enabledAt), verified: Boolean(user.mfaVerified) }
  }

  async setup(user: JwtPayload) {
    if (!privileged(user.roles) || !user.sid) throw new ForbiddenException('Đăng nhập lại bằng tài khoản quản trị hoặc giảng viên để thiết lập MFA')
    const secret = randomBytes(20), expires = new Date(Date.now() + 10 * 60 * 1000)
    // Never replace an enrolled secret or reset failed-attempt counters on setup requests.
    await this.prisma.adminMfa.upsert({ where: { userId: user.sub }, update: {}, create: {
      userId: user.sub, secretEncrypted: this.encrypt(secret), pendingExpiresAt: expires,
    } })
    const state = await this.prisma.adminMfa.findUnique({ where: { userId: user.sub } })
    if (state.enabledAt) throw new BadRequestException('MFA đã được thiết lập; hãy nhập mã xác thực')
    if (state.pendingExpiresAt < new Date()) {
      await this.prisma.adminMfa.updateMany({ where: { userId: user.sub, enabledAt: null, pendingExpiresAt: state.pendingExpiresAt }, data: { secretEncrypted: this.encrypt(secret), pendingExpiresAt: expires } })
    }
    const pending = await this.prisma.adminMfa.findUnique({ where: { userId: user.sub } })
    const encoded = base32(this.decrypt(pending.secretEncrypted))
    return { secret: encoded, uri: `otpauth://totp/${encodeURIComponent('TechEnglish:' + user.email)}?secret=${encoded}&issuer=TechEnglish&algorithm=SHA1&digits=6&period=30` }
  }

  async verify(user: JwtPayload, code: string, reconfigure = false) {
    if (!privileged(user.roles) || !user.sid) throw new ForbiddenException('Vui lòng đăng nhập lại để xác thực MFA')
    const now = new Date()
    let result: { recoveryCodes?: string[]; verifiedAt?: Date; error?: string; reset?: boolean }
    try {
      result = await this.prisma.$transaction(async tx => {
        const state = await tx.adminMfa.findUnique({ where: { userId: user.sub } })
        if (!state) return { error: 'Hãy thiết lập ứng dụng xác thực trước' }
        if (state.lockedUntil && state.lockedUntil > now) return { error: 'Đã nhập sai nhiều lần. Vui lòng thử lại sau 5 phút' }
        if (!state.enabledAt && state.pendingExpiresAt < now) return { error: 'Thiết lập đã hết hạn; hãy tải lại khóa thiết lập' }
        const normalized = code.trim().replace(/[\s-]/g, '')
        const step = matchingStep(this.decrypt(state.secretEncrypted), normalized, state.lastStep)
        const recoveryHash = this.hash(normalized.toLowerCase())
        const recovery = Boolean(state.enabledAt && state.recoveryHashes.includes(recoveryHash))
        if (step === null && !recovery) {
          const failures = state.lockedUntil && state.lockedUntil <= now ? 1 : state.failedAttempts + 1
          await tx.adminMfa.update({ where: { userId: user.sub }, data: { failedAttempts: failures, lockedUntil: failures >= 5 ? new Date(now.getTime() + 300000) : null } })
          return { error: 'Mã xác thực không đúng, đã sử dụng hoặc đã hết hạn' }
        }
        if (reconfigure) {
          if (!state.enabledAt || (!user.mfaVerified && !recovery)) throw new ForbiddenException('Cần mã khôi phục hoặc phiên đã xác thực để thay ứng dụng')
          const current = await tx.refreshToken.updateMany({ where: { id: user.sid, userId: user.sub, revokedAt: null, expiresAt: { gt: now } }, data: { mfaVerifiedAt: null } })
          if (current.count !== 1) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn')
          await tx.adminMfa.delete({ where: { userId: user.sub } })
          await tx.refreshToken.updateMany({ where: { userId: user.sub }, data: { mfaVerifiedAt: null } })
          const request = auditContext.getStore()?.request
          if (request) { await saveEvent(tx, { ...eventBase(request, 201), outcome: 'success', eventKey: 'mfa.reset', severity: 'critical', oldValues: { enabled: true }, newValues: { enabled: false } }); request.auditPendingCommit = true }
          return { reset: true }
        }
        const recoveryCodes = state.enabledAt ? undefined : Array.from({ length: 10 }, () => randomBytes(10).toString('hex'))
        await tx.adminMfa.update({ where: { userId: user.sub }, data: {
          enabledAt: state.enabledAt ?? now, lastStep: step ?? state.lastStep, failedAttempts: 0, lockedUntil: null,
          recoveryHashes: recoveryCodes ? recoveryCodes.map(code => this.hash(code)) : state.recoveryHashes.filter(hash => hash !== recoveryHash),
        } })
        const session = await tx.refreshToken.updateMany({ where: { id: user.sid, userId: user.sub, revokedAt: null, expiresAt: { gt: now } }, data: { mfaVerifiedAt: now } })
        if (session.count !== 1) throw new UnauthorizedException('Phiên đăng nhập đã hết hạn')
        const request = auditContext.getStore()?.request
        if (request) { await saveEvent(tx, { ...eventBase(request, 201), outcome: 'success', eventKey: state.enabledAt ? 'mfa.verify' : 'mfa.enroll', oldValues: { enabled: Boolean(state.enabledAt) }, newValues: { enabled: true } }); request.auditPendingCommit = true }
        return { recoveryCodes, verifiedAt: now }
      }, { isolationLevel: 'Serializable' })
    } catch (error) {
      if ((error as { code?: string })?.code === 'P2034') throw new BadRequestException('Yêu cầu xác thực đang được xử lý. Hãy dùng mã mới và thử lại')
      throw error
    }
    if (result.error) throw new BadRequestException(result.error)
    const request = auditContext.getStore()?.request
    if (request?.auditPendingCommit) request.auditCommitted = true
    if (result.reset) return { success: true, reenrollRequired: true }
    const accessToken = this.jwt.sign({ sub: user.sub, email: user.email, roles: user.roles, permissions: user.permissions, sid: user.sid, mfaAt: result.verifiedAt.getTime() }, { expiresIn: '15m' })
    return { accessToken, recoveryCodes: result.recoveryCodes }
  }

  async reconfigure(user: JwtPayload, code: string) {
    if (!user.mfaVerified) throw new ForbiddenException('Cần xác thực MFA trước khi thay ứng dụng')
    // Consume the factor and revoke MFA grants on every device in one serializable transaction.
    return this.verify(user, code, true)
  }
}
