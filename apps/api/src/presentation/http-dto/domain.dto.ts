import { Transform } from 'class-transformer'
import { IsBoolean, IsString, Length, Matches, MaxLength } from 'class-validator'
import { PartialType, PickType } from '@nestjs/swagger'

export class CreateDomainDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString() @Length(2, 30) @Matches(/^[A-Z0-9_]+$/)
  code: string

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(2, 100)
  name: string

  @IsString() @MaxLength(500)
  description: string

  @IsBoolean()
  isActive: boolean
}

export class UpdateDomainDto extends PartialType(PickType(CreateDomainDto, ['name', 'description', 'isActive'] as const), { skipNullProperties: false }) {}
