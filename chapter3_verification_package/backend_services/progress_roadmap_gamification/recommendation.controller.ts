import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecommendationService } from '../application/recommendation/recommendation.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationController {
  constructor(private svc: RecommendationService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my recommendations' })
  getMyRecommendations(@CurrentUser() u: JwtPayload) {
    return this.svc.getMyRecommendations(u.sub);
  }
}
