import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { LoginDto, RegisterDto, RefreshTokenDto, AuthChangePasswordDto, GoogleMobileDto, ForgotPasswordDto, ResetPasswordDto } from './http-dto/auth.dto'
import { AuthService } from '../application/auth/auth.service'
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard'
import { CurrentUser, JwtPayload } from './decorators/current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiOperation({ summary: 'Yêu cầu gửi OTP quên mật khẩu qua Email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng mã OTP' })
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
