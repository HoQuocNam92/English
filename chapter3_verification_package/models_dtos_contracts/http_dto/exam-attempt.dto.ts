import { IsUUID, IsArray, IsString, IsOptional, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class AnswerDto {
  @IsUUID('4', { message: 'questionId phải là UUID hợp lệ' })
  questionId: string

  @IsArray()
  @IsString({ each: true })
  selectedOptionIds: string[]

  @IsOptional()
  @IsString()
  textAnswer?: string
}

export class SubmitAttemptDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 câu trả lời' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[]
}
