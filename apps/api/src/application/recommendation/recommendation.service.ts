import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getMyRecommendations(userId: string) {
    const [progress, saved] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where: { learnerId: userId, resourceType: 'lesson' },
        orderBy: [{ averageScorePercent: 'asc' }, { completionPercent: 'asc' }], take: 30,
      }),
      this.prisma.recommendation.findMany({
        where: { learnerId: userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        orderBy: { priority: 'desc' }, take: 10,
      }),
    ]);
    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: progress.map((item) => item.resourceId) } }, include: { domain: true },
    });
    const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    const evaluated = progress.filter((item) => item.averageScorePercent !== null);
    const strengths = evaluated.filter((item) => (item.averageScorePercent ?? 0) >= 80).slice(-3).map((item) => ({
      topic: lessonMap.get(item.resourceId)?.title ?? 'Bài học',
      description: `Điểm trung bình ${Math.round(item.averageScorePercent ?? 0)}%`,
    }));
    const weaknesses = evaluated.filter((item) => (item.averageScorePercent ?? 100) < 70).slice(0, 5).map((item) => ({
      topic: lessonMap.get(item.resourceId)?.title ?? 'Bài học',
      progress: Math.round(item.averageScorePercent ?? item.completionPercent),
      label: (item.averageScorePercent ?? 0) < 50 ? 'Ưu tiên cao' : 'Cần ôn tập',
      resourceId: item.resourceId,
    }));
    const unfinished = progress.filter((item) => item.completionPercent < 100).slice(0, 5);
    const learningPath = unfinished.map((item, index) => ({
      step: index + 1, title: lessonMap.get(item.resourceId)?.title ?? 'Tiếp tục bài học',
      description: lessonMap.get(item.resourceId)?.summary ?? `Đã hoàn thành ${Math.round(item.completionPercent)}%`,
      current: index === 0, resourceId: item.resourceId,
    }));
    const topTopic = weaknesses[0]?.topic ?? learningPath[0]?.title;
    return {
      topic: topTopic ?? 'Bắt đầu lộ trình học',
      hint: weaknesses.length
        ? `Ưu tiên nội dung có kết quả thấp nhất dựa trên ${evaluated.length} bài đã được đánh giá.`
        : 'Chưa đủ kết quả chấm điểm; hãy hoàn thành thêm bài học hoặc bài kiểm tra để nhận phân tích chính xác hơn.',
      strengths, weaknesses, learningPath, savedRecommendations: saved,
      evidence: { progressRecords: progress.length, evaluatedLessons: evaluated.length },
    };
  }
}
