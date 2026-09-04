import {
  IsString, IsEnum, IsInt, IsOptional, IsBoolean,
  IsISO8601, IsPositive, Min, Max, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateVoucherDto {
  @ApiProperty({ example: 'SUMMER30', description: 'Mã voucher (viết hoa, không dấu, ≤50 ký tự)' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Giảm 30% mùa hè', description: 'Tên hiển thị của voucher' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @ApiProperty({ enum: ['percentage', 'fixed'], example: 'percentage', description: 'Loại giảm giá' })
  @IsEnum(['percentage', 'fixed'])
  discountType: 'percentage' | 'fixed';

  @ApiProperty({ example: 30, description: 'Giá trị giảm: % (1-100) hoặc VNĐ (fixed)' })
  @IsInt()
  @IsPositive()
  discountValue: number;

  @ApiPropertyOptional({ example: 99000, description: 'Giá trị đơn hàng tối thiểu (VNĐ)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 200000, description: 'Số tiền giảm tối đa (chỉ áp dụng khi discountType=percentage)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: 100, description: 'Giới hạn số lần dùng (null = không giới hạn)' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number;

  @ApiProperty({ example: '2026-09-01T00:00:00Z', description: 'Ngày bắt đầu (ISO 8601)' })
  @IsISO8601()
  startDate: string;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', description: 'Ngày kết thúc (ISO 8601)' })
  @IsISO8601()
  endDate: string;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái kích hoạt' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}

// ─── Flash Sale DTOs ──────────────────────────────────────────────────────────

const VALID_PLANS = ['pro_monthly', 'pro_quarterly', 'pro_halfyear', 'pro_yearly'];

export class CreateFlashSaleDto {
  @ApiProperty({ example: 'Flash Sale Tháng 9', description: 'Tiêu đề chương trình' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Ưu đãi đặc biệt chỉ trong 24h', description: 'Mô tả ngắn' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: VALID_PLANS, example: 'pro_yearly', description: 'Gói PRO áp dụng' })
  @IsEnum(VALID_PLANS)
  planId: string;

  @ApiProperty({ example: 40, description: 'Phần trăm giảm giá (1-99)' })
  @IsInt()
  @Min(1)
  @Max(99)
  discountPercent: number;

  @ApiProperty({ example: '2026-09-10T00:00:00Z', description: 'Thời điểm bắt đầu (ISO 8601)' })
  @IsISO8601()
  startTime: string;

  @ApiProperty({ example: '2026-09-10T23:59:59Z', description: 'Thời điểm kết thúc (ISO 8601)' })
  @IsISO8601()
  endTime: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFlashSaleDto extends PartialType(CreateFlashSaleDto) {}
