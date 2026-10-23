import { PartialType } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator'

export class CreateCertificateDto {
  @IsString() @IsNotEmpty() @MaxLength(40)
  code: string

  @IsString() @IsNotEmpty() @MaxLength(150)
  name: string

  @IsString() @IsNotEmpty() @MaxLength(100)
  provider: string

  @IsString() @IsNotEmpty() @MaxLength(1000)
  description: string

  @IsOptional() @IsString() @MaxLength(50)
  category?: string | null

  @IsOptional() @IsInt() @Min(1)
  examDurationMinutes?: number | null

  @IsOptional() @IsInt() @Min(1)
  examQuestionCount?: number | null

  @IsOptional() @IsInt() @Min(0)
  passingScaledScore?: number | null

  @IsOptional() @IsUrl() @MaxLength(2048)
  examUrl?: string | null

  @IsOptional() @IsBoolean()
  isActive?: boolean
}

export class UpdateCertificateDto extends PartialType(CreateCertificateDto) {}
