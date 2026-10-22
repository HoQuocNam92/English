import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsGuard } from './permissions.guard'

// Teaching access applies only to learner-group endpoints.
@Injectable()
export class LearnerGroupGuard extends PermissionsGuard {
  constructor(reflector: Reflector) { super(reflector) }
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest().user?.roles?.includes('teacher')) return true
    return super.canActivate(context)
  }
}
