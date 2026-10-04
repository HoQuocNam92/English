import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const prisma = new PrismaClient()
type Seed = { code: string; title: string; text: string; explanation: string; prompt: string; options: string[]; answerExplanation: string; trap: string; source: string }

async function main() {
  const items: Seed[] = JSON.parse(readFileSync(join(__dirname, 'data/certification-knowledge-lessons.json'), 'utf8'))
  const certificate = await prisma.certificate.findUnique({ where: { code: 'AWS-CLF-C02' } })
  if (!certificate) throw new Error('Cần có chứng chỉ AWS-CLF-C02 và cấu trúc chủ đề trước khi seed bài học.')
  const [author, level, topics] = await Promise.all([
    prisma.user.findFirst({ where: { status: 'active', userRoles: { some: { role: { code: 'admin' } } } }, select: { id: true } }),
    prisma.level.findFirst({ orderBy: { order: 'asc' } }),
    prisma.certificationTopic.findMany({ where: { certificateId: certificate.id } }),
  ])
  if (!author || !level) throw new Error('Cần có tài khoản admin và trình độ học.')
  let createdLessons = 0, createdExams = 0
  for (const item of items) {
    const topic = topics.find(topic => topic.code === item.code)
    if (!topic) continue
    await prisma.$transaction(async tx => {
      const slug = `aws-clf-c02-knowledge-${item.code.replace('.', '-')}`
      let lesson = await tx.lesson.findUnique({ where: { slug } })
      if (!lesson) {
        lesson = await tx.lesson.create({ data: {
          title: item.title, slug, summary: `Bài học mẫu CLF-C02 ${item.code}: ${topic.name}. Đọc kiến thức, phân tích tình huống và luyện câu hỏi sau bài.`,
          type: 'certification_review', domainId: topic.domainId, levelId: level.id, estimatedMinutes: 12,
          status: 'published', publishedAt: new Date(), createdById: author.id, keyConcepts: [topic.name],
          certificates: { create: { certificateId: certificate.id } },
          sections: { create: [
            { type: 'rich_text', order: 0, title: 'Mục tiêu bài học', content: { text: `Nắm kiến thức của chủ đề ${item.code}: ${topic.name}. Giải thích được lựa chọn trong tình huống thực tế, thay vì chỉ nhận diện từ vựng.` } },
            { type: 'rich_text', order: 1, title: 'Core knowledge', content: { text: item.text } },
            { type: 'rich_text', order: 2, title: 'Giải thích kiến thức', content: { text: item.explanation } },
            { type: 'rich_text', order: 3, title: 'Ví dụ và cách phân tích', content: { text: `${item.prompt}\n\nPhân tích: ${item.answerExplanation}` } },
            { type: 'callout', order: 4, title: 'Điểm dễ nhầm trong đề thi', content: { text: `Nhận định sai: ${item.trap}\nHãy đối chiếu với kiến thức ở trên để tránh chọn đáp án chỉ vì có từ khóa quen thuộc.` } },
            { type: 'rich_text', order: 5, title: 'Nguồn tham khảo', content: { text: 'Bài học mẫu do TechEnglish biên soạn, tham khảo phạm vi CLF-C02 của AWS. Có thể chỉnh sửa nội dung trong trang quản trị.', url: item.source } },
          ] },
        } })
        createdLessons++
      }
      await tx.certificationTopicLesson.upsert({ where: { topicId_lessonId: { topicId: topic.id, lessonId: lesson.id } }, update: {}, create: { topicId: topic.id, lessonId: lesson.id } })
      const title = `CLF-C02 ${item.code} · Luyện tình huống kiến thức`
      const existingExam = await tx.exam.findFirst({ where: { certificateId: certificate.id, title } })
      if (!existingExam) {
        const question = await tx.question.create({ data: {
          type: 'single_choice', prompt: item.prompt, explanation: item.answerExplanation,
          domainId: topic.domainId, levelId: level.id, topics: [item.code], status: 'published', points: 1,
          options: { create: item.options.map((text, index) => ({ key: String.fromCharCode(65 + index), text, isCorrect: index === 0, order: index })) },
        } })
        await tx.certificationTopicQuestion.create({ data: { topicId: topic.id, questionId: question.id } })
        await tx.exam.create({ data: {
          title, description: 'Quiz mẫu kiểm tra vận dụng kiến thức sau bài học. Quản trị viên có thể thêm câu hỏi và chỉnh sửa đề.',
          certificateId: certificate.id, domainId: topic.domainId, levelId: level.id, kind: 'practice', topics: [item.code],
          status: 'published', publishedAt: new Date(), createdById: author.id, durationMinutes: 5, maxAttempts: 100, passingScorePercent: 70,
          questions: { create: { questionId: question.id, order: 0, weight: 1 } },
        } })
        createdExams++
      }
    })
  }
  console.log(JSON.stringify({ certificate: certificate.code, createdLessons, createdExams, seedTopics: items.length }))
}
main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
