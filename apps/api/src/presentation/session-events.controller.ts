import { Controller, Header, Sse, UseGuards } from '@nestjs/common'
import type { MessageEvent } from '@nestjs/common'
import { Observable } from 'rxjs'
import { PrismaService } from '../infrastructure/database/prisma.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@Controller('auth')
export class SessionEventsController {
  constructor(private prisma: PrismaService) {}
  @Sse('session-events') @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store') @Header('X-Accel-Buffering', 'no')
  events(@CurrentUser() user: JwtPayload): Observable<MessageEvent> {
    return new Observable(subscriber => {
      let stopped = false, checking = false
      const check = async () => {
        if (stopped || checking) return
        checking = true
        try {
          const session = await this.prisma.refreshToken.findUnique({ where: { id: user.sid } })
          if (!stopped && (!session || session.userId !== user.sub || session.revokedAt || session.expiresAt <= new Date())) {
            subscriber.next({ type: 'revoked', data: { reason: 'SESSION_REVOKED' } }); subscriber.complete()
          } else if (!stopped) subscriber.next({ type: 'heartbeat', data: { active: true } })
        } catch { if (!stopped) subscriber.complete() }
        finally { checking = false }
      }
      const timer = setInterval(() => { void check() }, 2000)
      void check()
      return () => { stopped = true; clearInterval(timer) }
    })
  }
}
