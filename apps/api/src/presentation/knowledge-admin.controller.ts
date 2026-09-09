import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { RagService } from '../application/ai-chat/rag.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'

@Controller('admin/knowledge')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('lessons:manage')
export class KnowledgeAdminController {
  constructor(private readonly rag: RagService) {}

  @Post('reindex') reindex() { return this.rag.reindexPublished() }
  @Get('health') health() { return this.rag.health() }
}
