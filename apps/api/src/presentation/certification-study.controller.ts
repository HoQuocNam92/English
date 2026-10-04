import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'
import { CertificationStudyService } from '../application/lesson/certification-study.service'

@ApiTags('Certification Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('certification-study')
export class CertificationStudyController {
  constructor(private readonly service: CertificationStudyService) {}
  @Get('certificates/:id/progress')
  progress(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.service.getCertificateProgress(user.sub, id) }
  @Get('topics/:id')
  topic(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.service.getTopic(user.sub, id) }
}
