import { LearningAgendaService } from '../application/progress/learning-agenda.service'
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ProgressService } from '../application/progress/progress.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { TrackProgressDto } from './http-dto/content.dto'

@ApiTags('Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('progress')
export class ProgressController {
  constructor(private svc: ProgressService, private readonly agenda: LearningAgendaService) {}

  @Get('me/agenda')
  getAgenda(@CurrentUser() u: JwtPayload) { return this.agenda.getAgenda(u.sub) }

  @Get('me')
  @ApiOperation({ summary: 'Get my learning progress summary' })
  getMe(@CurrentUser() u: JwtPayload) { return this.svc.getMyProgress(u.sub) }

  @Post('me')
  @ApiOperation({ summary: 'Track learning progress' })
  updateMe(@CurrentUser() u: JwtPayload, @Body() dto: TrackProgressDto) {
    return this.svc.upsertProgress(u.sub, dto)
  }

  @Get('learners/:id')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get learner progress by userId (teacher/admin)' })
  getLearner(@Param('id') id: string) { return this.svc.getLearnerProgress(id) }
}
