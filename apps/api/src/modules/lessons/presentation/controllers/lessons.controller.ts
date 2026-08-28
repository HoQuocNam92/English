import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LessonsService } from '../../lessons.service'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from '../../../../shared/presentation/decorators/current-user.decorator'

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private svc: LessonsService) {}

  @Get() @RequirePermissions('lessons:read') findAll(@Query() q: any) { return this.svc.findAll(q) }
  @Get(':id') @RequirePermissions('lessons:read') findOne(@Param('id') id: string) { return this.svc.findOne(id) }
  @Post() @RequirePermissions('lessons:create') create(@Body() dto: any, @CurrentUser() user: JwtPayload) { return this.svc.create(dto, user.sub) }
  @Patch(':id') @RequirePermissions('lessons:update') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto) }
  @Patch(':id/publish') @RequirePermissions('lessons:publish') publish(@Param('id') id: string) { return this.svc.publish(id) }
  @Patch(':id/archive') @RequirePermissions('lessons:publish') archive(@Param('id') id: string) { return this.svc.archive(id) }
  @Delete(':id') @RequirePermissions('lessons:delete') @HttpCode(HttpStatus.NO_CONTENT) delete(@Param('id') id: string) { return this.svc.delete(id) }
}
