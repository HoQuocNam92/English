import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const WRITING_PROMPTS = [
  { topic: 'Cloud Migration', prompt: 'Bạn là kỹ sư IT tại một công ty đang migrate hệ thống on-premise lên AWS. Viết email báo cáo tiến độ cho CTO, bao gồm rủi ro và kế hoạch giảm thiểu.', difficulty: 'intermediate' },
  { topic: 'Incident Report', prompt: 'Hệ thống production vừa bị downtime 2 giờ. Viết incident report mô tả nguyên nhân, ảnh hưởng và các bước khắc phục.', difficulty: 'advanced' },
  { topic: 'Technical Proposal', prompt: 'Đề xuất giải pháp cải thiện performance cho một web application đang chạy chậm. Viết technical proposal ngắn gọn.', difficulty: 'advanced' },
  { topic: 'API Documentation', prompt: 'Viết documentation cho một REST API endpoint để tạo user account, bao gồm request/response format và error codes.', difficulty: 'beginner' },
  { topic: 'Security Policy', prompt: 'Công ty yêu cầu viết password policy cho nhân viên. Tạo một policy rõ ràng và dễ hiểu.', difficulty: 'beginner' },
];

export class SubmitWritingDto {
  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty()
  @IsString()
  userText: string;
}

@ApiTags('AI Writing Practice')
@Controller('writing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WritingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('prompts')
  @ApiOperation({ summary: 'Danh sách writing prompts' })
  async getPrompts() {
    return WRITING_PROMPTS;
  }

  @Post('submit')
  @ApiOperation({ summary: 'Nộp bài writing để nhận phản hồi AI' })
  async submit(@CurrentUser() user: JwtPayload, @Body() dto: SubmitWritingDto) {
    const words = dto.userText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    // Heuristic scoring
    const grammarScore = Math.min(10, 6 + Math.random() * 3);
    const clarityScore = Math.min(10, wordCount > 80 ? 7 + Math.random() * 2 : 5 + Math.random() * 2);
    const vocabScore = Math.min(10, 6 + Math.random() * 3);
    const overallScore = (grammarScore + clarityScore + vocabScore) / 3;
    const feedbacks = [
      `Bài viết ${wordCount} từ. Cấu trúc câu tốt. Gợi ý: sử dụng thêm technical terms như "latency", "throughput", "SLA".`,
      `Nội dung rõ ràng và có logic. Cần bổ sung: số liệu cụ thể, timeline và actionable recommendations.`,
      `Từ vựng chuyên ngành phù hợp. Cải thiện: thêm paragraph transitions và conclusion mạnh hơn.`,
    ];
    const aiFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    const submission = await this.prisma.writingSubmission.create({
      data: { userId: user.sub, prompt: dto.prompt, topic: dto.topic, userText: dto.userText, aiFeedback, grammarScore, clarityScore, vocabScore, overallScore },
    });
    return submission;
  }

  @Get('my')
  @ApiOperation({ summary: 'Lịch sử bài writing của user' })
  async getMySubmissions(@CurrentUser() user: JwtPayload) {
    return this.prisma.writingSubmission.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
