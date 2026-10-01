import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { LearnerGroupService } from '../application/learner-group/learner-group.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { RequirePermissions } from './decorators/require-permissions.decorator'

@ApiTags('Learner Groups') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller('learner-groups')
export class LearnerGroupController {
  constructor(private readonly groups: LearnerGroupService) {}
  @Get() @RequirePermissions('users:read') list() { return this.groups.list() }
  @Post() @RequirePermissions('users:update') create(@CurrentUser() user: JwtPayload, @Body() dto: any) { return this.groups.create(user.sub, dto) }
  @Patch(':id') @RequirePermissions('users:update') update(@Param('id') id: string, @Body() dto: any) { return this.groups.update(id, dto) }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @RequirePermissions('users:update') remove(@Param('id') id: string) { return this.groups.remove(id) }
  @Post(':id/members') @RequirePermissions('users:update') addMember(@Param('id') id: string, @Body() dto: { learnerId: string }) { return this.groups.addMember(id, dto.learnerId) }
  @Delete(':id/members/:learnerId') @HttpCode(HttpStatus.NO_CONTENT) @RequirePermissions('users:update') removeMember(@Param('id') id: string, @Param('learnerId') learnerId: string) { return this.groups.removeMember(id, learnerId) }
}
