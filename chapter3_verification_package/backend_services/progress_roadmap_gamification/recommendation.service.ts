import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getMyRecommendations(userId: string) {
    return this.prisma.recommendation.findMany({
      where: { learnerId: userId },
      orderBy: { priority: 'desc' },
      take: 10,
    });
  }
}
