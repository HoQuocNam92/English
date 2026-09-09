import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type AiChatMode = 'qa' | 'correction' | 'it_conversation' | 'vocabulary';

const RESPONSE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    answer: { type: 'string' },
    correctedText: { type: ['string', 'null'] },
    translationVi: { type: ['string', 'null'] },
    errors: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      category: { type: 'string' }, original: { type: 'string' }, corrected: { type: 'string' }, explanationVi: { type: 'string' },
    }, required: ['category', 'original', 'corrected', 'explanationVi'] } },
    vocabulary: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      term: { type: 'string' }, phrase: { type: ['string', 'null'] }, meaningVi: { type: 'string' }, pronunciation: { type: ['string', 'null'] },
      partOfSpeech: { type: ['string', 'null'] }, level: { type: ['string', 'null'] }, example: { type: ['string', 'null'] }, collocations: { type: 'array', items: { type: 'string' } },
    }, required: ['term', 'phrase', 'meaningVi', 'pronunciation', 'partOfSpeech', 'level', 'example', 'collocations'] } },
    suggestedActions: { type: 'array', items: { type: 'string' } },
  },
  required: ['answer', 'correctedText', 'translationVi', 'errors', 'vocabulary', 'suggestedActions'],
};

const QUIZ_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    title: { type: 'string' },
    basedOn: { type: 'array', items: { type: 'string' } },
    questions: { type: 'array', minItems: 5, maxItems: 5, items: {
      type: 'object', additionalProperties: false,
      properties: {
        id: { type: 'string' }, question: { type: 'string' }, options: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
        correctIndex: { type: 'integer', minimum: 0, maximum: 3 }, explanationVi: { type: 'string' }, skill: { type: 'string' },
      }, required: ['id', 'question', 'options', 'correctIndex', 'explanationVi', 'skill'],
    } },
  }, required: ['title', 'basedOn', 'questions'],
};

const PATH_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    estimatedWeeks: { type: 'integer' },
    overview: { type: 'string' },
    studyTips: { type: 'array', items: { type: 'string' } },
    weeklyPlan: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          week: { type: 'integer' },
          theme: { type: 'string' },
          lessons: {
            type: 'array',
            items: {
              type: 'object', additionalProperties: false,
              properties: {
                lessonId: { type: 'string' },
                title: { type: 'string' },
                reason: { type: 'string' },
                priority: { type: 'string' },
              },
              required: ['lessonId', 'title', 'reason', 'priority'],
            },
          },
        },
        required: ['week', 'theme', 'lessons'],
      },
    },
  },
  required: ['estimatedWeeks', 'overview', 'studyTips', 'weeklyPlan'],
};

@Injectable()
export class GroqService {
  constructor(private config: ConfigService) {}

