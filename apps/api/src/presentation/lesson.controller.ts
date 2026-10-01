import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LessonsService } from '../application/lesson/lesson.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { CreateLessonDto, UpdateLessonDto } from './http-dto/content.dto'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { RequirePermissions } from './decorators/require-permissions.decorator'

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get() @ApiOperation({ summary: 'Danh sách bài học với bộ lọc' })
  findAll(@Query() query: Record<string, unknown>) { return this.lessons.findAll(query) }

  @Get(':id') @ApiOperation({ summary: 'Chi tiết bài học' })
  findOne(@Param('id') id: string) { return this.lessons.findOne(id) }

  @Post() @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('lessons:create')
  create(@Body() dto: CreateLessonDto, @CurrentUser() user: JwtPayload) { return this.lessons.create(dto, user.sub) }

  @Patch(':id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('lessons:update')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) { return this.lessons.update(id, dto) }

  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @RequirePermissions('lessons:delete')
  remove(@Param('id') id: string) { return this.lessons.remove(id) }
}
