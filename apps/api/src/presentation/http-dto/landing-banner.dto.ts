import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsHexColor, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class CreateLandingBannerDto {
  @IsIn(['hero', 'footer', 'free_feature', 'difference']) placement!: 'hero' | 'footer' | 'free_feature' | 'difference';
  @IsOptional() @IsIn(['image_only', 'background_text']) displayMode?: 'image_only' | 'background_text';
  @IsOptional() @IsString() @MaxLength(100) eyebrow?: string;
  @ValidateIf((dto) => dto.displayMode !== 'image_only') @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(80) ctaLabel?: string;
  @IsOptional() @Matches(/^(\/|https?:\/\/)/, { message: 'ctaUrl phải bắt đầu bằng /, http:// hoặc https://' }) @MaxLength(1000) ctaUrl?: string;
  @IsOptional() @IsHexColor() accentColor?: string;
  @IsOptional() @IsHexColor() backgroundColor?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true }) @MaxLength(180, { each: true }) bulletPoints?: string[];
  @IsOptional() @IsNumber() @Min(0) @Max(92) textX?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(88) textY?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(92) textWidth?: number;
  @IsOptional() @IsIn(['left', 'center', 'right']) textAlign?: 'left' | 'center' | 'right';
  @IsOptional() @IsHexColor() titleColor?: string;
  @IsOptional() @IsInt() @Min(20) @Max(96) titleSize?: number;
  @IsOptional() @IsInt() @Min(0) @Max(999) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
}

export class UpdateLandingBannerDto {
  @IsOptional() @IsIn(['hero', 'footer', 'free_feature', 'difference']) placement?: 'hero' | 'footer' | 'free_feature' | 'difference';
  @IsOptional() @IsIn(['image_only', 'background_text']) displayMode?: 'image_only' | 'background_text';
  @IsOptional() @IsString() @MaxLength(100) eyebrow?: string;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(80) ctaLabel?: string;
  @IsOptional() @Matches(/^(\/|https?:\/\/)/, { message: 'ctaUrl phải bắt đầu bằng /, http:// hoặc https://' }) @MaxLength(1000) ctaUrl?: string;
  @IsOptional() @IsHexColor() accentColor?: string;
  @IsOptional() @IsHexColor() backgroundColor?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true }) @MaxLength(180, { each: true }) bulletPoints?: string[];
  @IsOptional() @IsNumber() @Min(0) @Max(92) textX?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(88) textY?: number;
  @IsOptional() @IsNumber() @Min(20) @Max(92) textWidth?: number;
  @IsOptional() @IsIn(['left', 'center', 'right']) textAlign?: 'left' | 'center' | 'right';
  @IsOptional() @IsHexColor() titleColor?: string;
  @IsOptional() @IsInt() @Min(20) @Max(96) titleSize?: number;
  @IsOptional() @IsInt() @Min(0) @Max(999) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
}
