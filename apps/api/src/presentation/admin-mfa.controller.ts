import { Body, Controller, Get, Post, UseGuards, Header } from '@nestjs/common'
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { AdminMfaService } from '../application/auth/admin-mfa.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

class MfaCodeDto {
  @IsString() @MinLength(6) @MaxLength(40)
  code: string
  @IsOptional() @IsBoolean()
  recover?: boolean
}

@Controller('auth/mfa')
@UseGuards(JwtAuthGuard)
export class AdminMfaController {
  constructor(private mfa: AdminMfaService) {}
  @Get('status') @Header('Cache-Control', 'no-store')
  status(@CurrentUser() user: JwtPayload) { return this.mfa.status(user) }
  @Post('setup') @Header('Cache-Control', 'no-store')
  setup(@CurrentUser() user: JwtPayload) { return this.mfa.setup(user) }
  @Post('verify') @Header('Cache-Control', 'no-store')
  verify(@CurrentUser() user: JwtPayload, @Body() dto: MfaCodeDto) { return this.mfa.verify(user, dto.code, dto.recover === true) }
  @Post('reconfigure') @Header('Cache-Control', 'no-store')
  reconfigure(@CurrentUser() user: JwtPayload, @Body() dto: MfaCodeDto) { return this.mfa.reconfigure(user, dto.code) }
}
