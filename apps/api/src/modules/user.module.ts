import { Module } from '@nestjs/common'
import { UsersService } from '../application/user/user.service'
import { UsersController } from '../presentation/user.controller'

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UserModule {}