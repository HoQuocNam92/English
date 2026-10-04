import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PlacementService } from '../application/placement/placement.service'
@Controller('placement-test')
@UseGuards(JwtAuthGuard)
export class PlacementTestController {
  constructor(private readonly service: PlacementService) {}
  @Get()
  getTest(@Request() req: any) { return this.service.start(req.user.sub) }
  @Get('result')
  latest(@Request() req: any) { return this.service.latest(req.user.sub) }
  @Post('submit')
  submit(@Request() req: any, @Body() body: { assessmentId?: unknown; answers?: unknown }) { return this.service.submit(req.user.sub, body) }
  @Post('plan')
  personalPlan(@Request() req: any) { return this.service.personalPlan(req.user.sub) }
}
