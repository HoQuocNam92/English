import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { privileged } from '../../application/auth/admin-mfa.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return this.requireMfa(context)
  }
  private async requireMfa(context: ExecutionContext): Promise<boolean> {
    const allowed = await super.canActivate(context) as boolean
    const request = context.switchToHttp().getRequest()
    const path = request.path.replace(/\/$/, '')
    const exemptions = ['/auth/mfa/status', '/auth/mfa/setup', '/auth/mfa/verify', '/auth/me', '/auth/logout']
    if (privileged(request.user?.roles ?? []) && !request.user.mfaVerified && !exemptions.some(route => path === `/api/v1${route}` || path === route)) {
      throw new ForbiddenException({ message: 'Vui lòng xác thực MFA trước khi vào khu vực quản trị', code: 'MFA_REQUIRED' })
    }
    return allowed
  }
}