  private async complete(messages: Array<{ role: string; content: string }>, schemaName: string, schema: object, maxTokens = 1800) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey) throw new ServiceUnavailableException('GROQ_API_KEY chưa được cấu hình ở backend.');
    const model = this.config.get<string>('GROQ_MODEL', 'openai/gpt-oss-20b');
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model, messages, temperature: 0.2, max_completion_tokens: maxTokens,
            response_format: { type: 'json_schema', json_schema: { name: schemaName, strict: true, schema } },
          },
          { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 },
        );
        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) throw new Error('Groq returned an empty response');
        return JSON.parse(content);
      } catch (error: any) {
        const isRateLimit = error?.response?.status === 429;
        const failedGeneration = error?.response?.data?.error?.failed_generation;
        if (typeof failedGeneration === 'string') {
          try {
            const parsed = JSON.parse(failedGeneration);
            if (parsed && typeof parsed === 'object' && (schemaName === 'conversation_quiz'
              ? Array.isArray(parsed.questions) && parsed.questions.length === 5
              : schemaName === 'learning_path_plan'
                ? Array.isArray(parsed.weeklyPlan)
                : typeof parsed.answer === 'string' && Array.isArray(parsed.errors) && Array.isArray(parsed.vocabulary))) return parsed;
          } catch {
            // The provider sometimes returns a truncated JSON draft; retry below.
          }
        }
        if (isRateLimit && attempt < 2) {
          const retryAfter = Number(error.response?.headers?.['retry-after']);
          const delayMs = Number.isFinite(retryAfter) ? Math.min(12000, Math.max(1000, retryAfter * 1000)) : 7000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        if (failedGeneration && attempt < 2) continue;
        const detail = error?.response?.data?.error?.message || error?.message || 'Unknown Groq error';
        throw new BadGatewayException(`Không thể nhận phản hồi từ Groq: ${detail}`);
      }
    }
  }

  async chat(params: {
    mode: AiChatMode; input: string; action?: string; learnerContext: string;
    history: Array<{ role: string; content: string }>;
  }) {
    const modeGuide: Record<AiChatMode, string> = {
      qa: 'Giải thích bằng tiếng Việt dễ hiểu, cho ví dụ tiếng Anh ngành IT và kết thúc bằng một bài tập ngắn.',
      correction: 'Sửa câu tiếng Anh, chỉ rõ từng lỗi bằng tiếng Việt và cung cấp phiên bản tự nhiên hơn.',
      it_conversation: 'Đóng vai đồng nghiệp hoặc nhà tuyển dụng IT. Trò chuyện chủ yếy bằng tiếng Anh, sửa lỗi ngắn gọn rồi hỏi tiếp một câu.',
      vocabulary: 'Giải thích từ theo cụm/collocation. Trả IPA, loại từ, CEFR A2/B1/B2/C1, nghĩa Việt, ví dụ IT và các từ thường đi cùng.',
    };
    const actionGuide = params.action === 'translate'
      ? 'Hãy dịch chính xác nội dung sang tiếng Việt và điền translationVi.'
      : params.action === 'grammar_check'
        ? 'Hãy kiểm tra ngữ pháp kỹ, điền correctedText và errors.' : '';
    const system = `Bạn là AI English Coach chuyên tiếng Anh CNTT cho người Việt. ${modeGuide[params.mode]} ${actionGuide}
Thông tin người học: ${params.learnerContext}
Không bịa dữ liệu cá nhân. Nếu không chắc một phiên âm hoặc nghĩa chuyên ngành, nói rõ trong answer. Chỉ điền vocabulary khi chế độ là vocabulary hoặc câu hỏi trực tiếp về từ vựng; các chế độ khác trả mảng vocabulary rỗng. Trả lời súc tích dưới 500 từ. Luôn trả đúng JSON schema; answer là nội dung chính có thể hiển thị trực tiếp.`;
    return this.complete([{ role: 'system', content: system }, ...params.history, { role: 'user', content: params.input }], 'english_coach_response', RESPONSE_SCHEMA);
  }

  async quiz(params: { learnerContext: string; errors: any[]; history: Array<{ role: string; content: string }> }) {
    const evidence = params.errors.length
      ? params.errors.map((item) => `${item.category}: ${item.original} -> ${item.corrected} (${item.explanationVi})`).join('\n')
      : params.history.slice(-8).map((item) => `${item.role}: ${item.content}`).join('\n');
    return this.complete([
      { role: 'system', content: `Bạn tạo đúng 5 câu trắc nghiệm tiếng Anh cho người Việt học IT. Câu hỏi phải dựa trên lỗi hoặc nội dung thật trong cuộc trò chuyện, không dùng kiến thức ngoài phạm vi. Mỗi câu có đúng 4 lựa chọn và một đáp án. Thông tin người học: ${params.learnerContext}` },
      { role: 'user', content: `Tạo quiz từ bằng chứng sau:\n${evidence || 'Chưa có lỗi; tạo bài kiểm tra ngắn từ chủ đề gần nhất.'}` },
    ], 'conversation_quiz', QUIZ_SCHEMA, 2200);
  }

  async generatePath(params: {
    careerGoal: string;
    level: string;
    minutesPerDay: number;
    weeklyTargetMinutes: number;
    learnerDomains: string[];
    lessons: Array<{
      id: string;
      title: string;
      domain: string;
      level: string;
      estimatedMinutes: number;
      summary: string;
      keyConcepts: string[];
      completionPercent: number;
      averageScore: number | null;
    }>;
  }) {
    const lessonsText = params.lessons
      .map((l, i) =>
        `${i + 1}. [ID:${l.id}] "${l.title}" | Domain: ${l.domain} | Level: ${l.level} | ${l.estimatedMinutes} phút | Tiến độ: ${Math.round(l.completionPercent)}% | Điểm: ${l.averageScore != null ? Math.round(l.averageScore) + '%' : 'Chưa học'} | Khái niệm: ${l.keyConcepts.slice(0, 3).join(', ') || l.summary.slice(0, 80)}`
      )
      .join('\n');

    const system = `Bạn là AI Learning Path Advisor cho nền tảng học tiếng Anh ngành CNTT.
Tạo lộ trình học cá nhân hóa, sắp xếp theo tuần, kèm lý do học cụ thể cho từng bài.

Thông tin học viên:
- Trình độ: ${params.level}
- Mục tiêu nghề nghiệp: ${params.careerGoal}
- Lĩnh vực: ${params.learnerDomains.join(', ') || 'CNTT'}
- Thời gian: ${params.minutesPerDay} phút/ngày (~${params.weeklyTargetMinutes} phút/tuần)

DANH SÁCH BÀI HỌC KHẢ DỤNG (bắt buộc dùng đúng ID này):
${lessonsText}

Quy tắc bắt buộc:
1. Dùng ĐÚNG ID từ [ID:...] cho trường lessonId — không được bịa ID mới.
2. Sắp xếp logic: nền tảng trước, nâng cao sau; prerequisite học trước.
3. Ưu tiên bài chưa học (Tiến độ 0%) hoặc điểm thấp.
4. Phân bổ bài vào tuần sao cho tổng thời gian/tuần ≈ ${params.weeklyTargetMinutes} phút.
5. Mỗi reason: 1-2 câu tiếng Việt giải thích TẠI SAO học bài này lúc này.
6. priority: "high", "medium", hoặc "low".
7. studyTips: 2-3 mẹo học hiệu quả phù hợp với học viên này.
8. overview: tóm tắt toàn bộ lộ trình bằng tiếng Việt (2-3 câu).
9. Chỉ bao gồm các bài trong danh sách trên.`;

    return this.complete(
      [{ role: 'system', content: system }, { role: 'user', content: 'Tạo lộ trình học phù hợp nhất cho tôi.' }],
      'learning_path_plan',
      PATH_SCHEMA,
      2800,
    );
  }
}
