import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class RegisterPushSubscriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Token thông báo không được để trống' })
  @MaxLength(4096)
  token: string

  @IsEnum(['web', 'android', 'ios'], { message: 'Nền tảng thông báo không hợp lệ' })
  platform: 'web' | 'android' | 'ios'
}

export class RemovePushSubscriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Token thông báo không được để trống' })
  token: string
}
