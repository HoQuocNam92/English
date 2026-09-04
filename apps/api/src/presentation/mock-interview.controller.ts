import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  networking: [
    'Giải thích sự khác biệt giữa TCP và UDP trong mạng máy tính.',
    'OSI model có bao nhiêu tầng? Mô tả chức năng từng tầng.',
    'Subnet mask là gì? Giải thích CIDR notation.',
    'Firewall hoạt động như thế nào trong network security?',
    'Phân biệt router và switch trong mạng LAN.',
  ],
  cloud: [
    'Phân biệt IaaS, PaaS và SaaS. Cho ví dụ thực tế.',
    'AWS S3 là gì? Khi nào nên dùng S3 thay vì EBS?',
    'Giải thích khái niệm auto-scaling trong cloud computing.',
    'VPC (Virtual Private Cloud) là gì và tại sao cần nó?',
    'Sự khác biệt giữa horizontal scaling và vertical scaling.',
  ],
  security: [
    'SQL Injection là gì? Cách phòng chống?',
    'Phân biệt authentication và authorization.',
    'HTTPS hoạt động như thế nào? TLS handshake là gì?',
    'Zero Trust Security model là gì?',
    'Giải thích CIA Triad trong information security.',
  ],
  default: [
    'DevOps là gì? CI/CD pipeline hoạt động như thế nào?',
    'Giải thích khái niệm containerization và Docker.',
    'Microservices vs Monolithic architecture - ưu nhược điểm?',
    'API RESTful là gì? Các HTTP methods khác nhau như thế nào?',
    'Git branching strategy - GitFlow là gì?',
  ],
};

export class StartInterviewDto {
  @ApiProperty({ example: 'networking' })
  @IsString()
  topic: string;

  @ApiProperty({ example: 'intermediate', required: false })
  @IsOptional()
  @IsString()
  difficulty?: string;
}

export class SubmitAnswerDto {
  @ApiProperty()
  @IsString()
  answer: string;
}

@ApiTags('AI Mock Interview')
@Controller('interview')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MockInterviewController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  @ApiOperation({ summary: 'Danh sách phỏng vấn của user' })
  async getMyInterviews(@CurrentUser() user: JwtPayload) {
    return this.prisma.mockInterview.findMany({
      where: { userId: user.sub },
      include: { turns: { orderBy: { turnIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  @Post('start')
  @ApiOperation({ summary: 'Bắt đầu phỏng vấn mô phỏng AI' })
  async startInterview(@CurrentUser() user: JwtPayload, @Body() dto: StartInterviewDto) {
    const questions = INTERVIEW_QUESTIONS[dto.topic] || INTERVIEW_QUESTIONS.default;
    const interview = await this.prisma.mockInterview.create({
      data: { userId: user.sub, topic: dto.topic, difficulty: dto.difficulty || 'intermediate' },
    });
    // Create first turn
    const turn = await this.prisma.mockInterviewTurn.create({
      data: { interviewId: interview.id, turnIndex: 0, question: questions[0] },
    });
    return { interview, currentQuestion: turn.question, turnIndex: 0, totalQuestions: questions.length };
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Nộp câu trả lời và nhận phản hồi AI' })
  async submitAnswer(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitAnswerDto,
  ) {
    const interview = await this.prisma.mockInterview.findFirst({ where: { id, userId: user.sub }, include: { turns: true } });
    if (!interview) throw new Error('Interview not found');
    const questions = INTERVIEW_QUESTIONS[interview.topic] || INTERVIEW_QUESTIONS.default;
    const currentTurnIndex = interview.turns.length - 1;
    const currentTurn = interview.turns[currentTurnIndex];
    // Simple scoring heuristic
    const wordCount = dto.answer.split(' ').length;
    const score = Math.min(10, Math.max(4, wordCount / 8));
    const feedbacks = [
      `Câu trả lời có ${wordCount} từ. Bạn đề cập đúng ý chính. Điểm mạnh: giải thích rõ ràng. Cần cải thiện: thêm ví dụ thực tế.`,
      `Tốt! Bạn nắm được khái niệm cơ bản. Gợi ý: đi sâu hơn vào use-case thực tế trong môi trường doanh nghiệp.`,
      `Câu trả lời khá đầy đủ. Để hoàn hảo hơn, hãy đề cập đến trade-offs và best practices liên quan.`,
    ];
    const aiFeedback = feedbacks[currentTurnIndex % feedbacks.length];
    await this.prisma.mockInterviewTurn.update({
      where: { id: currentTurn.id },
      data: { userAnswer: dto.answer, aiFeedback, score },
    });
    // Next question or finish
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= questions.length) {
      const avgScore = (interview.turns.reduce((s, t) => s + (t.score || 0), 0) + score) / questions.length;
      await this.prisma.mockInterview.update({
        where: { id },
        data: { status: 'completed', score: avgScore, completedAt: new Date(), feedback: `Điểm trung bình: ${avgScore.toFixed(1)}/10. Tiếp tục luyện tập để cải thiện!` },
      });
      return { done: true, score: avgScore, feedback: `Phỏng vấn hoàn thành! Điểm: ${avgScore.toFixed(1)}/10` };
    }
    const nextTurn = await this.prisma.mockInterviewTurn.create({
      data: { interviewId: id, turnIndex: nextIndex, question: questions[nextIndex] },
    });
    return { done: false, aiFeedback, score, nextQuestion: nextTurn.question, turnIndex: nextIndex, totalQuestions: questions.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết 1 phỏng vấn' })
  async getInterview(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.prisma.mockInterview.findFirst({
      where: { id, userId: user.sub },
      include: { turns: { orderBy: { turnIndex: 'asc' } } },
    });
  }
}
