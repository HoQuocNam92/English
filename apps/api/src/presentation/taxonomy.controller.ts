import { Controller, Delete, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TaxonomyService } from '../application/taxonomy/taxonomy.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { RequirePermissions } from './decorators/require-permissions.decorator'
import { AddGroupMemberDto, CreateStudentGroupDto, UpdateStudentGroupDto } from './http-dto/group-planner.dto'

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

  @Get('student-groups')
  @RequirePermissions('groups:manage')
  @ApiOperation({ summary: 'List student groups' })
  getStudentGroups(@Query() q: any, @CurrentUser() user: JwtPayload) {
    return this.svc.getStudentGroups(q, user)
  }

  @Post('student-groups')
  @RequirePermissions('groups:manage')
  @ApiOperation({ summary: 'Create student group' })
  createStudentGroup(@Body() dto: CreateStudentGroupDto, @CurrentUser() user: JwtPayload) {
    return this.svc.createStudentGroup(dto, user)
  }

  @Get('student-groups/:id')
  @RequirePermissions('groups:manage')
  getStudentGroup(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.getStudentGroup(id, user)
  }

  @Patch('student-groups/:id')
  @RequirePermissions('groups:manage')
  updateStudentGroup(@Param('id') id: string, @Body() dto: UpdateStudentGroupDto, @CurrentUser() user: JwtPayload) {
    return this.svc.updateStudentGroup(id, dto, user)
  }

  @Delete('student-groups/:id')
  @RequirePermissions('groups:manage')
  deleteStudentGroup(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.deleteStudentGroup(id, user)
  }

  @Post('student-groups/:id/members')
  @RequirePermissions('groups:manage')
  addStudentGroupMember(@Param('id') id: string, @Body() dto: AddGroupMemberDto, @CurrentUser() user: JwtPayload) {
    return this.svc.addStudentGroupMember(id, dto.learnerId, user)
  }

  @Delete('student-groups/:id/members/:learnerId')
  @RequirePermissions('groups:manage')
  removeStudentGroupMember(@Param('id') id: string, @Param('learnerId') learnerId: string, @CurrentUser() user: JwtPayload) {
    return this.svc.removeStudentGroupMember(id, learnerId, user)
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
