import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsArray,
  IsBoolean, IsUrl, Min, Max, MaxLength, ValidateNested, ArrayNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// ─── Lesson ──────────────────────────────────────────────────────────────────

export class LessonSectionDto {
  @ApiProperty({ enum: ['text', 'code', 'image', 'video', 'vocabulary', 'quiz'] })
  @IsEnum(['text', 'code', 'image', 'video', 'vocabulary', 'quiz'])
  type: string

  @ApiProperty()
  @IsInt() @Min(1)
  order: number

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  title?: string

  @ApiProperty({ description: 'JSON content object for the section' })
  content: Record<string, unknown>
}

export class CreateLessonDto {
  @ApiProperty({ example: 'Understanding REST APIs in Production' })
  @IsString() @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(200, { message: 'Tiêu đề tối đa 200 ký tự' })
  title: string

  @ApiPropertyOptional({ example: 'Tìm hiểu về RESTful APIs và best practices' })
  @IsOptional() @IsString() @MaxLength(500)
  summary?: string

  @ApiPropertyOptional({ enum: ['reading', 'vocabulary', 'mixed', 'scenario'] })
  @IsOptional() @IsEnum(['reading', 'vocabulary', 'mixed', 'scenario'])
  type?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(480)
  estimatedMinutes?: number

  @ApiPropertyOptional({ type: [LessonSectionDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => LessonSectionDto)
  sections?: LessonSectionDto[]

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[]
}

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200)
  title?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  summary?: string

  @ApiPropertyOptional({ enum: ['reading', 'vocabulary', 'mixed', 'scenario'] })
  @IsOptional() @IsEnum(['reading', 'vocabulary', 'mixed', 'scenario'])
  type?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(480)
  estimatedMinutes?: number

  @ApiPropertyOptional({ type: [LessonSectionDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => LessonSectionDto)
  sections?: LessonSectionDto[]

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[]
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export class VocabExampleDto {
  @ApiProperty({ example: 'We use autoscaling to handle peak traffic.' })
  @IsString() @IsNotEmpty()
  sentenceEn: string

  @ApiPropertyOptional({ example: 'Chúng tôi dùng autoscaling để xử lý traffic đỉnh.' })
  @IsOptional() @IsString()
  translationVi?: string

  @ApiProperty()
  @IsInt() @Min(1)
  order: number
}

export class CreateVocabularyDto {
  @ApiProperty({ example: 'autoscaling' })
  @IsString() @IsNotEmpty({ message: 'Từ vựng không được để trống' })
  @MaxLength(100)
  term: string

  @ApiPropertyOptional({ example: '/ˈɔːtəʊˌskeɪlɪŋ/' })
  @IsOptional() @IsString() @MaxLength(100)
  pronunciationIpa?: string

  @ApiPropertyOptional({ example: 'noun', enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'abbreviation'] })
  @IsOptional() @IsEnum(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'abbreviation'])
  partOfSpeech?: string

  @ApiProperty({ example: 'The automatic adjustment of compute resources based on demand.' })
  @IsString() @IsNotEmpty({ message: 'Định nghĩa tiếng Anh không được để trống' })
  @MaxLength(1000)
  definitionEn: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  definitionVi?: string

  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'Vui lòng chọn domain' })
  domainId: string

  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'Vui lòng chọn cấp độ' })
  levelId: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ type: [VocabExampleDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VocabExampleDto)
  examples?: VocabExampleDto[]
}

export class UpdateVocabularyDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(100)
  term?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  pronunciationIpa?: string

  @ApiPropertyOptional({ enum: ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'abbreviation'] })
  @IsOptional() @IsEnum(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'abbreviation'])
  partOfSpeech?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  definitionEn?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  definitionVi?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ type: [VocabExampleDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VocabExampleDto)
  examples?: VocabExampleDto[]
}

// ─── Question ─────────────────────────────────────────────────────────────────

export class QuestionOptionDto {
  @ApiProperty({ example: 'A' })
  @IsString() @IsNotEmpty()
  @MaxLength(10)
  key: string

  @ApiProperty({ example: 'Autoscaling automatically adjusts resources based on demand.' })
  @IsString() @IsNotEmpty({ message: 'Nội dung option không được để trống' })
  @MaxLength(500)
  text: string

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  explanation?: string
}

export class CreateQuestionDto {
  @ApiProperty({ enum: ['multiple_choice', 'true_false', 'fill_blank', 'ordering'] })
  @IsEnum(['multiple_choice', 'true_false', 'fill_blank', 'ordering'], {
    message: 'Loại câu hỏi không hợp lệ',
  })
  type: string

  @ApiProperty({ example: 'What does "autoscaling" mean in cloud computing?' })
  @IsString() @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  @MaxLength(1000)
  prompt: string

  @ApiPropertyOptional({ example: 'Read the following paragraph about AWS...' })
  @IsOptional() @IsString() @MaxLength(2000)
  context?: string

