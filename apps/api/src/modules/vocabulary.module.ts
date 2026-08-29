import { Module } from '@nestjs/common'
import { VocabularyService } from '../application/vocabulary/vocabulary.service'
import { VocabularyController } from '../presentation/vocabulary.controller'

@Module({
  providers: [VocabularyService],
  controllers: [VocabularyController],
  exports: [VocabularyService],
})
export class VocabularyModule {}