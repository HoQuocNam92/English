import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const VALID_PLANS = ['pro_monthly', 'pro_quarterly', 'pro_halfyear', 'pro_yearly'];

export class CreateOrderDto {
  @ApiProperty({
    enum: VALID_PLANS,
    example: 'pro_monthly',
    description: 'Gói đăng ký: pro_monthly, pro_quarterly, pro_halfyear hoặc pro_yearly',
  })
  @IsEnum(VALID_PLANS, { message: 'planId phải là pro_monthly, pro_quarterly, pro_halfyear hoặc pro_yearly' })
  planId: string;

  @ApiProperty({
    example: 'WELCOME50K',
    description: 'Mã giảm giá Voucher (tùy chọn)',
    required: false,
  })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

export class ApplyVoucherDto {
  @ApiProperty({ example: 'WELCOME50K', description: 'Mã voucher' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'pro_yearly', description: 'Mã gói PRO' })
  @IsString()
  planId: string;
}
