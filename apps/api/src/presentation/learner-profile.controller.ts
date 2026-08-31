import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LearnerProfilesService } from '../application/learner-profile/learner-profile.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { UpdateLearnerProfileDto, CompleteOnboardingDto } from './http-dto/content.dto'

@ApiTags('Learner Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('learner-profiles')
export class LearnerProfilesController {
  constructor(private svc: LearnerProfilesService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List all learner profiles (admin/teacher)' })
  findAll(@Query() q: any) { return this.svc.findAll(q) }

  @Get('me')
  @ApiOperation({ summary: 'Get my learner profile' })
  getMe(@CurrentUser() u: JwtPayload) { return this.svc.findByUser(u.sub) }

  @Put('me')
  @ApiOperation({ summary: 'Update my learner profile' })
  updateMe(@CurrentUser() u: JwtPayload, @Body() dto: UpdateLearnerProfileDto) {
    return this.svc.upsert(u.sub, dto)
  }

  @Put('me/domains')
  @ApiOperation({ summary: 'Update my domain interests' })
  updateDomains(@CurrentUser() u: JwtPayload, @Body() body: { domainCodes: string[] }) {
    return this.svc.updateDomains(u.sub, body.domainCodes)
  }

  @Post('me/complete-onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete onboarding — lưu level, domain, career goal, chứng chỉ mục tiêu' })
  completeOnboarding(@CurrentUser() u: JwtPayload, @Body() dto: CompleteOnboardingDto) {
    return this.svc.completeOnboarding(u.sub, dto)
  }

  @Get(':userId')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get learner profile by userId' })
  findOne(@Param('userId') uid: string) { return this.svc.findByUser(uid) }
}
