import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './presentation/controllers/auth.controller'
import { JwtStrategy } from './infrastructure/jwt.strategy'
import { JwtAuthGuard } from './infrastructure/jwt-auth.guard'
import { PermissionsGuard } from './infrastructure/permissions.guard'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PermissionsGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, PermissionsGuard, AuthService],
})
export class AuthModule {}
