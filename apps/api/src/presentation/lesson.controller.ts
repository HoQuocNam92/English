import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LessonsService } from '../application/lesson/lesson.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { CreateLessonDto, UpdateLessonDto } from './http-dto/content.dto'

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private svc: LessonsService) {}

  @Get()
  @RequirePermissions('lessons:read')
  @ApiOperation({ summary: 'List lessons with filters' })
  findAll(@Query() q: any) { return this.svc.findAll(q) }

  @Get(':id')
  @RequirePermissions('lessons:read')
  @ApiOperation({ summary: 'Get lesson by id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id) }

  @Post()
  @RequirePermissions('lessons:create')
  @ApiOperation({ summary: 'Create lesson' })
  create(@Body() dto: CreateLessonDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user.sub)
  }

  @Patch(':id')
  @RequirePermissions('lessons:update')
  @ApiOperation({ summary: 'Update lesson' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.svc.update(id, dto)
  }

  @Patch(':id/publish')
  @RequirePermissions('lessons:publish')
  @ApiOperation({ summary: 'Publish lesson' })
  publish(@Param('id') id: string) { return this.svc.publish(id) }

  @Patch(':id/archive')
  @RequirePermissions('lessons:publish')
  @ApiOperation({ summary: 'Archive lesson' })
  archive(@Param('id') id: string) { return this.svc.archive(id) }

  @Delete(':id')
  @RequirePermissions('lessons:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lesson' })
  delete(@Param('id') id: string) { return this.svc.delete(id) }
}
