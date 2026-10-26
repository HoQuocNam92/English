import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { PlacementService } from '../application/placement/placement.service'
@Controller('placement-test')
@UseGuards(JwtAuthGuard)
export class PlacementTestController {
  constructor(private readonly service: PlacementService) {}
  @Get()
  getTest(@Request() req: any) { return this.service.start(req.user.sub) }
  @Get('result')
  async latest(@Request() req: any, @Res() response: Response) {
    // Nest's default adapter sends a null return value as an empty HTTP 200 body.
    // This nullable endpoint must send the JSON literal null for API clients.
    response.json(await this.service.latest(req.user.sub))
  }
  @Post('submit')
  submit(@Request() req: any, @Body() body: { assessmentId?: unknown; answers?: unknown }) { return this.service.submit(req.user.sub, body) }
  @Post('plan')
  personalPlan(@Request() req: any) { return this.service.personalPlan(req.user.sub) }
}
