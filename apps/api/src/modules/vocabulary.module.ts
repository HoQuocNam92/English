import { SelectionTranslationService } from '../application/vocabulary/selection-translation.service'
import { TranslationController } from '../presentation/translation.controller'
import { Module } from '@nestjs/common'
import { VocabularyService } from '../application/vocabulary/vocabulary.service'
import { VocabularyController } from '../presentation/vocabulary.controller'

@Module({
  providers: [VocabularyService, SelectionTranslationService],
  controllers: [VocabularyController, TranslationController],
  exports: [VocabularyService],
})
export class VocabularyModule {}