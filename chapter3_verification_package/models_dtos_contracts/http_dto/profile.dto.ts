import { IsString, IsOptional, MinLength, MaxLength, Matches, IsUrl } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Tên hiển thị phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên hiển thị tối đa 100 ký tự' })
  @Matches(/^[\p{L}\s.'-]+$/u, { message: 'Tên chỉ được chứa chữ cái, dấu cách, dấu chấm và dấu phẩy' })
  displayName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL không hợp lệ' })
  @MaxLength(2048)
  avatarUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio tối đa 500 ký tự' })
  bio?: string

  @ApiPropertyOptional({ example: '+84912345678' })
  @IsOptional()
  @IsString()
  @Matches(/^[+]?[0-9]{9,15}$/, { message: 'Số điện thoại không hợp lệ' })
  phoneNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu hiện tại' })
  currentPassword: string

  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)'
  })
  newPassword: string
}
