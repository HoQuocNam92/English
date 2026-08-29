import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin@techenglish.pro' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Demo@123456' })
  @IsString()
  @MinLength(6)
  password: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string
}
