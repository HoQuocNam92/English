import { Module } from '@nestjs/common';
import { AiChatService } from '../application/ai-chat/ai-chat.service';
import { GroqService } from '../application/ai-chat/groq.service';
import { AiChatController, PublicAiChatController } from '../presentation/ai-chat.controller';

@Module({ controllers: [AiChatController, PublicAiChatController], providers: [AiChatService, GroqService], exports: [GroqService] })
export class AiChatModule {}
