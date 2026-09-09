import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AiChatMode, GroqService } from './groq.service';

@Injectable()
export class AiChatService {
  constructor(private prisma: PrismaService, private groq: GroqService) {}

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

  create(userId: string, mode: AiChatMode = 'qa') {
    return this.prisma.aiConversation.create({ data: { userId, mode } });
  }

  list(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId }, orderBy: { updatedAt: 'desc' }, take: 30,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 }, _count: { select: { messages: true, errors: true } } },
    });
  }

  async messages(id: string, userId: string) {
    await this.ownedConversation(id, userId);
    return this.prisma.aiMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'asc' } });
  }

  async send(id: string, userId: string, input: string, mode?: AiChatMode, action?: string) {
    const conversation = await this.ownedConversation(id, userId);
    const activeMode = mode ?? conversation.mode;
    const recent = await this.prisma.aiMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: 'desc' }, take: 8 });
    const result = await this.groq.chat({
      mode: activeMode, input, action, learnerContext: await this.learnerContext(userId),
      history: recent.reverse().map((message) => ({ role: message.role, content: message.content })),
    });
    const [, assistant] = await this.prisma.$transaction([
      this.prisma.aiMessage.create({ data: { conversationId: id, role: 'user', content: input, metadata: { mode: activeMode, action: action ?? null } } }),
      this.prisma.aiMessage.create({ data: { conversationId: id, role: 'assistant', content: result.answer, metadata: result } }),
      this.prisma.aiConversation.update({ where: { id }, data: { mode: activeMode, title: conversation.title === 'Cuộc trò chuyện mới' ? input.slice(0, 80) : conversation.title } }),
    ]);
    if (result.errors?.length) {
      await this.prisma.aiLearningError.createMany({ data: result.errors.map((item: any) => ({
        conversationId: id, messageId: assistant.id, category: item.category,
        original: item.original, corrected: item.corrected, explanationVi: item.explanationVi,
      })) });
    }
    return { message: assistant, result };
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
