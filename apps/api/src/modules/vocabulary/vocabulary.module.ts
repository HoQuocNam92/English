import { Module } from '@nestjs/common'
import { VocabularyService } from './vocabulary.service'
import { VocabularyController } from './presentation/controllers/vocabulary.controller'

@Module({ providers: [VocabularyService], controllers: [VocabularyController] })
export class VocabularyModule {}
