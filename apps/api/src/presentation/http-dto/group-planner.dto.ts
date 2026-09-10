import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateLearningPlanItemDto {
  @IsString() @MinLength(1) @MaxLength(200)
  title!: string

  @IsOptional() @IsString() @MaxLength(2000)
  note?: string

  @IsDateString()
  plannedAt!: string

  @Type(() => Number) @IsInt() @Min(5) @Max(1440)
  durationMin!: number

  @IsOptional() @IsUUID()
  lessonId?: string
}

export class UpdateLearningPlanItemDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(200)
  title?: string

  @IsOptional() @IsString() @MaxLength(2000)
  note?: string

  @IsOptional() @IsDateString()
  plannedAt?: string

  @IsOptional() @Type(() => Number) @IsInt() @Min(5) @Max(1440)
  durationMin?: number

  @IsOptional() @IsUUID()
  lessonId?: string

  @IsOptional() @IsBoolean()
  isCompleted?: boolean
}
