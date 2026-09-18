import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { RecommendationService } from '../application/recommendation/recommendation.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PermissionsGuard } from '../infrastructure/auth/permissions.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly svc: RecommendationService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Lấy danh sách gợi ý học tập cá nhân hoá theo độ ưu tiên kết quả và tiến độ',
  })
  getRecommendations(@CurrentUser() u: JwtPayload) {
    return this.svc.getRecommendations(u.sub)
  }
}
