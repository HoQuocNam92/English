import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { OpenAiRecommendationProvider } from './openai-recommendation.provider'

test('AI provider returns null when it is not configured', async () => {
  const provider = new OpenAiRecommendationProvider({ json: async () => null } as any)
  const result = await provider.rerank([{ id: '1' } as any], {})
  assert.equal(result, null)
})
