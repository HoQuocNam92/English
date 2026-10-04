import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ApivnLearningPlanner } from './apivn-learning-planner'
const catalog=[{id:'lesson-1',title:'Cloud knowledge',kind:'lesson',actionUrl:'/learn/lessons/lesson-1'}]
const fallback={source:'rules',dailyMinutes:30,steps:[]}
function planner() { return new ApivnLearningPlanner({get:(key:string)=>key==='APIVN_API_KEY'?'test-secret':key==='APIVN_MODEL'?'gpt-6-luna':undefined} as any) }
test('APIVN call uses configured model and endpoint, deduplicates and caches matching analysis',async()=>{
 const original=global.fetch;let calls=0
 global.fetch=(async(url:any,init:any)=>{calls++;assert.equal(String(url),'https://apivn.vn/v1/chat/completions');const body=JSON.parse(init.body);assert.equal(body.model,'gpt-6-luna');assert.equal(init.headers.Authorization,'Bearer test-secret');return {ok:true,json:async()=>({choices:[{message:{content:'{"summary":"ok"}'}}]})} as any}) as any
 try {const ai=planner();const [a,b]=await Promise.all([ai.json('instruction',{score:60}),ai.json('instruction',{score:60})]);assert.deepEqual(a,b);await ai.json('instruction',{score:60});assert.equal(calls,1);await ai.json('instruction',{score:80});assert.equal(calls,2)} finally {global.fetch=original}
})
test('plan validates public catalog ids, ignores model URLs and preserves measured settings',async()=>{
 const ai=planner();ai.json=async()=>({summary:'Củng cố kiến thức',levelReason:'Dựa trên kết quả',levelCode:'professional',dailyMinutes:999,strengths:['Đọc hiểu'],weaknesses:[],steps:[{candidateId:'invented',week:1,reason:'bad'},{candidateId:'lesson-1',week:2,reason:'Ôn Cloud',actionUrl:'https://attacker.invalid'},{candidateId:'lesson-1',week:2,reason:'duplicate'}]})
 const result=await ai.plan(fallback,catalog,{assessment:{levelCode:'beginner'}})
 assert.equal(result.source,'ai');assert.equal(result.dailyMinutes,30);assert.equal(result.steps.length,1);assert.equal(result.steps[0].actionUrl,'/learn/lessons/lesson-1');assert.ok(!('levelCode'in result))
})
test('agenda can reorder allowed tasks but never adds unlocked quizzes, drops tasks, or changes completion',async()=>{
 const ai=planner();ai.json=async()=>({summary:'Ôn phần yếu trước',monthFocus:'Cloud',yearFocus:'Chứng chỉ',tasks:[{taskId:'invented-quiz',reason:'bad'},{taskId:'review',reason:'Điểm còn thấp'},{taskId:'review',reason:'duplicate'}]})
 const baseline={source:'rules',level:{code:'beginner'},goal:'certification',tasks:[{id:'next',kind:'lesson',status:'todo',href:'/safe',reason:'next'},{id:'review',kind:'review',status:'todo',href:'/review',reason:'weak'},{id:'done',status:'done'}],month:{metrics:[],focus:'old'},year:{metrics:[]}}
 const result=await ai.agenda(baseline)
 assert.equal(result.source,'ai');assert.equal(result.tasks.length,3);assert.equal(result.tasks[0].id,'review');assert.equal(result.tasks[0].href,'/review');assert.equal(result.tasks.find((t:any)=>t.id==='done').status,'done');assert.equal(result.level.code,'beginner')
})
test('unavailable or invalid AI response keeps a clear rules fallback',async()=>{
 const ai=planner();ai.json=async()=>null
 assert.equal((await ai.plan(fallback,catalog,{})).source,'rules')
 const baseline={source:'rules',tasks:[{id:'t',status:'todo'}],level:{code:'beginner'},month:{metrics:[]},year:{metrics:[]}}
 assert.equal((await ai.agenda(baseline)).source,'rules')
 assert.ok((await ai.agenda(baseline)).aiMessage)
})
