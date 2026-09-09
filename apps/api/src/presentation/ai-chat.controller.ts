import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AiChatService } from '../application/ai-chat/ai-chat.service';
import { AiChatMode, GroqService } from '../application/ai-chat/groq.service';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { RagService } from '../application/ai-chat/rag.service';

const MODES = ['qa', 'vocabulary'] as const;

class CreateConversationDto {
  @IsOptional() @IsIn(MODES) mode?: AiChatMode;
  @IsOptional() @IsString() lessonId?: string;
}
class SendMessageDto {
  @IsString() @MinLength(1) @MaxLength(4000) content!: string;
  @IsOptional() @IsIn(MODES) mode?: AiChatMode;
  @IsOptional() @IsIn(['grammar_check', 'translate']) action?: string;
}
class PublicChatDto {
  @IsString() @MinLength(2) @MaxLength(600) content!: string;
}

const publicChatUsage = new Map<string, { count: number; resetsAt: number }>();

@Controller('ai-chat/public')
export class PublicAiChatController {
  constructor(private groq: GroqService, private rag: RagService) {}

  @Post()
  async send(@Request() req: any, @Body() dto: PublicChatDto) {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const usage = publicChatUsage.get(key);
    if (usage && usage.resetsAt > now && usage.count >= 8) {
      throw new HttpException('Bạn đã gửi quá nhiều câu hỏi. Vui lòng thử lại sau ít phút.', HttpStatus.TOO_MANY_REQUESTS);
    }
    publicChatUsage.set(key, usage && usage.resetsAt > now ? { ...usage, count: usage.count + 1 } : { count: 1, resetsAt: now + 10 * 60_000 });
    const retrieved = await this.rag.retrieve(undefined, dto.content.trim(), undefined, 5);
    if (!retrieved.length) return { answer: 'Mình chưa tìm thấy thông tin phù hợp trong kho kiến thức đã được duyệt.', citations: [] };
    const result = await this.groq.chat({
      mode: 'qa',
      input: dto.content.trim(),
      learnerContext: 'Khách đang xem landing page, chưa đăng nhập. Chỉ tư vấn về cách học tiếng Anh CNTT và các tính năng của TechEnglish Pro; không bịa giá, cam kết hoặc dữ liệu cá nhân.',
      history: [],
      knowledgeContext: retrieved.map((item, index) => `[Nguồn ${index + 1}: ${item.source.title}]\n${item.content}`).join('\n\n'),
    });
    return { answer: result.answer, citations: retrieved.map((item, index) => ({ rank: index + 1, sourceType: item.source.sourceType, sourceId: item.source.sourceId, lessonId: item.lessonId, title: item.source.title })) };
  }
}
class SaveVocabularyDto {
  @IsString() @MaxLength(150) term!: string;
  @IsOptional() @IsString() @MaxLength(250) phrase?: string;
  @IsString() @MaxLength(1000) meaningVi!: string;
  @IsOptional() @IsString() pronunciation?: string;
  @IsOptional() @IsString() partOfSpeech?: string;
  @IsOptional() @IsString() level?: string;
  @IsOptional() @IsString() example?: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
}

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private service: AiChatService) {}

  @Post('conversations') create(@Request() req: any, @Body() dto: CreateConversationDto) { return this.service.create(req.user.sub, dto.mode, dto.lessonId); }
  @Get('conversations') list(@Request() req: any) { return this.service.list(req.user.sub); }
  @Get('conversations/:id/messages') messages(@Request() req: any, @Param('id') id: string) { return this.service.messages(id, req.user.sub); }
  @Post('conversations/:id/messages') send(@Request() req: any, @Param('id') id: string, @Body() dto: SendMessageDto) { return this.service.send(id, req.user.sub, dto.content, dto.mode, dto.action); }
  @Post('conversations/:id/quiz') quiz(@Request() req: any, @Param('id') id: string) { return this.service.createQuiz(id, req.user.sub); }
  @Post('saved-vocabulary') save(@Request() req: any, @Body() dto: SaveVocabularyDto) { return this.service.saveVocabulary(req.user.sub, dto); }
  @Get('saved-vocabulary') saved(@Request() req: any) { return this.service.savedVocabulary(req.user.sub); }
  @Post('saved-vocabulary/:id/note') note(@Request() req: any, @Param('id') id: string, @Body() body: { note?: string }) { return this.service.noteVocabulary(id, req.user.sub, body.note || ''); }
  @Post('messages/:id/feedback') feedback(@Request() req: any, @Param('id') id: string, @Body() body: { helpful: boolean; reason?: string }) { return this.service.feedback(id, req.user.sub, body.helpful, body.reason); }
}
