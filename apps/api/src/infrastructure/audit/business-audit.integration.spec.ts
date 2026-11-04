import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { randomUUID } from 'node:crypto'
import { PrismaService } from '../database/prisma.service'
import { auditContext } from './audit-context'
import { AuditInterceptor } from './audit.interceptor'
import { eventDefinition } from './audit-events'
import { RolesService } from '../../application/role/role.service'
import { AdminMfaService } from '../../application/auth/admin-mfa.service'
import { JwtService } from '@nestjs/jwt'
import { totp } from '../../application/auth/totp'

test('real PostgreSQL couples business changes to append-only logs and protects concurrent requests', {skip:process.env.ADMIN_SECURITY_QA!=='1'}, async()=>{
  const db=new PrismaService(), interceptor=new AuditInterceptor(db), roles=new RolesService(db)
  const actorId=randomUUID(),targetId=randomUUID(),roleId=randomUUID(),sid=randomUUID(),suffix=randomUUID().slice(0,8)
  const actor={sub:actorId,email:'audit-qa-'+suffix+'@example.invalid',roles:['admin'],permissions:[],sid,mfaVerified:false}
  const request=(path:string,method:string,params:any={},body:any={})=>({route:{path:'/api/v1'+path},method,params,body,user:actor,auditRequestId:randomUUID(),headers:{},ip:'127.0.0.1'})
  const execute=(req:any,run:()=>Promise<any>)=>auditContext.run({request:req},()=>interceptor.execute(req,{statusCode:200},eventDefinition(req)!,run))
  try{
    await db.user.createMany({data:[{id:actorId,email:actor.email,passwordHash:'qa-only'},{id:targetId,email:'target-'+suffix+'@example.invalid',passwordHash:'qa-only'}]})
    await db.role.create({data:{id:roleId,code:'audit_qa_'+suffix,name:'QA'}})
    const req=request('/roles/:id/users','POST',{id:roleId},{userId:targetId,actor_id:targetId,password:'MUST_NOT_LOG'})
    await execute(req,()=>roles.assignRoleToUser({userId:targetId,roleId,grantedById:actorId}))
    const event=await db.auditLog.findFirstOrThrow({where:{requestId:req.auditRequestId}})
    assert.equal(event.actorId,actorId);assert.equal(event.eventKey,'role.assign');assert.equal(event.outcome,'success')
    assert.deepEqual((event.oldValues as any).roles,[]);assert.equal((event.newValues as any).roles[0].code,'audit_qa_'+suffix)
    assert.ok(!JSON.stringify(event).includes('MUST_NOT_LOG'))
    await assert.rejects(db.auditLog.update({where:{id:event.id},data:{outcome:'failure'}}),/append-only/)
    await assert.rejects(db.auditLog.delete({where:{id:event.id}}),/append-only/)
    await assert.rejects(db.$executeRawUnsafe('TRUNCATE audit_logs'),/append-only/)
    // Invalid request UUID makes audit insertion fail AFTER business deletion; both must roll back.
    const broken:any=request('/roles/:id/users/:userId','DELETE',{id:roleId,userId:targetId});broken.auditRequestId='invalid'
    await assert.rejects(execute(broken,()=>roles.revokeRoleFromUser(targetId,roleId,actorId)))
    assert.equal(await db.userRole.count({where:{userId:targetId,roleId}}),1)
    const concurrent=await Promise.allSettled([1,2].map(()=>{const r=request('/roles/:id/users/:userId','DELETE',{id:roleId,userId:targetId});return execute(r,()=>roles.revokeRoleFromUser(targetId,roleId,actorId))}))
    assert.ok(concurrent.some(item=>item.status==='fulfilled'))
    assert.equal(await db.userRole.count({where:{userId:targetId,roleId}}),0)
    const succeeded=concurrent.filter(item=>item.status==='fulfilled').length
    assert.equal(await db.auditLog.count({where:{actorId,eventKey:'role.revoke'}}),succeeded)
    // MFA retains its existing transaction so failed-attempt counters can commit without granting access.
    await db.refreshToken.create({data:{id:sid,userId:actorId,tokenHash:randomUUID(),expiresAt:new Date(Date.now()+3600000)}})
    const mfa=new AdminMfaService(db,{get:()=> 'audit-integration-key-only'} as any,new JwtService({secret:'qa-only'}))
    const setup=request('/auth/mfa/setup','POST')
    await execute(setup,()=>mfa.setup(actor))
    const state=await db.adminMfa.findUniqueOrThrow({where:{userId:actorId}})
    const verify=request('/auth/mfa/verify','POST',{}, {code:'not-stored'})
    const code=totp((mfa as any).decrypt(state.secretEncrypted),Math.floor(Date.now()/30000))
    await execute(verify,()=>mfa.verify(actor,code))
    assert.equal(await db.auditLog.count({where:{requestId:verify.auditRequestId}}),1)
    assert.equal((await db.auditLog.findFirstOrThrow({where:{requestId:verify.auditRequestId}})).eventKey,'mfa.enroll')
    const failed=request('/auth/mfa/verify','POST')
    await assert.rejects(execute(failed,()=>mfa.verify(actor,'bad-code')))
    assert.equal((await db.adminMfa.findUniqueOrThrow({where:{userId:actorId}})).failedAttempts,1)
  }finally{
    await db.adminMfa.deleteMany({where:{userId:actorId}})
    await db.role.deleteMany({where:{id:roleId}})
    await db.user.deleteMany({where:{id:{in:[actorId,targetId]}}})
    await db.$disconnect()
  }
})
