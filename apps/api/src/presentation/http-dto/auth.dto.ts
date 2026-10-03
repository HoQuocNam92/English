import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin@techenglish.pro' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string

  @ApiProperty({ example: 'Demo@123456' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string
}

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên tối đa 100 ký tự' })
  displayName: string

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự' })
  password: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string
}

export class AuthChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  currentPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự' })
  newPassword: string
}

export class GoogleMobileDto {
  @ApiProperty({ description: 'Google ID token từ Expo Google Auth' })
  @IsString()
  @IsNotEmpty({ message: 'idToken không được để trống' })
  idToken: string
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'learner1@techenglish.pro' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string
}

export class ValidatePasswordResetDto {
  @ApiProperty()
  @IsString()
  @Matches(/^[a-f0-9]{64}$/, { message: 'Liên kết đặt lại mật khẩu không hợp lệ' })
  token: string
}

export class ResetPasswordDto extends ValidatePasswordResetDto {
  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự' })
  newPassword: string
}
