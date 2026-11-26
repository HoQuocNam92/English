import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { randomUUID } from 'node:crypto'
import { auditEvent } from './audit.middleware'
import { eventDefinition, eventBase, safeValues, saveEvent, snapshot } from './audit-events'
import { AuditInterceptor } from './audit.interceptor'
import { AuditLogController, AuditQueryDto } from '../../presentation/audit-log.controller'

const actor = { sub:randomUUID(),email:'reviewer@example.invalid',roles:['teacher'],permissions:['audit:read'] }
test('only confirmed business events show success; ordinary reads and HTTP 200 fallback are not inferred', () => {
  assert.equal(auditEvent({route:{path:'/api/v1/auth/login'},method:'POST'},200),null)
  assert.equal(eventDefinition({route:{path:'/api/v1/lessons'},method:'GET'}),null)
  assert.equal(eventDefinition({route:{path:'/api/v1/auth/mfa/verify'},method:'POST',body:{recover:true}})?.eventKey,'mfa.reset')
  assert.equal(auditEvent({route:{path:'/api/v1/roles/:id/users'},method:'POST',body:{actor_id:actor.sub,password:'SECRET'},params:{}},403)?.actorId,null)
  const callback={route:{path:'/api/v1/auth/google/callback'},method:'GET',user:{accessToken:'PRIVATE_TOKEN',user:{id:actor.sub,email:actor.email}}}
  assert.equal(auditEvent(callback,302)?.outcome,'success')
  assert.equal(auditEvent({...callback,user:{authError:'PRIVATE_ERROR'}},302)?.outcome,'failure')
  assert.ok(!JSON.stringify(auditEvent(callback,302)).includes('PRIVATE_TOKEN'))
})
test('strict allowlist removes all credentials recursively and does not trust frontend identity', () => {
  const sanitized = safeValues({status:'active',password:'SECRET',roles:[{code:'admin',secret:'SECRET',accessToken:'SECRET'}],permissions:[{permissionId:randomUUID(),recoveryCodes:['SECRET']}],newValues:{apiKey:'SECRET'}})
  assert.ok(!JSON.stringify(sanitized).includes('SECRET'))
  const base=eventBase({route:{path:'/api/v1/users/:id'},method:'PATCH',body:{actor_id:actor.sub},headers:{'x-forwarded-for':'1.2.3.4'},socket:{remoteAddress:'127.0.0.1'}},200)
  assert.equal(base.actorId,null);assert.equal(base.ipAddress,'127.0.0.1')
})
test('audit permission, server filters, cursor and detail bounds are enforced', async () => {
  let captured:any
  const db:any={auditLog:{findMany:(args:any)=>{captured=args;return []},count:()=>2,findUnique:async()=>({id:randomUUID(),createdAt:new Date('2026-01-01')})},$transaction:async(values:any)=>Promise.all(values)}
  const controller=new AuditLogController(db)
  await assert.rejects(controller.list({...actor,permissions:[]},{page:1,limit:25}))
  await controller.list(actor,{page:1,limit:25,actor:actor.sub,from:'2026-01-01T00:00:00Z',to:'2026-02-01T00:00:00Z',eventKey:'role.assign',targetType:'user_role',severity:'critical',ip:'127.0.0.1',outcome:'success',search:actor.sub,cursor:randomUUID()})
  assert.equal(captured.where.actorId,actor.sub);assert.equal(captured.where.eventKey,'role.assign');assert.equal(captured.where.severity,'critical');assert.equal(captured.where.outcome,'success');assert.ok(captured.where.AND);assert.equal(captured.skip,0)
  assert.equal(captured.select.oldValues,undefined)
  await assert.rejects(controller.list(actor,{page:1,limit:25,from:'2026-02-01',to:'2026-01-01'}))
  await assert.rejects(controller.detail(actor,'bad-id'))
  for(const invalid of [{limit:101},{page:10001},{ip:'forged'},{sort:'random'},{severity:'fatal'},{from:'tomorrow'},{cursor:'bad'}]) assert.ok((await validate(plainToInstance(AuditQueryDto,invalid))).length)
})
test('fifth failed login creates a warning with one deduplication key per actor/IP and time bucket', async () => {
  const keys:string[]=[];const events:any[]=[]
  const db:any={auditLog:{count:async()=>4,create:async({data}:any)=>{events.push(data);return{id:randomUUID()}}},auditAlert:{upsert:async({where}:any)=>keys.push(where.dedupeKey)}}
  const event={eventKey:'auth.login',outcome:'failure',ipAddress:'127.0.0.1',severity:'info'}
  await saveEvent(db,{...event});await saveEvent(db,{...event})
  assert.equal(events[0].severity,'warning');assert.equal(keys[0],keys[1])
})
test('lesson content changes are traceable by digest without copying raw content into audit history',async()=>{
  const req={route:{path:'/api/v1/lessons/:id'},method:'PATCH',params:{id:actor.sub}}
  const row={id:actor.sub,title:'Lesson',status:'draft',summary:'PRIVATE_CONTENT',sections:[{type:'rich_text',order:1,content:{text:'PRIVATE_CONTENT'}}]}
  const db:any={lesson:{findUnique:async()=>row}}
  const before=await snapshot(db,req,eventDefinition(req)!)
  row.sections[0].content.text='REPLACEMENT_CONTENT'
  const after=await snapshot(db,req,eventDefinition(req)!)
  assert.notEqual(before.contentDigest,after.contentDigest)
  assert.equal(before.sectionCount,1)
  assert.ok(!JSON.stringify(safeValues(before)).includes('PRIVATE_CONTENT'))
})

test('routine reads and refresh do not write success logs, but authentication/permission failures remain auditable', async()=>{
 const interceptor=new AuditInterceptor({} as any)
 for(const [path,method] of [['/api/v1/audit-logs','GET'],['/api/v1/audit-logs/alerts','GET'],['/api/v1/auth/refresh','POST']]) {
  const req={route:{path},method};const sentinel={} as any
  const context:any={switchToHttp:()=>({getRequest:()=>req,getResponse:()=>({statusCode:200})})}
  assert.equal(interceptor.intercept(context,{handle:()=>sentinel}),sentinel)
  assert.equal(auditEvent(req,401)?.outcome,'failure')
  assert.equal(auditEvent(req,403)?.eventKey,'security.access_denied')
 }
 let captured:any
 const db:any={auditLog:{findMany:(args:any)=>{captured=args;return []},count:()=>0},$transaction:async(values:any)=>Promise.all(values)}
 const controller=new AuditLogController(db)
 await controller.list(actor,{page:1,limit:10})
 assert.deepEqual(captured.where.AND[0].OR,[{eventKey:null},{outcome:null},{NOT:{eventKey:{in:['audit.read','auth.session_refresh']},outcome:'success'}}])
 await controller.list(actor,{page:1,limit:10,eventKey:'audit.read'})
 assert.equal(captured.where.AND,undefined)
})
