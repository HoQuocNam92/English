import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RolesService } from '../application/role/role.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

class CreateRoleDto {
  @ApiProperty() @IsString() code: string
  @ApiProperty() @IsString() name: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
}
class UpdateRoleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean
}
class AssignRoleDto {
  @ApiProperty() @IsString() userId: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiresAt?: string
}
class AssignPermissionDto {
  @ApiProperty() @IsString() permissionId: string
}

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get() @RequirePermissions('roles:read') @ApiOperation({ summary: 'List all roles' })
  findAll() { return this.rolesService.findAll() }

  @Get('permissions') @RequirePermissions('permissions:read') @ApiOperation({ summary: 'List all permissions' })
  allPermissions() { return this.rolesService.findAllPermissions() }

  @Get(':id') @RequirePermissions('roles:read') @ApiOperation({ summary: 'Get role detail' })
  findOne(@Param('id') id: string) { return this.rolesService.findOne(id) }

  @Get(':id/users') @RequirePermissions('roles:read') @ApiOperation({ summary: 'List users with this role' })
  users(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.rolesService.findUsersByRole(id, page, limit)
  }

  @Post() @RequirePermissions('roles:create') @ApiOperation({ summary: 'Create custom role' })
  create(@Body() dto: CreateRoleDto) { return this.rolesService.create(dto) }

  @Patch(':id') @RequirePermissions('roles:update') @ApiOperation({ summary: 'Update role' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) { return this.rolesService.update(id, dto) }

  @Delete(':id') @RequirePermissions('roles:delete') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete custom role' })
  delete(@Param('id') id: string) { return this.rolesService.delete(id) }

  @Post(':id/permissions') @RequirePermissions('roles:update') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Assign permission to role' })
  assignPermission(@Param('id') id: string, @Body() dto: AssignPermissionDto) { return this.rolesService.assignPermission(id, dto.permissionId) }

  @Delete(':id/permissions/:permId') @RequirePermissions('roles:update') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Revoke permission from role' })
  revokePermission(@Param('id') id: string, @Param('permId') permId: string) { return this.rolesService.revokePermission(id, permId) }

  @Post(':id/users') @RequirePermissions('roles:assign') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Assign role to user' })
  assignUser(@Param('id') id: string, @Body() dto: AssignRoleDto, @CurrentUser() actor: JwtPayload) {
    return this.rolesService.assignRoleToUser({ userId: dto.userId, roleId: id, expiresAt: dto.expiresAt, grantedById: actor.sub })
  }

  @Delete(':id/users/:userId') @RequirePermissions('roles:assign') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Revoke role from user' })
  revokeUser(@Param('id') id: string, @Param('userId') userId: string) { return this.rolesService.revokeRoleFromUser(userId, id) }
}
