import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Controller('career-prep')
@UseGuards(JwtAuthGuard)
export class CareerPrepController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    return { profile: {}, skills: [], readinessScore: 85 };
  }

  @Put('target')
  async updateTarget(@Request() req: any, @Body() body: { careerGoalId: string }) {
    return { success: true };
  }
}
