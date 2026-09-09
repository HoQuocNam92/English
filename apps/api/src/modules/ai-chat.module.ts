import { Module } from '@nestjs/common';
import { AiChatService } from '../application/ai-chat/ai-chat.service';
import { GroqService } from '../application/ai-chat/groq.service';
import { AiChatController, PublicAiChatController } from '../presentation/ai-chat.controller';
import { RagService } from '../application/ai-chat/rag.service';
import { KnowledgeAdminController } from '../presentation/knowledge-admin.controller';
import { EmbeddingService } from '../application/ai-chat/embedding.service';
import { RagVectorStoreService } from '../application/ai-chat/rag-vector-store.service';

@Module({ controllers: [AiChatController, PublicAiChatController, KnowledgeAdminController], providers: [AiChatService, GroqService, EmbeddingService, RagVectorStoreService, RagService], exports: [GroqService, RagService] })
export class AiChatModule {}
