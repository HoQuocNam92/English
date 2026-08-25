# 03 — Domain Model (implementation proposal)

> Đây là mapping kỹ thuật đề xuất, không phải nội dung bắt buộc nguyên văn của đề cương. Điều chỉnh theo codebase sau khi review.

## Core entities
User, Role/Permission, LearnerProfile, ItDomain, LearningLevel, CareerGoal, Certificate, LearnerInterest, LearnerCertificateGoal, Vocabulary, Lesson, LessonSection/Content, Question, QuestionOption, Exam, ExamQuestion, ExamAttempt, AttemptAnswer, LearningProgress, Recommendation.

## Core relationships
- User 1—0/1 LearnerProfile.
- LearnerProfile N—N ItDomain.
- LearnerProfile N—N Certificate goal.
- Lesson/Vocabulary/Question → ItDomain + LearningLevel.
- Question có thể gắn nhiều certificate/topic.
- Exam N—N Question qua ExamQuestion để giữ order/weight.
- User 1—N ExamAttempt.
- ExamAttempt 1—N AttemptAnswer.
- User 1—N LearningProgress.

## Historical integrity
ExamAttempt/AttemptAnswer phải giữ snapshot hoặc reference đủ để giải thích kết quả cũ ngay cả khi content được chỉnh sửa về sau.
