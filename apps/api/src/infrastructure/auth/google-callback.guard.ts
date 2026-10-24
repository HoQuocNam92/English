import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest<TUser = any>(error: any, user: any): TUser {
    if (error || !user) {
      // Only expose known account messages, never provider/network internals.
      const status = error?.getStatus?.()
      const message = [400, 401, 409].includes(status)
        ? error.message
        : 'Không thể đăng nhập Google. Vui lòng thử lại.'
      return { authError: message } as TUser
    }
    return user
  }
}
