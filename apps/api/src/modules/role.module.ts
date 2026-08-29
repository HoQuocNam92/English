import { Module } from '@nestjs/common'
import { RolesService } from '../application/role/role.service'
import { RolesController } from '../presentation/role.controller'

@Module({
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RoleModule {}