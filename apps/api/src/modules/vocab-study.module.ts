import { Module } from '@nestjs/common'
import { VocabStudyService } from '../application/vocab-study/vocab-study.service'
import { VocabStudyController } from '../presentation/vocab-study.controller'
import { PrismaModule } from '../infrastructure/database/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [VocabStudyController],
  providers: [VocabStudyService],
  exports: [VocabStudyService],
})
export class VocabStudyModule {}
