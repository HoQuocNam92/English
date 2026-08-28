import { Module } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './presentation/controllers/roles.controller'

@Module({
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
