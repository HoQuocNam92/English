import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ExamsService } from '../../exams.service'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from '../../../../shared/presentation/decorators/current-user.decorator'

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('exams')
export class ExamsController {
  constructor(private svc: ExamsService) {}
  @Get() @RequirePermissions('exams:read') findAll(@Query() q: any) { return this.svc.findAll(q) }
  @Get(':id') @RequirePermissions('exams:read') findOne(@Param('id') id: string) { return this.svc.findOne(id) }
  @Post() @RequirePermissions('exams:create') create(@Body() dto: any, @CurrentUser() u: JwtPayload) { return this.svc.create(dto, u.sub) }
  @Patch(':id') @RequirePermissions('exams:create') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto) }
  @Patch(':id/publish') @RequirePermissions('exams:publish') publish(@Param('id') id: string) { return this.svc.publish(id) }
  @Delete(':id') @RequirePermissions('exams:create') @HttpCode(HttpStatus.NO_CONTENT) delete(@Param('id') id: string) { return this.svc.delete(id) }
  @Post(':id/attempts') @RequirePermissions('exams:read') @ApiOperation({ summary: 'Start exam attempt' })
  startAttempt(@Param('id') id: string, @CurrentUser() u: JwtPayload) { return this.svc.startAttempt(id, u.sub) }
  @Post('attempts/:attemptId/submit') @RequirePermissions('exams:read') @ApiOperation({ summary: 'Submit exam attempt' })
  submit(@Param('attemptId') aId: string, @Body() body: any, @CurrentUser() u: JwtPayload) { return this.svc.submitAttempt(aId, u.sub, body.answers ?? []) }
  @Get(':id/attempts') @RequirePermissions('exams:grade') @ApiOperation({ summary: 'View exam attempts' })
  attempts(@Param('id') id: string, @Query('learnerId') lid?: string) { return this.svc.getAttempts(id, lid) }
}