  @ApiPropertyOptional({ example: 'Autoscaling is the process of...' })
  @IsOptional() @IsString() @MaxLength(1000)
  explanation?: string

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(100)
  points?: number

  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'Vui lòng chọn domain' })
  domainId: string

  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'Vui lòng chọn cấp độ' })
  levelId: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  topics?: string[]

  @ApiProperty({ type: [QuestionOptionDto], description: 'Danh sách các đáp án' })
  @IsArray() @ArrayNotEmpty({ message: 'Câu hỏi phải có ít nhất 1 đáp án' })
  @ValidateNested({ each: true }) @Type(() => QuestionOptionDto)
  options: QuestionOptionDto[]
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ enum: ['multiple_choice', 'true_false', 'fill_blank', 'ordering'] })
  @IsOptional() @IsEnum(['multiple_choice', 'true_false', 'fill_blank', 'ordering'])
  type?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(1000)
  prompt?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(2000)
  context?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  explanation?: string

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(100)
  points?: number

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  topics?: string[]

  @ApiPropertyOptional({ type: [QuestionOptionDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[]
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export class ExamQuestionLinkDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  questionId: string

  @ApiProperty()
  @IsInt() @Min(1)
  order: number
}

export class CreateExamDto {
  @ApiProperty({ example: 'Cloud Fundamentals Quiz' })
  @IsString() @IsNotEmpty({ message: 'Tiêu đề bài thi không được để trống' })
  @MaxLength(200)
  title: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  description?: string

  @ApiProperty({ example: 30, description: 'Thời gian làm bài (phút)' })
  @IsInt() @Min(1, { message: 'Thời gian làm bài tối thiểu 1 phút' }) @Max(300)
  durationMinutes: number

  @ApiProperty({ example: 70, description: 'Điểm đạt (%)' })
  @IsInt() @Min(1) @Max(100)
  passingScorePercent: number

  @ApiPropertyOptional({ example: 3, description: 'Số lần làm bài tối đa (null = không giới hạn)' })
  @IsOptional() @IsInt() @Min(1)
  maxAttempts?: number

  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'Vui lòng chọn domain' })
  domainId: string

  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'Vui lòng chọn cấp độ' })
  levelId: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  topics?: string[]

  @ApiPropertyOptional({ type: [ExamQuestionLinkDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ExamQuestionLinkDto)
  questions?: ExamQuestionLinkDto[]
}

export class UpdateExamDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200)
  title?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  description?: string

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(300)
  durationMinutes?: number

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1) @Max(100)
  passingScorePercent?: number

  @ApiPropertyOptional()
  @IsOptional() @IsInt() @Min(1)
  maxAttempts?: number

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  topics?: string[]

  @ApiPropertyOptional({ type: [ExamQuestionLinkDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ExamQuestionLinkDto)
  questions?: ExamQuestionLinkDto[]
}

// ─── Learner Profile ─────────────────────────────────────────────────────────

export class CertGoalDto {
  @ApiProperty()
  @IsString() @IsNotEmpty()
  certificateId: string

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional() @IsString()
  targetDate?: string
}

export class UpdateLearnerProfileDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  bio?: string

  @ApiPropertyOptional({ example: 120, description: 'Phút học mỗi tuần' })
  @IsOptional() @IsInt() @Min(0) @Max(10080)
  weeklyStudyTargetMinutes?: number

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  domainIds?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  careerGoalIds?: string[]

  @ApiPropertyOptional({ type: [CertGoalDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CertGoalDto)
  certGoals?: CertGoalDto[]
}

export class CompleteOnboardingDto {
  @ApiProperty({ description: 'Level code (beginner/intermediate/advanced/professional)' })
  @IsString() @IsNotEmpty()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'professional'])
  levelCode: string

  @ApiProperty({ type: [String], description: 'Mảng domain codes (CLOUD, DEVOPS, ...)' })
  @IsArray() @ArrayNotEmpty({ message: 'Phải chọn ít nhất 1 lĩnh vực CNTT' })
  @IsString({ each: true })
  domainCodes: string[]

  @ApiPropertyOptional({ description: 'Career goal code' })
  @IsOptional() @IsString()
  careerGoalCode?: string

  @ApiPropertyOptional({ description: 'Certificate code mục tiêu' })
  @IsOptional() @IsString()
  certificateCode?: string

  @ApiPropertyOptional({ example: 120 })
  @IsOptional() @IsInt() @Min(30) @Max(10080)
  weeklyStudyTargetMinutes?: number
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export class TrackLessonProgressDto {
  @ApiProperty()
  @IsString() @IsNotEmpty({ message: 'lessonId không được để trống' })
  lessonId: string

  @ApiProperty({ enum: ['started', 'in_progress', 'completed'] })
  @IsEnum(['started', 'in_progress', 'completed'])
  status: string

  @ApiPropertyOptional({ example: 75, description: 'Phần trăm hoàn thành (0-100)' })
  @IsOptional() @IsInt() @Min(0) @Max(100)
  progressPercent?: number

  @ApiPropertyOptional({ example: 1200, description: 'Thời gian học (giây)' })
  @IsOptional() @IsInt() @Min(0)
  timeSpentSeconds?: number
}
