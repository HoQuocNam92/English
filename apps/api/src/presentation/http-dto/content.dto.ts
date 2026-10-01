import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsArray,
  IsBoolean, IsUrl, Min, Max, MaxLength, ValidateNested, ArrayNotEmpty,
  IsUUID, ArrayMaxSize, MinLength, IsDateString, IsNumber,
  IsObject, ArrayUnique, ValidateIf,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'


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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(6) @ArrayUnique()
  @IsEnum(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'abbreviation'], { each: true })
  partsOfSpeech?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayNotEmpty() @ArrayMaxSize(100) @ArrayUnique() @IsUUID('4', { each: true })
  domainIds?: string[]

  @ApiProperty({ example: 'The automatic adjustment of compute resources based on demand.' })
  @IsString() @IsNotEmpty({ message: 'Định nghĩa tiếng Anh không được để trống' })
  @MaxLength(1000)
  definitionEn: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(1000)
  definitionVi?: string

  @ApiProperty()
  @ValidateIf((dto) => dto.domainId !== undefined || dto.domainIds === undefined)
  @IsUUID('4', { message: 'domainId không hợp lệ' })
  domainId: string

  @ApiProperty()
  @IsUUID('4', { message: 'levelId không hợp lệ' })
  levelId: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(50, { each: true })
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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(6) @ArrayUnique()
  @IsEnum(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'abbreviation'], { each: true })
  partsOfSpeech?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayNotEmpty() @ArrayMaxSize(100) @ArrayUnique() @IsUUID('4', { each: true })
  domainIds?: string[]

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

export class BulkUpdateVocabularyStatusDto {
  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  @IsEnum(['draft', 'published', 'archived'])
  status: string

  @ApiPropertyOptional({ type: [String], description: 'Chỉ cập nhật các từ vựng được chọn' })
  @IsOptional() @IsArray() @ArrayNotEmpty() @ArrayMaxSize(3000) @IsUUID('4', { each: true })
  ids?: string[]

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(30)
  domainCode?: string

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional() @IsEnum(['draft', 'published', 'archived'])
  currentStatus?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(100)
  search?: string

  @ApiPropertyOptional({ description: 'Bắt buộc khi cập nhật toàn bộ kho mà không có bộ lọc' })
  @IsOptional() @IsBoolean()
  confirmAll?: boolean
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

const LESSON_TYPES = ['vocabulary', 'terminology', 'technical_reading', 'api_documentation', 'system_design', 'case_study', 'certification_review'] as const
const LESSON_SECTION_TYPES = ['heading', 'rich_text', 'image', 'audio', 'video', 'code', 'vocabulary_list', 'callout', 'quiz'] as const

export class LessonSectionDto {
  @ApiProperty({ enum: LESSON_SECTION_TYPES })
  @IsEnum(LESSON_SECTION_TYPES)
  type: string

  @ApiProperty()
  @IsInt() @Min(0)
  order: number

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  title?: string

  @ApiProperty({ description: 'Nội dung section có cấu trúc theo loại section' })
  @IsObject()
  content: Record<string, unknown>
}

export class CreateLessonDto {
  @ApiProperty()
  @IsString() @IsNotEmpty() @MinLength(5) @MaxLength(200)
  title: string

  @ApiProperty()
  @IsString() @IsNotEmpty() @MaxLength(1000)
  summary: string

  @ApiProperty({ enum: LESSON_TYPES })
  @IsEnum(LESSON_TYPES)
  type: string

  @ApiProperty() @IsUUID('4')
  domainId: string

  @ApiProperty() @IsUUID('4')
  levelId: string

  @ApiProperty({ example: 30 })
  @IsInt() @Min(1) @Max(480)
  estimatedMinutes: number

  @ApiPropertyOptional()
  @IsOptional() @IsUrl() @MaxLength(2048)
  thumbnailUrl?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(80, { each: true })
  keyConcepts?: string[]

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional() @IsEnum(['draft', 'published', 'archived'])
  status?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsUUID('4', { each: true })
  certificateIds?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(200) @IsUUID('4', { each: true })
  vocabularyIds?: string[]

