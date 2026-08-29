import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { VocabularyService } from '../application/vocabulary/vocabulary.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'

@ApiTags('Vocabulary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vocabulary')
export class VocabularyController {
  constructor(private svc: VocabularyService) {}

  @Get() @RequirePermissions('vocabulary:read') @ApiOperation({ summary: 'List vocabulary' })
  findAll(@Query() q: any) { return this.svc.findAll(q) }

  @Get(':id') @RequirePermissions('vocabulary:read') @ApiOperation({ summary: 'Get vocabulary by id' })
  findOne(@Param('id') id: string) { return this.svc.findOne(id) }

  @Post() @RequirePermissions('vocabulary:manage') @ApiOperation({ summary: 'Create vocabulary' })
  create(@Body() dto: any) { return this.svc.create(dto) }

  @Patch(':id') @RequirePermissions('vocabulary:manage') @ApiOperation({ summary: 'Update vocabulary' })
  update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto) }

  @Delete(':id') @RequirePermissions('vocabulary:manage') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete vocabulary' })
  delete(@Param('id') id: string) { return this.svc.delete(id) }
}
