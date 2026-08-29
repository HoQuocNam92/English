import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TaxonomyService } from '../application/taxonomy/taxonomy.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'

@ApiTags('Taxonomy & Metadata')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class TaxonomyController {
  constructor(private readonly svc: TaxonomyService) {}

  @Get('levels')
  @ApiOperation({ summary: 'List all levels' })
  getLevels() {
    return this.svc.getLevels()
  }

  @Get('domains')
  @ApiOperation({ summary: 'List all domains' })
  getDomains() {
    return this.svc.getDomains()
  }

  @Get('certificates')
  @ApiOperation({ summary: 'List all certificates' })
  getCertificates() {
    return this.svc.getCertificates()
  }

  @Get('student-groups')
  @ApiOperation({ summary: 'List student groups' })
  getStudentGroups(@Query() q: any) {
    return this.svc.getStudentGroups(q)
  }

  @Get('test-results')
  @ApiOperation({ summary: 'List test results / exam attempts' })
  getTestResults(@Query() q: any) {
    return this.svc.getTestResults(q)
  }
}
