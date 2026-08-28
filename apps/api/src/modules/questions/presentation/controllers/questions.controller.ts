import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { QuestionsService } from '../../questions.service'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private svc: QuestionsService) {}
  @Get() @RequirePermissions('questions:read') findAll(@Query() q: any) { return this.svc.findAll(q) }
  @Get(':id') @RequirePermissions('questions:read') findOne(@Param('id') id: string) { return this.svc.findOne(id) }
  @Post() @RequirePermissions('questions:manage') create(@Body() dto: any) { return this.svc.create(dto) }
  @Patch(':id') @RequirePermissions('questions:manage') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto) }
  @Delete(':id') @RequirePermissions('questions:manage') @HttpCode(HttpStatus.NO_CONTENT) delete(@Param('id') id: string) { return this.svc.delete(id) }
}
