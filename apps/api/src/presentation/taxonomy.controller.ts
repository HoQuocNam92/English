import { Controller, Delete, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TaxonomyService } from '../application/taxonomy/taxonomy.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { RequirePermissions } from './decorators/require-permissions.decorator'

@ApiTags('Taxonomy & Metadata')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class TaxonomyController {
  constructor(private readonly svc: TaxonomyService) {}

  @Get('career-goals')
  @ApiOperation({ summary: 'List career goals' })
  getCareerGoals() { return this.svc.getCareerGoals() }

  @Post('career-goals')
  @RequirePermissions('users:update')
  createCareerGoal(@Body() dto: any) { return this.svc.createCareerGoal(dto) }

  @Patch('career-goals/:id')
  @RequirePermissions('users:update')
  updateCareerGoal(@Param('id') id: string, @Body() dto: any) { return this.svc.updateCareerGoal(id, dto) }

  @Get('levels')
  @ApiOperation({ summary: 'List all levels' })
  getLevels() {
    return this.svc.getLevels()
  }

  @Get('levels/:id')
  @ApiOperation({ summary: 'Get level by ID' })
  getLevel(@Param('id') id: string) {
    return this.svc.getLevel(id)
  }

  @Post('levels')
  @RequirePermissions('certificates:manage')
  @ApiOperation({ summary: 'Create a new level' })
  createLevel(@Body() dto: any) {
    return this.svc.createLevel(dto)
  }

  @Patch('levels/:id')
  @RequirePermissions('certificates:manage')
  @ApiOperation({ summary: 'Update a level' })
  updateLevel(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateLevel(id, dto)
  }

  @Delete('levels/:id')
  @RequirePermissions('certificates:manage')
  @ApiOperation({ summary: 'Delete a level' })
  deleteLevel(@Param('id') id: string) {
    return this.svc.deleteLevel(id)
  }

  @Get('domains')
  @ApiOperation({ summary: 'List all domains' })
  getDomains(@Query('activeOnly') activeOnly?: string) {
    return this.svc.getDomains(activeOnly === 'true')
  }

  @Get('certificates')
  @ApiOperation({ summary: 'List all certificates' })
  getCertificates(@Query('activeOnly') activeOnly?: string) {
    return this.svc.getCertificates(activeOnly === 'true')
  }

  @Get('certificates/:id')
  getCertificate(@Param('id') id: string) {
    return this.svc.getCertificate(id)
  }

  @Post('certificates')
  @RequirePermissions('certificates:manage')
  @ApiOperation({ summary: 'Create a certificate' })
  createCertificate(@Body() dto: any) {
    return this.svc.createCertificate(dto)
  }

  @Patch('certificates/:id')
  @RequirePermissions('certificates:manage')
  @ApiOperation({ summary: 'Update a certificate' })
  updateCertificate(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateCertificate(id, dto)
  }

  @Patch('certificates/:id/content-links')
  @RequirePermissions('certificates:manage')
  updateCertificateLinks(@Param('id') id: string, @Body() dto: { exams?: string[] }) {
    return this.svc.updateCertificateLinks(id, dto)
  }

  @Post('certificates/:id/domains')
  @RequirePermissions('certificates:manage')
  addCertificateDomain(@Param('id') id: string, @Body() dto: { domainId: string; weightPercent?: number; order?: number }) {
    return this.svc.addCertificateDomain(id, dto)
  }

  @Post('certificates/:id/topics')
  @RequirePermissions('certificates:manage')
  addCertificationTopic(@Param('id') id: string, @Body() dto: { domainId: string; code: string; name: string; description?: string; order?: number }) {
    return this.svc.addCertificationTopic(id, dto)
  }

  @Patch('certification-topics/:topicId/content-links')
  @RequirePermissions('certificates:manage')
  updateCertificationTopicLinks(@Param('topicId') topicId: string, @Body() dto: { vocabularies?: string[]; questions?: string[]; lessons?: string[] }) {
    return this.svc.updateCertificationTopicLinks(topicId, dto)
  }

  @Delete('certificates/:id')
  @RequirePermissions('certificates:manage')
  deleteCertificate(@Param('id') id: string) {
    return this.svc.deleteCertificate(id)
  }

  @Get('students')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'List all students/learners (for teachers and admins)' })
  getStudents(@Query() q: any) {
    return this.svc.getStudents(q)
  }

  @Get('test-results')
  @RequirePermissions('exams:grade')
  @ApiOperation({ summary: 'List test results / exam attempts' })
  getTestResults(@Query() q: any) {
    return this.svc.getTestResults(q)
  }

  @Get('progress-overview')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'List student progress tracking overview' })
  getStudentProgress(@Query() q: any) {
    return this.svc.getStudentProgress(q)
  }

  @Get('analytics/dashboard')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get dashboard analytics & chart data' })
  getDashboardAnalytics(@Query() query: any) {
    return this.svc.getDashboardAnalytics(query)
  }

  @Get('reports/domain/:domainId')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get detailed report for a specific domain' })
  getDomainReport(@Param('domainId') domainId: string) {
    return this.svc.getDomainReport(domainId)
  }
}


