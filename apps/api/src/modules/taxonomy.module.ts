import { Module } from '@nestjs/common'
import { TaxonomyService } from '../application/taxonomy/taxonomy.service'
import { TaxonomyController } from '../presentation/taxonomy.controller'

@Module({
  providers: [TaxonomyService],
  controllers: [TaxonomyController],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
