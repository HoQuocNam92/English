import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ExamsService } from '../application/exam/exam.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { SubmitAttemptDto } from './http-dto/exam-attempt.dto'

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
  @Get('attempts/my')
  @ApiOperation({ summary: 'Get my exam attempts' })
  getMyAttempts(@CurrentUser() u: JwtPayload) {
    return this.svc.getMyAttempts(u.sub)
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Get exam attempt by id' })
  getAttemptById(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return this.svc.getAttemptById(id, u.sub)
  }

  @Post(':id/attempts') @RequirePermissions('exams:read') @ApiOperation({ summary: 'Start exam attempt' })
  startAttempt(@Param('id') id: string, @CurrentUser() u: JwtPayload) { return this.svc.startAttempt(id, u.sub) }
  @Post('attempts/:attemptId/submit') @RequirePermissions('exams:read') @ApiOperation({ summary: 'Submit exam attempt' })
  submit(@Param('attemptId') aId: string, @Body() body: SubmitAttemptDto, @CurrentUser() u: JwtPayload) { return this.svc.submitAttempt(aId, u.sub, body.answers ?? []) }
  @Get(':id/attempts') @RequirePermissions('exams:grade') @ApiOperation({ summary: 'View exam attempts' })
  attempts(@Param('id') id: string, @Query('learnerId') lid?: string) { return this.svc.getAttempts(id, lid) }
}
