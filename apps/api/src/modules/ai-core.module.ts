import { Module } from '@nestjs/common';
import { LearningPathAiService } from '../application/learning-path/learning-path-ai.service';

// AI is retained only for the required personalized learning-path feature.
// Conversational tutor, RAG, generated quizzes, feedback and saved chat vocabulary
// are intentionally not registered in the application anymore.
@Module({
  providers: [LearningPathAiService],
  exports: [LearningPathAiService],
})
export class AiCoreModule {}
