import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { balancedQuestions, PlacementService } from './placement.service'
const id = '11111111-1111-4111-8111-111111111111'
const questions = Array.from({ length: 15 }, (_, i) => ({ id: `q${i}`, prompt: `Question ${i}`, context: 'text', explanation: 'explain', domain: { code: i % 2 ? 'CLOUD' : 'DEVOPS', name: 'domain' }, level: { code: ['beginner','intermediate','advanced'][i % 3], name: 'Level' }, options: [{ id: `yes${i}`, isCorrect: true, text: 'yes', key: 'A' }, { id: `no${i}`, isCorrect: false, text: 'no', key: 'B' }] }))
function fixture(overrides: any = {}) {
 const store: any = { session: { id, learnerId: 'A', questions, expiresAt: new Date(Date.now()+60000), submittedAt: null } }
 const prisma: any = {
  learnerProfile: { findUnique: async () => ({ level: { code:'beginner', name:'Cơ bản' }, domains: [{ domainId:'d',domain:{name:'Cloud'} }], certGoals: [], learningGoal:'vocabulary', onboardingCompleted:true }), upsert: async () => { store.updated=true } },
  question: { findMany: async () => questions },
  lesson: { findMany: async () => [] },
  level: { findUnique: async () => ({ id:'level', name:'Cơ bản' }) },
  placementAssessment: {
   create: async (args: any) => { store.created=args;return { id,expiresAt:new Date() } },
   findFirst: async (args: any) => args.where.learnerId===store.session.learnerId ? store.session : null,
   updateMany: async (args: any) => { store.saved=args.data;return {count:1} },
  }, ...overrides,
 }
 prisma.$transaction=async (fn: any)=>fn(prisma)
 return {service:new PlacementService(prisma),store}
}
test('balanced selection covers seven domains and all three levels', () => {
 const pool=Array.from({length:105},(_,i)=>({...questions[i%15],id:`p${i}`,domain:{code:`D${Math.floor(i/15)}`},level:{code:['beginner','intermediate','advanced'][i%3]}}))
 const chosen=balancedQuestions(pool)
 assert.equal(chosen.length,15)
 assert.equal(new Set(chosen.map(q=>q.domain.code)).size,7)
 assert.equal(new Set(chosen.map(q=>q.level.code)).size,3)
 assert.equal(new Set(chosen.map(q=>q.id)).size,15)
})
test('start snapshots answers privately and never exposes correct options', async()=>{
 const {service,store}=fixture(); const result=await service.start('A')
 assert.equal(result.assessmentId,id)
 assert.equal(result.data.length,15)
 assert.ok(store.created.data.questions[0].options.some((o:any)=>o.isCorrect))
 assert.ok(result.data.every(q=>!('explanation' in q)&&q.options.every((o:any)=>!('isCorrect' in o))))
})
test('submit rejects another learner session, missing answers, duplicates and foreign options', async()=>{
 const {service}=fixture()
 await assert.rejects(()=>service.submit('B',{assessmentId:id,answers:[]}))
 const answers=questions.map(q=>({questionId:q.id,optionId:q.options[0].id}))
 await assert.rejects(()=>service.submit('A',{assessmentId:id,answers:answers.slice(1)}))
 await assert.rejects(()=>service.submit('A',{assessmentId:id,answers:answers.map(()=>answers[0])}))
 await assert.rejects(()=>service.submit('A',{assessmentId:id,answers:answers.map(a=>({...a,optionId:'foreign'}))}))
})
test('grading ignores supplied scores and saves measured level, domain results, answers and plan', async()=>{
 const {service,store}=fixture()
 const answers=questions.map((q,i)=>({questionId:q.id,optionId:q.options[i<8?0:1].id}))
 const result:any=await service.submit('A',{assessmentId:id,answers})
 assert.equal(result.correct,8);assert.equal(result.total,15);assert.equal(result.levelCode,'intermediate')
 assert.equal(result.domainScores.reduce((n:number,d:any)=>n+d.total,0),15)
 assert.equal(result.review.length,15);assert.ok(store.saved.submittedAt);assert.ok(store.updated)
 assert.equal(result.plan.source,'rules')
})
test('submitted results are idempotent and expired sessions cannot be graded', async()=>{
 const {service,store}=fixture();store.session.submittedAt=new Date();store.session.result={correct:4}
 assert.deepEqual(await service.submit('A',{assessmentId:id,answers:[]}),{correct:4})
 store.session.submittedAt=null;store.session.expiresAt=new Date(0)
 await assert.rejects(()=>service.submit('A',{assessmentId:id,answers:[]}))
})

test('placement bank supplies a valid assessment for every supported domain and is safe to seed twice', async () => {
 const { seedPlacement } = await import('../../../prisma/seed-placement-data')
 const items = require('../../../prisma/data/placement-questions.json')
 const stored: any[] = []
 const prisma: any = {
  domain: { findMany: async () => [...new Set(items.map((q: any) => q.domain))].map(code => ({ id: code, code })) },
  level: { findMany: async () => LEVEL_CODES.map(code => ({ id: code, code })) },
  question: {
   findFirst: async ({ where }: any) => stored.find(q => q.topics.includes(where.topics.has)),
   create: async ({ data }: any) => { stored.push(data); return data },
  },
 }
 assert.equal((await seedPlacement(prisma)).created, 165)
 assert.equal((await seedPlacement(prisma)).created, 0)
 for (const domain of new Set(stored.map(q => q.domainId))) {
  const pool = stored.filter(q => q.domainId === domain).map(q => ({ ...q, options: q.options.create, domain: { code: q.domainId }, level: { code: q.levelId } }))
  assert.equal(balancedQuestions(pool).length, 15)
  assert.equal(new Set(pool.map(q => q.level.code)).size, 3)
 }
})
const LEVEL_CODES = ['beginner', 'intermediate', 'advanced']

test('insufficient valid placement questions never creates a partial assessment', async () => {
 const { service, store } = fixture({ question: { findMany: async () => questions.slice(0, 9) } })
 await assert.rejects(() => service.start('A'), /Chưa đủ 10 câu/)
 assert.equal(store.created, undefined)
})
