import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TaxonomyService } from '../application/taxonomy/taxonomy.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

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

  @Post('certificates')
  @ApiOperation({ summary: 'Create a certificate' })
  createCertificate(@Body() dto: any) {
    return this.svc.createCertificate(dto)
  }

  @Patch('certificates/:id')
  @ApiOperation({ summary: 'Update a certificate' })
  updateCertificate(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateCertificate(id, dto)
  }

  @Get('students')
  @ApiOperation({ summary: 'List all students/learners (for teachers and admins)' })
  getStudents(@Query() q: any) {
    return this.svc.getStudents(q)
  }

  @Get('student-groups')
  @ApiOperation({ summary: 'List student groups' })
  getStudentGroups(@Query() q: any) {
    return this.svc.getStudentGroups(q)
  }

  @Post('student-groups')
  @ApiOperation({ summary: 'Create student group' })
  createStudentGroup(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.svc.createStudentGroup(dto, user?.sub)
  }

  @Get('test-results')
  @ApiOperation({ summary: 'List test results / exam attempts' })
  getTestResults(@Query() q: any) {
    return this.svc.getTestResults(q)
  }

  @Get('progress-overview')
  @ApiOperation({ summary: 'List student progress tracking overview' })
  getStudentProgress(@Query() q: any) {
    return this.svc.getStudentProgress(q)
  }

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics & chart data' })
  getDashboardAnalytics() {
    return this.svc.getDashboardAnalytics()
  }
}
