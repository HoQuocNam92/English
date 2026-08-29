import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ProgressService } from '../application/progress/progress.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('progress')
export class ProgressController {
  constructor(private svc: ProgressService) {}
  @Get('me') @ApiOperation({ summary: 'Get my learning progress' }) getMe(@CurrentUser() u: JwtPayload) { return this.svc.getMyProgress(u.sub) }
  @Post('me') @ApiOperation({ summary: 'Update my progress' }) updateMe(@CurrentUser() u: JwtPayload, @Body() dto: any) { return this.svc.upsertProgress(u.sub, dto) }
  @Get('learners/:id') @RequirePermissions('reports:read') getLearner(@Param('id') id: string) { return this.svc.getLearnerProgress(id) }
}
