import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/** Public catalog routes still authenticate a supplied bearer token for staff previews. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, _info: any, context: ExecutionContext): TUser {
    if (!context.switchToHttp().getRequest().headers.authorization) return null
    if (err || !user) throw err || new UnauthorizedException('Phiên đăng nhập không hợp lệ')
    return user
  }
}
