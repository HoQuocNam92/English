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

  @Get('career-goals')
  @ApiOperation({ summary: 'List active career goals' })
  getCareerGoals() {
    return this.svc.getCareerGoals()
  }

  @Get('certificates')
  @ApiOperation({ summary: 'List all certificates' })
  getCertificates() {
    return this.svc.getCertificates()
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
  updateCertificateLinks(@Param('id') id: string, @Body() dto: { lessons?: string[]; questions?: string[]; exams?: string[] }) {
    return this.svc.updateCertificateLinks(id, dto)
  }

  @Post('certificates/:id/contents')
  @RequirePermissions('certificates:manage')
  createCertificationContent(@Param('id') id: string, @Body() dto: any) {
    return this.svc.createCertificationContent(id, dto)
  }

  @Patch('certification-contents/:contentId')
  @RequirePermissions('certificates:manage')
  updateCertificationContent(@Param('contentId') contentId: string, @Body() dto: any) {
    return this.svc.updateCertificationContent(contentId, dto)
  }

  @Delete('certification-contents/:contentId')
  @RequirePermissions('certificates:manage')
  deleteCertificationContent(@Param('contentId') contentId: string) {
    return this.svc.deleteCertificationContent(contentId)
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
  getDashboardAnalytics() {
    return this.svc.getDashboardAnalytics()
  }
}