  @ApiPropertyOptional({ type: [LessonSectionDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => LessonSectionDto)
  sections?: LessonSectionDto[]
}

export class UpdateLessonDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(5) @MaxLength(200)
  title?: string
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000)
  summary?: string
  @ApiPropertyOptional({ enum: LESSON_TYPES }) @IsOptional() @IsEnum(LESSON_TYPES)
  type?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID('4')
  domainId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID('4')
  levelId?: string
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(480)
  estimatedMinutes?: number
  @ApiPropertyOptional() @IsOptional() @IsUrl() @MaxLength(2048)
  thumbnailUrl?: string
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(80, { each: true })
  keyConcepts?: string[]
  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] }) @IsOptional() @IsEnum(['draft', 'published', 'archived'])
  status?: string
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(30) @IsUUID('4', { each: true })
  certificateIds?: string[]
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(200) @IsUUID('4', { each: true })
  vocabularyIds?: string[]
  @ApiPropertyOptional({ type: [LessonSectionDto] }) @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => LessonSectionDto)
  sections?: LessonSectionDto[]
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
  @ApiProperty({ enum: ['vocabulary', 'reading', 'technical_understanding', 'scenario_based'] })
  @IsEnum(['vocabulary', 'reading', 'technical_understanding', 'scenario_based'])
  skill: string

  @ApiProperty({ enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario'] })
  @IsEnum(['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario'], {
    message: 'Loại câu hỏi không hợp lệ',
  })
  type: string

  @ApiProperty({ example: 'What does "autoscaling" mean in cloud computing?' })
  @IsString() @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  @MinLength(10, { message: 'Nội dung câu hỏi phải có ít nhất 10 ký tự' })
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

  @ApiPropertyOptional({ type: [String], description: 'Các câu trả lời được chấp nhận cho câu hỏi short_answer' })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(500, { each: true })
  acceptedAnswers?: string[]

  @ApiProperty()
  @IsUUID('4', { message: 'domainId không hợp lệ' })
  domainId: string

  @ApiProperty()
  @IsUUID('4', { message: 'levelId không hợp lệ' })
  levelId: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(50, { each: true })
  topics?: string[]

  @ApiPropertyOptional({ type: [QuestionOptionDto], description: 'Danh sách phương án; không bắt buộc với short_answer' })
  @IsOptional() @IsArray() @ArrayMaxSize(10)
  @ValidateNested({ each: true }) @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsUUID('4', { each: true })
  certificateIds?: string[]
}

export class BulkQuestionItemDto {
  @ApiPropertyOptional({ enum: ['vocabulary', 'reading', 'technical_understanding', 'scenario_based'] })
  @IsOptional() @IsEnum(['vocabulary', 'reading', 'technical_understanding', 'scenario_based'])
  skill?: string

  @ApiProperty({ enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario'] })
  @IsEnum(['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario'], {
    message: 'Loại câu hỏi không hợp lệ',
  })
  type: string

  @ApiProperty({ example: 'What does "autoscaling" mean in cloud computing?' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  @MinLength(10, { message: 'Nội dung câu hỏi phải có ít nhất 10 ký tự' })
  @MaxLength(1000)
  prompt: string

  @ApiPropertyOptional({ example: 'Read the following paragraph about AWS...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  context?: string

  @ApiPropertyOptional({ example: 'Autoscaling is the process of...' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  explanation?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  points?: number

  @ApiPropertyOptional({ type: [String], description: 'Các câu trả lời được chấp nhận cho câu hỏi short_answer' })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(500, { each: true })
  acceptedAnswers?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domainCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domainName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domain?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  levelCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  levelName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string

  @ApiPropertyOptional({ enum: ['published', 'draft', 'archived'] })
  @IsOptional()
  @IsEnum(['published', 'draft', 'archived'])
  status?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[]

  @ApiPropertyOptional({ type: [QuestionOptionDto], description: 'Danh sách phương án; không bắt buộc với short_answer' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[]
}

export class BulkCreateQuestionsDto {
  @ApiProperty({ type: [BulkQuestionItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Danh sách câu hỏi không được để trống' })
  @ValidateNested({ each: true })
  @Type(() => BulkQuestionItemDto)
  questions: BulkQuestionItemDto[]
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({ enum: ['vocabulary', 'reading', 'technical_understanding', 'scenario_based'] })
  @IsOptional() @IsEnum(['vocabulary', 'reading', 'technical_understanding', 'scenario_based'])
  skill?: string

  @ApiPropertyOptional({ enum: ['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario'] })
  @IsOptional() @IsEnum(['single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario'])
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

  @ApiPropertyOptional({ type: [String], description: 'Các câu trả lời được chấp nhận cho câu hỏi short_answer' })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(500, { each: true })
  acceptedAnswers?: string[]

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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsUUID('4', { each: true })
  certificateIds?: string[]
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export class ExamQuestionLinkDto {
  @ApiProperty()
  @IsUUID('4', { message: 'questionId không hợp lệ' })
  questionId: string

  @ApiProperty()
  @IsInt() @Min(1)
  order: number

  @ApiPropertyOptional({ example: 1, description: 'Trọng số nhân với điểm gốc của câu hỏi' })
  @IsOptional() @IsNumber() @Min(0.01) @Max(100)
  weight?: number
}

export class CreateExamDto {
  @ApiPropertyOptional({ enum: ['practice', 'domain_test', 'mock_exam', 'scenario_assessment'] })
  @IsOptional() @IsEnum(['practice', 'domain_test', 'mock_exam', 'scenario_assessment'])
  kind?: string

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

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  shuffleQuestions?: boolean

  @ApiPropertyOptional({ description: 'Thời điểm bắt đầu cho phép làm bài' })
  @IsOptional() @IsDateString()
  availableFrom?: string

  @ApiPropertyOptional({ description: 'Thời điểm kết thúc cho phép làm bài' })
  @IsOptional() @IsDateString()
  availableUntil?: string

  @ApiProperty()
  @IsUUID('4', { message: 'domainId không hợp lệ' })
  domainId: string

  @ApiProperty()
  @IsUUID('4', { message: 'levelId không hợp lệ' })
  levelId: string

  @ApiPropertyOptional()
  @IsOptional() @IsUUID('4')
  certificateId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(50, { each: true })
  topics?: string[]

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional() @IsEnum(['draft', 'published', 'archived'], { message: 'Trạng thái không hợp lệ' })
  status?: string

  @ApiPropertyOptional({ type: [ExamQuestionLinkDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => ExamQuestionLinkDto)
  questions?: ExamQuestionLinkDto[]
}

export class UpdateExamDto {
  @ApiPropertyOptional({ enum: ['practice', 'domain_test', 'mock_exam', 'scenario_assessment'] })
  @IsOptional() @IsEnum(['practice', 'domain_test', 'mock_exam', 'scenario_assessment'])
  kind?: string

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
  @IsOptional() @IsBoolean()
  shuffleQuestions?: boolean

  @ApiPropertyOptional({ description: 'Thời điểm bắt đầu cho phép làm bài' })
  @IsOptional() @IsDateString()
  availableFrom?: string

  @ApiPropertyOptional({ description: 'Thời điểm kết thúc cho phép làm bài' })
  @IsOptional() @IsDateString()
  availableUntil?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  domainId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  levelId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsUUID('4')
  certificateId?: string

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true })
  topics?: string[]

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional() @IsEnum(['draft', 'published', 'archived'], { message: 'Trạng thái không hợp lệ' })
  status?: string

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

  @ApiPropertyOptional({ type: [CertGoalDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CertGoalDto)
  certGoals?: CertGoalDto[]
}

export class CompleteOnboardingDto {
  @ApiPropertyOptional({ enum: ['vocabulary', 'certification', 'both'] })
  @IsOptional() @IsEnum(['vocabulary', 'certification', 'both'])
  learningGoal?: 'vocabulary' | 'certification' | 'both'

  @ApiPropertyOptional({ description: 'Level code (beginner/intermediate/advanced/professional)' })
  @IsOptional()
  @IsString()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'professional'])
  levelCode?: string

  @ApiPropertyOptional({ type: [String], description: 'Mảng domain codes (CLOUD, DEVOPS, ...)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domainCodes?: string[]

  @ApiPropertyOptional({ type: [String], description: 'Mảng certificate codes mục tiêu' })
  @IsOptional() @IsArray() @IsString({ each: true })
  certificateCodes?: string[]

  @ApiPropertyOptional({ type: [String], description: 'Mã mục tiêu nghề nghiệp' })
  @IsOptional() @IsArray() @IsString({ each: true })
  careerGoalCodes?: string[]

  @ApiPropertyOptional({ example: 120 })
  @IsOptional() @IsInt() @Min(30) @Max(10080)
  weeklyStudyTargetMinutes?: number

  @ApiPropertyOptional({ example: 20 })
  @IsOptional() @IsInt() @Min(1) @Max(200)
  dailyVocabularyTarget?: number

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @IsInt() @Min(1) @Max(50)
  weeklyExamTarget?: number

  @ApiPropertyOptional({ example: 30 })
  @IsOptional() @IsInt() @Min(5) @Max(1440)
  dailyStudyTargetMinutes?: number

  @ApiPropertyOptional({ example: '20:00' })
  @IsOptional() @IsString()
  reminderTime?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  reminderEnabled?: boolean

  @ApiPropertyOptional({ enum: ['smart', 'self'] })
  @IsOptional() @IsEnum(['smart', 'self'])
  learningPathMode?: 'smart' | 'self'
}

export class UpdateLearnerGoalsDto {
  @ApiPropertyOptional({ enum: ['vocabulary', 'certification', 'both'] })
  @IsOptional() @IsEnum(['vocabulary', 'certification', 'both'])
  learningGoal?: 'vocabulary' | 'certification' | 'both'

  @ApiPropertyOptional({ description: 'Level code (beginner/intermediate/advanced/professional)' })
  @IsOptional()
  @IsString()
  levelCode?: string

  @ApiPropertyOptional({ type: [String], description: 'Mảng domain codes (CLOUD, DEVOPS, ...)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domainCodes?: string[]

  @ApiPropertyOptional({ type: [String], description: 'Mảng certificate codes mục tiêu' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificateCodes?: string[]

  @ApiPropertyOptional({ type: [String], description: 'Mã mục tiêu nghề nghiệp' })
  @IsOptional() @IsArray() @IsString({ each: true })
  careerGoalCodes?: string[]

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10080)
  weeklyStudyTargetMinutes?: number

  @ApiPropertyOptional({ example: 10, description: 'Số từ vựng mỗi ngày' })
  @IsOptional() @IsInt() @Min(1) @Max(200)
  dailyVocabularyTarget?: number

  @ApiPropertyOptional({ example: 2, description: 'Số bài thi mỗi tuần' })
  @IsOptional() @IsInt() @Min(1) @Max(50)
  weeklyExamTarget?: number

  @ApiPropertyOptional({ example: 30, description: 'Số phút học mỗi ngày' })
  @IsOptional() @IsInt() @Min(5) @Max(1440)
  dailyStudyTargetMinutes?: number

  @ApiPropertyOptional({ example: '20:00' })
  @IsOptional() @IsString()
  reminderTime?: string

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  reminderEnabled?: boolean

  @ApiPropertyOptional({ enum: ['smart', 'self'] })
  @IsOptional() @IsEnum(['smart', 'self'])
  learningPathMode?: 'smart' | 'self'
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export class TrackProgressDto {
  @ApiProperty({ enum: ['lesson', 'domain', 'certificate'] })
  @IsEnum(['lesson', 'domain', 'certificate'], { message: 'resourceType không hợp lệ' })
  resourceType: 'lesson' | 'domain' | 'certificate'

  @ApiProperty()
  @IsUUID('4', { message: 'resourceId không hợp lệ' })
  resourceId: string

  @ApiPropertyOptional({ enum: ['not_started', 'in_progress', 'completed'] })
  @IsOptional() @IsEnum(['not_started', 'in_progress', 'completed'])
  status?: 'not_started' | 'in_progress' | 'completed'

  @ApiPropertyOptional({ example: 75 })
  @IsOptional() @Min(0) @Max(100)
  completionPercent?: number

  @ApiPropertyOptional() @IsOptional() @Min(0) @Max(100)
  averageScorePercent?: number
}

