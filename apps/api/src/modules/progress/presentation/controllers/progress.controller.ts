import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ProgressService } from '../../progress.service'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from '../../../../shared/presentation/decorators/current-user.decorator'

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
