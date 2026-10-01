import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AiRecommendationPort } from '../../application/recommendation/ai-recommendation.port'
import { LearningRecommendationItem } from '../../application/recommendation/recommendation.service'

@Injectable()
export class OpenAiRecommendationProvider implements AiRecommendationPort {
  constructor(private readonly config: ConfigService) {}

  async rerank(items: LearningRecommendationItem[], context: Record<string, unknown>) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')
    const model = this.config.get<string>('OPENAI_MODEL')
    if (!apiKey || !model || items.length === 0) return null
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model, store: false,
          instructions: 'Bạn là cố vấn học tiếng Anh chuyên ngành CNTT. Chỉ xếp hạng các id được cung cấp và viết lại reason ngắn gọn bằng tiếng Việt. Không tạo id mới.',
          input: JSON.stringify({ context, recommendations: items.map(({ id, title, reason, priorityScore }) => ({ id, title, reason, priorityScore })) }),
          text: { format: { type: 'json_schema', name: 'learning_recommendations', strict: true, schema: {
            type: 'object', additionalProperties: false,
            properties: { recommendations: { type: 'array', maxItems: 5, items: {
              type: 'object', additionalProperties: false,
              properties: { id: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'reason'],
            } } }, required: ['recommendations'],
          } } },
        }),
      })
      if (!response.ok) return null
      const data = await response.json() as any
      const text = data.output_text ?? data.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === 'output_text')?.text
      if (!text) return null
      const parsed = JSON.parse(text)
      const source = new Map(items.map(item => [item.id, item]))
      const ranked = (parsed.recommendations ?? []).flatMap((entry: any) => {
        const original = source.get(entry.id)
        return original && typeof entry.reason === 'string' ? [{ ...original, reason: entry.reason }] : []
      })
      return ranked.length ? ranked.slice(0, 5) : null
    } catch { return null } finally { clearTimeout(timeout) }
  }
}
