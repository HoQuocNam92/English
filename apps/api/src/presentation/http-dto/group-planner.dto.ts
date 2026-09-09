import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateStudentGroupDto {
  @IsString() @MinLength(2) @MaxLength(150)
  name!: string

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string

  @IsUUID()
  domainId!: string

  @IsUUID()
  certificateId!: string

  @IsOptional() @IsUUID()
  teacherId?: string

  @IsOptional() @IsDateString()
  startsAt?: string

  @IsOptional() @IsDateString()
  endsAt?: string
}

export class UpdateStudentGroupDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(150)
  name?: string

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string

  @IsOptional() @IsUUID()
  domainId?: string

  @IsOptional() @IsUUID()
  certificateId?: string

  @IsOptional() @IsUUID()
  teacherId?: string

  @IsOptional() @IsIn(['active', 'completed', 'archived'])
  status?: 'active' | 'completed' | 'archived'

  @IsOptional() @IsDateString()
  startsAt?: string

  @IsOptional() @IsDateString()
  endsAt?: string
}

export class AddGroupMemberDto {
  @IsUUID()
  learnerId!: string
}

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
