import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Res } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LoginDto, RegisterDto, RefreshTokenDto, AuthChangePasswordDto, GoogleMobileDto, ForgotPasswordDto, ResetPasswordDto, ValidatePasswordResetDto } from './http-dto/auth.dto'
import { AuthService } from '../application/auth/auth.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {}

  private resolveWebUrl() {
    const configuredWebUrl = this.config.get<string>('WEB_URL')?.trim().replace(/\/$/, '')
    const isProduction = this.config.get<string>('NODE_ENV', 'development') === 'production'
    if (!isProduction) {
      if (!configuredWebUrl) throw new Error('WEB_URL is required')
      return configuredWebUrl
    }

    const productionCandidates = [
      configuredWebUrl,
      ...String(this.config.get<string>('CORS_ORIGIN') ?? '').split(',').map((origin) => origin.trim().replace(/\/$/, '')),
    ].filter(Boolean) as string[]

    const productionWebUrl = productionCandidates.find((candidate) => {
      try {
        const url = new URL(candidate)
        return url.protocol === 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1'
      } catch {
        return false
      }
    })
    if (!productionWebUrl) throw new Error('Production WEB_URL must be a public HTTPS URL')
    return productionWebUrl
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Bắt đầu Google Login trên web' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback trên web' })
  googleCallback(@Request() req: any, @Res() response: Response) {
    const webUrl = this.resolveWebUrl()
    const params = new URLSearchParams({ access_token: req.user.accessToken, refresh_token: req.user.refreshToken, user: JSON.stringify(req.user.user) })
    return response.redirect(`${webUrl}/google/callback?${params.toString()}`)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login bằng email/password (admin & giảng viên)' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản learner mới (mobile)' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi liên kết đặt lại mật khẩu qua email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('validate-password-reset')
  @HttpCode(HttpStatus.OK)
  validatePasswordReset(@Body() dto: ValidatePasswordResetDto) {
    return this.authService.validatePasswordReset(dto)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token dùng một lần' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout - revoke refresh token' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change password' })
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: AuthChangePasswordDto) {
    return this.authService.changePassword(user.sub, dto)
  }

  // ─── Mobile only ──────────────────────────────────────────────────────────
  // Expo app gửi Google ID token lên, server verify với Google API và trả JWT
  @Post('google/mobile')
  @ApiOperation({ summary: 'Mobile Google Login - Expo app gửi Google ID token' })
  googleMobileAuth(@Body() dto: GoogleMobileDto) {
    return this.authService.verifyGoogleIdToken(dto.idToken)
  }
}
