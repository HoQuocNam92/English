import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { OpenAiRecommendationProvider } from './openai-recommendation.provider'

test('AI provider returns null when it is not configured', async () => {
  const provider = new OpenAiRecommendationProvider({ json: async () => null } as any)
  const result = await provider.rerank([{ id: '1' } as any], {})
  assert.equal(result, null)
})

test('ranking uses only existing items and keeps remaining items when AI omits them', async () => {
 const provider=new OpenAiRecommendationProvider({json:async()=>({recommendations:[{id:'b',reason:'Củng cố phần yếu'},{id:'invented',reason:'Không hợp lệ'},{id:'b',reason:'Trùng'}]})} as any)
 const result=await provider.rerank([{id:'a',actionUrl:'/learn/lessons/a'},{id:'b',actionUrl:'/learn/lessons/b'}] as any,{})
 assert.deepEqual(result?.map(item=>item.id),['b','a']);assert.equal(result?.[0].actionUrl,'/learn/lessons/b')
})
