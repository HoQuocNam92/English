import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ReportsService } from '../../reports.service'
import { JwtAuthGuard } from '../../../auth/infrastructure/jwt-auth.guard'
import { PermissionsGuard } from '../../../auth/infrastructure/permissions.guard'
import { RequirePermissions } from '../../../../shared/presentation/decorators/require-permissions.decorator'

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private svc: ReportsService) {}
  @Get('stats') @RequirePermissions('reports:read') @ApiOperation({ summary: 'Overall system stats' }) stats() { return this.svc.overallStats() }
  @Get('learners-by-domain') @RequirePermissions('reports:read') @ApiOperation({ summary: 'Learner count by IT domain' }) byDomain() { return this.svc.learnersByDomain() }
  @Get('scores-by-certificate') @RequirePermissions('reports:read') @ApiOperation({ summary: 'Scores by certificate goal' }) byCert() { return this.svc.scoresByCertificate() }
}
