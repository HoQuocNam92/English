import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { QuestionsService } from '../application/question/question.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private svc: QuestionsService) {}

  @Get() @RequirePermissions('questions:read')
  @ApiOperation({ summary: 'List questions with filters' })
  findAll(@Query() q: any) { return this.svc.findAll(q) }

  @Get(':id') @RequirePermissions('questions:read')
  @ApiOperation({ summary: 'Get question by id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id) }

  @Post() @RequirePermissions('questions:manage')
  @ApiOperation({ summary: 'Create question' })
  create(@Body() dto: any) { return this.svc.create(dto) }

  @Patch(':id') @RequirePermissions('questions:manage')
  @ApiOperation({ summary: 'Update question' })
  update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto) }

  @Delete(':id') @RequirePermissions('questions:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete question' })
  delete(@Param('id') id: string) { return this.svc.delete(id) }
}