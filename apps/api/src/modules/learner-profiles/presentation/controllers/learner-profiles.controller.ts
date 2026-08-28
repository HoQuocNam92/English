import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LearnerProfilesService } from '../../learner-profiles.service'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from '../../../../shared/presentation/decorators/current-user.decorator'

@ApiTags('Learner Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('learner-profiles')
export class LearnerProfilesController {
  constructor(private svc: LearnerProfilesService) {}
  @Get() @RequirePermissions('users:read') findAll(@Query() q: any) { return this.svc.findAll(q) }
  @Get('me') @ApiOperation({ summary: 'Get my learner profile' }) getMe(@CurrentUser() u: JwtPayload) { return this.svc.findByUser(u.sub) }
  @Put('me') @ApiOperation({ summary: 'Update my learner profile' }) updateMe(@CurrentUser() u: JwtPayload, @Body() dto: any) { return this.svc.upsert(u.sub, dto) }
  @Put('me/domains') @ApiOperation({ summary: 'Update my domain interests' }) updateDomains(@CurrentUser() u: JwtPayload, @Body() body: any) { return this.svc.updateDomains(u.sub, body.domainCodes) }
  @Get(':userId') @RequirePermissions('users:read') findOne(@Param('userId') uid: string) { return this.svc.findByUser(uid) }
}
