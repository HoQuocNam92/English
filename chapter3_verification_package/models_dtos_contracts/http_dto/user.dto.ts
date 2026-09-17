import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' }) @IsEmail() email: string
  @ApiProperty({ example: 'Password123!' }) @IsString() @MinLength(8) password: string
  @ApiProperty({ example: 'Nguyen Van A' }) @IsString() displayName: string
  @ApiPropertyOptional({ example: 'learner', enum: ['admin','teacher','learner'] }) @IsOptional() @IsString() roleCode?: string
  @ApiPropertyOptional() @IsOptional() @IsString() phoneNumber?: string
  @ApiPropertyOptional() @IsOptional() @IsString() bio?: string
  @ApiPropertyOptional() @IsOptional() @IsString() locale?: string
  @ApiPropertyOptional() @IsOptional() @IsString() timezone?: string
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string
  @ApiPropertyOptional() @IsOptional() @IsString() avatarUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsString() bio?: string
  @ApiPropertyOptional() @IsOptional() @IsString() phoneNumber?: string
  @ApiPropertyOptional() @IsOptional() @IsString() locale?: string
  @ApiPropertyOptional() @IsOptional() @IsString() timezone?: string
  @ApiPropertyOptional({ enum: ['active','inactive','suspended'] }) @IsOptional() @IsEnum(['active','inactive','suspended']) status?: string
}

export class UserQueryDto {
  @ApiPropertyOptional() @IsOptional() page?: number
  @ApiPropertyOptional() @IsOptional() limit?: number
  @ApiPropertyOptional() @IsOptional() search?: string
  @ApiPropertyOptional() @IsOptional() role?: string
  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended'] }) @IsOptional() @IsString() status?: string
}
