import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { LearningAgendaService, vietnamPeriods } from './learning-agenda.service'
const now = new Date(), yesterday = new Date(now.getTime() - 86400000)
const topic = { id:'topic-1', code:'1.1', name:'Cloud Concepts', certificateId:'cert-1', order:1, certificateDomain:{order:1} }
const lesson = (id:string, order=1) => ({ id, title:`Lesson ${id}`, estimatedMinutes:15, level:{code:'beginner',order:1}, domain:{name:'Cloud'}, certificationTopics:[{topicId:topic.id,topic:{...topic,order}}] })
function fixture(overrides:any={}) {
 const state={ goal:'certification', progress:[] as any[], attempts:[] as any[], vocab:[] as any[], lessons:[lesson('l1'),lesson('l2',2)], ...overrides }
 const queries:any[]=[]
 const prisma:any={
 user:{findFirst:async()=>({id:'A'})},
 learnerProfile:{findUnique:async()=>({onboardingCompleted:true,learningGoal:state.goal,level:{code:'beginner',name:'Beginner',order:1},dailyStudyTargetMinutes:30,dailyVocabularyTarget:10,weeklyExamTarget:2,domains:[{domainId:'cloud',domain:{name:'Cloud'}}],certGoals:[{certificateId:'cert-1',certificate:{isActive:true,name:'AWS'}}]})},
 lesson:{findMany:async(args:any)=>{queries.push(args);return state.lessons}},
 learningProgress:{findMany:async(args:any)=>{queries.push(args);return state.progress}},
 exam:{findMany:async()=>state.quizzes ?? [{certificateId:'cert-1',topics:['1.1']}]},
 examAttempt:{findMany:async(args:any)=>{queries.push(args);return state.attempts},count:async(args:any)=>{queries.push(args);return state.attempts.length}},
 vocabularyProgress:{findMany:async(args:any)=>{queries.push(args);return state.vocab}},vocabulary:{count:async()=>100},
 placementAssessment:{findFirst:async(args:any)=>{queries.push(args);return null}},
 }
 return {service:new LearningAgendaService(prisma),state,queries}
}
test('Vietnam calendar handles late UTC hours and month/year boundaries',()=>{
 const p=vietnamPeriods(new Date('2026-12-31T18:00:00Z'))
 assert.equal(p.label,'2027-01-01');assert.equal(p.today.toISOString(),'2026-12-31T17:00:00.000Z');assert.equal(p.year.toISOString(),'2026-12-31T17:00:00.000Z');assert.equal(p.daysInMonth,31)
 assert.equal(vietnamPeriods(new Date('2028-02-10T00:00:00Z')).daysInYear,366)
})
test('agenda prioritizes in-progress lesson and never offers quiz before all topic lessons complete',async()=>{
 const {service,queries}=fixture({progress:[{resourceId:'l2',status:'in_progress',completionPercent:25}]})
 const result:any=await service.getAgenda('A')
 assert.equal(result.tasks[0].id,'l2');assert.equal(result.tasks[0].action,'Học tiếp');assert.equal(result.tasks.some((t:any)=>t.kind==='quiz'),false)
 assert.equal(result.source,'rules');assert.equal(result.level.code,'beginner');assert.ok(queries.filter(q=>q.where?.learnerId).every(q=>q.where.learnerId==='A'))
})
test('completed topic unlocks quiz and completed lesson is removed from pending tasks',async()=>{
 const {service}=fixture({progress:['l1','l2'].map(id=>({resourceId:id,status:'completed',completionPercent:100,completedAt:now}))})
 const result:any=await service.getAgenda('A');assert.ok(result.tasks.some((t:any)=>t.kind==='quiz'));assert.equal(result.tasks.some((t:any)=>t.kind==='lesson'&&t.status==='todo'),false)
 assert.equal(result.completedLessons,2);assert.equal(result.year.metrics[0].current,2)
})
test('latest poor Quiz prioritizes review; later passing result stops the review recommendation',async()=>{
 const old={examId:'exam',scorePercent:40,passed:false,submittedAt:yesterday,exam:{certificateId:'cert-1',topics:['1.1']}}
 const {service,state}=fixture({progress:[{resourceId:'l1',status:'completed',completedAt:yesterday}],attempts:[old]})
 const result:any=await service.getAgenda('A');assert.equal(result.tasks[0].kind,'review');assert.match(result.tasks[0].reason,/40%/)
 state.attempts=[{...old,scorePercent:90,passed:true,submittedAt:now},old]
 const improved:any=await service.getAgenda('A');assert.equal(improved.tasks.some((t:any)=>t.kind==='review'),false)
})
test('vocabulary plan shows due review and caps new-word targets at published catalog size',async()=>{
 const {service}=fixture({goal:'vocabulary',vocab:[{vocabularyId:'v',createdAt:yesterday,nextReviewAt:yesterday,status:'learning'}],lessons:[]})
 const result:any=await service.getAgenda('A');assert.ok(result.tasks.some((t:any)=>t.id==='review-words'));assert.equal(result.tasks.some((t:any)=>t.kind==='quiz'),false)
 assert.ok(result.year.metrics.find((m:any)=>m.label==='Từ mới').target<=100)
})
test('consistent high Quiz scores suggest a placement retest without upgrading level automatically',async()=>{
 const {service}=fixture({attempts:[0,1,2].map(i=>({examId:`e${i}`,scorePercent:85,passed:true,submittedAt:now,exam:{certificateId:'cert-1',topics:[]}}))})
 const result:any=await service.getAgenda('A');assert.equal(result.retestSuggested,true);assert.equal(result.level.code,'beginner')
})

test('today recommends next lesson after completion while planned daily lesson budget remains',async()=>{
 const {service}=fixture({progress:[{resourceId:'l1',status:'completed',completedAt:now}]})
 const result:any=await service.getAgenda('A')
 assert.ok(result.tasks.some((t:any)=>t.status==='done'))
 assert.ok(result.tasks.some((t:any)=>t.id==='l2'&&t.status==='todo'))
})
test('completed topic without a published quiz is not offered as a quiz task',async()=>{
 const {service}=fixture({quizzes:[],progress:['l1','l2'].map(resourceId=>({resourceId,status:'completed',completedAt:now}))})
 const result:any=await service.getAgenda('A')
 assert.equal(result.tasks.some((t:any)=>t.kind==='quiz'),false)
})

test('completed agenda includes separate review links for every lesson, including the selected topic lesson', async () => {
 const {service}=fixture({progress:['l1','l2'].map(resourceId=>({resourceId,status:'completed',completionPercent:100,completedAt:now}))})
 const result:any=await service.getAgenda('A')
 const done=result.tasks.find((task:any)=>task.id==='lesson-today-done')
 assert.deepEqual(done.completedLessons.map((item:any)=>item.id),['l1','l2'])
 assert.ok(done.completedLessons[0].href.endsWith('?lessonId=l1'))
 assert.ok(done.completedLessons[1].href.endsWith('?lessonId=l2'))
})
