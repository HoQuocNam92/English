import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { LearnerGroupService } from '../application/learner-group/learner-group.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { LearnerGroupGuard } from '../infrastructure/auth/learner-group.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { RequirePermissions } from './decorators/require-permissions.decorator'

@ApiTags('Learner Groups') @ApiBearerAuth() @UseGuards(JwtAuthGuard, LearnerGroupGuard) @Controller('learner-groups')
export class LearnerGroupController {
  constructor(private readonly groups: LearnerGroupService) {}
  @Get() @RequirePermissions('users:read') list(@CurrentUser() user: JwtPayload) { return this.groups.list(undefined) }
  @Post() @RequirePermissions('users:update') create(@CurrentUser() user: JwtPayload, @Body() dto: any) { return this.groups.create(user.sub, dto) }
  @Patch(':id') @RequirePermissions('users:update') update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) { return this.groups.update(id, dto, undefined) }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @RequirePermissions('users:update') remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.groups.remove(id, undefined) }
  @Post(':id/members') @RequirePermissions('users:update') addMember(@Param('id') id: string, @Body() dto: { learnerId: string }, @CurrentUser() user: JwtPayload) { return this.groups.addMember(id, dto.learnerId, undefined) }
  @Delete(':id/members/:learnerId') @HttpCode(HttpStatus.NO_CONTENT) @RequirePermissions('users:update') removeMember(@Param('id') id: string, @Param('learnerId') learnerId: string, @CurrentUser() user: JwtPayload) { return this.groups.removeMember(id, learnerId, undefined) }
}
