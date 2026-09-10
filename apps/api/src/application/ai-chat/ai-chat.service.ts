import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AiChatMode, GroqService } from './groq.service';
import { RagService } from './rag.service';

@Injectable()
export class AiChatService {
  constructor(private prisma: PrismaService, private groq: GroqService, private rag: RagService, private config: ConfigService) {}

  private async ownedConversation(id: string, userId: string) {
    const conversation = await this.prisma.aiConversation.findFirst({ where: { id, userId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  private async learnerContext(userId: string) {
    const profile = await this.prisma.learnerProfile.findUnique({
      where: { userId }, include: { level: true, domains: { include: { domain: true } }, careerGoals: { include: { careerGoal: true } } },
    });
    if (!profile) return 'Chưa có hồ sơ học tập.';
    return `Trình độ ${profile.level.name}; lĩnh vực ${profile.domains.map((item) => item.domain.name).join(', ') || 'chưa chọn'}; mục tiêu ${profile.careerGoals.map((item) => item.careerGoal.name).join(', ') || 'chưa chọn'}.`;
  }

  create(userId: string, mode: AiChatMode = 'qa', lessonId?: string) {
    return this.prisma.aiConversation.create({ data: { userId, mode, lessonId } });
  }

  list(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId }, orderBy: { updatedAt: 'desc' }, take: 30,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 }, _count: { select: { messages: true, errors: true } } },
    });
  }

  async messages(id: string, userId: string) {
    await this.ownedConversation(id, userId);
    return this.prisma.aiMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' }, include: { citations: { include: { chunk: { include: { source: true } } }, orderBy: { rank: 'asc' } }, feedback: { where: { userId } } } });
  }

  async send(id: string, userId: string, input: string, mode?: AiChatMode, action?: string) {
    const conversation = await this.ownedConversation(id, userId);
    const usageDate = new Date(); usageDate.setHours(0, 0, 0, 0);
    const usage = await this.prisma.aiUsageDaily.findUnique({ where: { userId_usageDate: { userId, usageDate } } });
    const dailyLimit = Number(this.config.get('AI_DAILY_MESSAGE_LIMIT', 30));
    if ((usage?.requestCount ?? 0) >= dailyLimit) throw new HttpException('Bạn đã dùng hết lượt hỏi AI hôm nay.', HttpStatus.TOO_MANY_REQUESTS);
    const activeMode = mode ?? conversation.mode;
    const recent = await this.prisma.aiMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'desc' }, take: 8 });
    const retrieved = await this.rag.retrieve(userId, input, conversation.lessonId ?? undefined);
    if (!retrieved.length) {
      const [, assistant] = await this.prisma.$transaction([
        this.prisma.aiMessage.create({ data: { conversationId: id, role: 'user', content: input } }),
        this.prisma.aiMessage.create({ data: { conversationId: id, role: 'assistant', content: 'Câu hỏi này nằm ngoài phạm vi học liệu tiếng Anh CNTT hiện có, hoặc chưa có nguồn đủ tin cậy để trả lời. Bạn hãy hỏi về bài học, thuật ngữ hay tình huống giao tiếp IT; nếu đang hỏi về sức khỏe, hãy liên hệ người có chuyên môn phù hợp.', metadata: { grounded: true, insufficientEvidence: true } } }),
      ]);
      return { message: assistant, result: { answer: assistant.content, citations: [] } };
    }
    const knowledgeContext = retrieved.map((item, index) => `[Nguồn ${index + 1}: ${item.source.title}]\n${item.content}`).join('\n\n');
    const result = await this.groq.chat({
      mode: activeMode, input, action, learnerContext: await this.learnerContext(userId),
      history: recent.reverse().map((message) => ({ role: message.role, content: message.content })),
      knowledgeContext,
    });
    const [, assistant] = await this.prisma.$transaction([
      this.prisma.aiMessage.create({ data: { conversationId: id, role: 'user', content: input, metadata: { mode: activeMode, action: action ?? null } } }),
      this.prisma.aiMessage.create({ data: { conversationId: id, role: 'assistant', content: result.answer, metadata: result } }),
      this.prisma.aiConversation.update({ where: { id }, data: { mode: activeMode, title: conversation.title === 'Cuộc trò chuyện mới' ? input.slice(0, 80) : conversation.title } }),
    ]);
    await this.prisma.$transaction([
      this.prisma.aiMessageCitation.createMany({ data: retrieved.map((item, index) => ({ messageId: assistant.id, chunkId: item.id, rank: index + 1, score: item.score })) }),
      this.prisma.aiUsageDaily.upsert({ where: { userId_usageDate: { userId, usageDate } }, create: { userId, usageDate, requestCount: 1, inputTokens: Math.ceil((input.length + knowledgeContext.length) / 4), outputTokens: Math.ceil(result.answer.length / 4) }, update: { requestCount: { increment: 1 }, inputTokens: { increment: Math.ceil((input.length + knowledgeContext.length) / 4) }, outputTokens: { increment: Math.ceil(result.answer.length / 4) } } }),
    ]);
    if (result.errors?.length) {
      await this.prisma.aiLearningError.createMany({ data: result.errors.map((item: any) => ({
        conversationId: id, messageId: assistant.id, category: item.category,
        original: item.original, corrected: item.corrected, explanationVi: item.explanationVi,
      })) });
    }
    return { message: assistant, result: { ...result, citations: retrieved.map((item, index) => ({ rank: index + 1, score: item.score, sourceType: item.source.sourceType, sourceId: item.source.sourceId, lessonId: item.lessonId, title: item.source.title, excerpt: item.content.slice(0, 240) })) } };
  }

  async feedback(messageId: string, userId: string, helpful: boolean, reason?: string) {
    const message = await this.prisma.aiMessage.findFirst({ where: { id: messageId, conversation: { userId }, role: 'assistant' } });
    if (!message) throw new NotFoundException('AI message not found');
    return this.prisma.aiFeedback.upsert({ where: { messageId_userId: { messageId, userId } }, create: { messageId, userId, helpful, reason }, update: { helpful, reason } });
  }

  async createQuiz(id: string, userId: string) {
    await this.ownedConversation(id, userId);
    const [errors, history] = await Promise.all([
      this.prisma.aiLearningError.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.aiMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'desc' }, take: 12 }),
    ]);
    const quiz = await this.groq.quiz({ learnerContext: await this.learnerContext(userId), errors, history: history.reverse().map((message) => ({ role: message.role, content: message.content })) });
    const message = await this.prisma.aiMessage.create({ data: { conversationId: id, role: 'assistant', content: quiz.title, metadata: { type: 'quiz', quiz } } });
    return { messageId: message.id, ...quiz };
  }

  saveVocabulary(userId: string, dto: any) {
    return this.prisma.aiSavedVocabulary.upsert({
      where: { userId_term_phrase: { userId, term: dto.term, phrase: dto.phrase ?? null } },
      create: { userId, term: dto.term, phrase: dto.phrase, meaningVi: dto.meaningVi, pronunciation: dto.pronunciation, partOfSpeech: dto.partOfSpeech, level: dto.level, example: dto.example, note: dto.note },
      update: { meaningVi: dto.meaningVi, pronunciation: dto.pronunciation, partOfSpeech: dto.partOfSpeech, level: dto.level, example: dto.example, ...(dto.note !== undefined ? { note: dto.note } : {}) },
    });
  }

  savedVocabulary(userId: string) {
    return this.prisma.aiSavedVocabulary.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async noteVocabulary(id: string, userId: string, note: string) {
    const result = await this.prisma.aiSavedVocabulary.updateMany({ where: { id, userId }, data: { note } });
    if (!result.count) throw new NotFoundException('Saved vocabulary not found');
    return this.prisma.aiSavedVocabulary.findUnique({ where: { id } });
  }
}
