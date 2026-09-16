import { BadGatewayException, GatewayTimeoutException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const PATH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    estimatedWeeks: { type: 'integer' },
    overview: { type: 'string' },
    studyTips: { type: 'array', items: { type: 'string' } },
    weeklyPlan: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          week: { type: 'integer' },
          theme: { type: 'string' },
          lessons: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
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
export class LearningPathAiService {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    const key = this.config.get<string>('GROQ_API_KEY');
    return Boolean(key && key.trim() && !/placeholder|your[_-]?key/i.test(key));
  }

  async generatePath(params: {
    careerGoal: string;
    level: string;
    minutesPerDay: number;
    weeklyTargetMinutes: number;
    learnerDomains: string[];
    lessons: Array<{
      id: string; title: string; domain: string; level: string;
      estimatedMinutes: number; summary: string; keyConcepts: string[];
      completionPercent: number; averageScore: number | null;
    }>;
  }) {
    const lessonsText = params.lessons.map((lesson, index) =>
      `${index + 1}. [ID:${lesson.id}] "${lesson.title}" | Domain: ${lesson.domain} | Level: ${lesson.level} | ${lesson.estimatedMinutes} phút | Tiến độ: ${Math.round(lesson.completionPercent)}% | Điểm: ${lesson.averageScore == null ? 'Chưa học' : `${Math.round(lesson.averageScore)}%`} | Khái niệm: ${lesson.keyConcepts.slice(0, 3).join(', ') || lesson.summary.slice(0, 80)}`,
    ).join('\n');

    const prompt = `Bạn là cố vấn lộ trình học tiếng Anh CNTT. Tạo lộ trình cá nhân hóa theo tuần.
Trình độ: ${params.level}
Mục tiêu: ${params.careerGoal}
Lĩnh vực: ${params.learnerDomains.join(', ') || 'CNTT'}
Thời gian: ${params.minutesPerDay} phút/ngày, ${params.weeklyTargetMinutes} phút/tuần.

Bài học khả dụng:
${lessonsText}

Chỉ dùng đúng lessonId trong danh sách. Học nền tảng trước, ưu tiên bài chưa học hoặc điểm thấp. Phân bổ gần với thời lượng tuần. reason và overview viết bằng tiếng Việt; priority chỉ là high, medium hoặc low.`;

    return this.complete(prompt);
  }

  private async complete(prompt: string) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!this.isConfigured()) throw new ServiceUnavailableException('Dịch vụ tạo lộ trình chưa được cấu hình.');
    const model = this.config.get<string>('GROQ_MODEL', 'openai/gpt-oss-20b');
    const configuredTimeout = Number(this.config.get('AI_REQUEST_TIMEOUT_MS', 30000));
    const timeout = Number.isFinite(configuredTimeout) ? Math.min(45000, Math.max(5000, configuredTimeout)) : 30000;
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model,
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: 'Tạo lộ trình phù hợp nhất.' }],
        temperature: 0.2,
        max_completion_tokens: 2800,
        response_format: { type: 'json_schema', json_schema: { name: 'learning_path_plan', strict: true, schema: PATH_SCHEMA } },
      }, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout });
      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty AI response');
      return JSON.parse(content);
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') throw new GatewayTimeoutException('Tạo lộ trình quá thời gian. Vui lòng thử lại.');
      if ([401, 403, 429].includes(error?.response?.status)) throw new ServiceUnavailableException('Dịch vụ tạo lộ trình tạm thời không khả dụng.');
      throw new BadGatewayException('Không thể tạo lộ trình lúc này.');
    }
  }
}
