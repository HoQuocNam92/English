import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common'
import { APP_INTERCEPTOR, NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../database/prisma.service'
import { JwtStrategy } from '../auth/jwt.strategy'
import { AuthService } from '../../application/auth/auth.service'
import { AdminMfaService } from '../../application/auth/admin-mfa.service'
import { EmailService } from '../email/email.service'
import { AuthController } from '../../presentation/auth.controller'
import { AdminMfaController } from '../../presentation/admin-mfa.controller'
import { AuditLogController } from '../../presentation/audit-log.controller'
import { AuditMiddleware } from './audit.middleware'
import { AuditInterceptor } from './audit.interceptor'
import { totp } from '../../application/auth/totp'

test('real HTTP login/MFA/audit API confirms events, filters on server, denies unauthorized access and records failed logins', {skip:process.env.ADMIN_SECURITY_QA!=='1'}, async()=>{
  const db=new PrismaService(),id=randomUUID(),email=`audit-http-${id}@example.invalid`,key='audit-http-only-signing-key'
  const jwt=new JwtService({secret:key})
  @Module({controllers:[AuthController,AdminMfaController,AuditLogController],providers:[AuthService,AdminMfaService,JwtStrategy,{provide:PrismaService,useValue:db},{provide:JwtService,useValue:jwt},{provide:ConfigService,useValue:{get:()=>key}},{provide:EmailService,useValue:{}},{provide:APP_INTERCEPTOR,useClass:AuditInterceptor}]})
  class FixtureModule {configure(consumer:MiddlewareConsumer){consumer.apply(AuditMiddleware).forRoutes('*')}}
  const app=await NestFactory.create(FixtureModule,{logger:false})
  app.setGlobalPrefix('api/v1');app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true,forbidNonWhitelisted:true}))
  let adminRole:any
  try{
    adminRole=await db.role.findUnique({where:{code:'admin'}})??await db.role.create({data:{code:'admin',name:'Admin',isSystem:true}})
    await db.user.create({data:{id,email,passwordHash:await bcrypt.hash('Password123!',4),userDetail:{create:{displayName:'Audit HTTP QA'}},userRoles:{create:{roleId:adminRole.id}}}})
    await app.listen(0,'127.0.0.1');const base=(await app.getUrl())+'/api/v1'
    const send=(path:string,body:any,token?:string)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)})
    const login=await send('/auth/login',{email,password:'Password123!'})
    assert.equal(login.status,200);const session:any=await login.json()
    const loginEvent=await db.auditLog.findFirstOrThrow({where:{actorId:id,eventKey:'auth.login'}})
    assert.equal(loginEvent.outcome,'success');assert.ok(loginEvent.requestId)
    assert.equal((await fetch(base+'/audit-logs',{headers:{Authorization:'Bearer '+session.accessToken}})).status,403)
    assert.equal((await send('/auth/mfa/setup',{},session.accessToken)).status,201)
    const state=await db.adminMfa.findUniqueOrThrow({where:{userId:id}})
    const mfa=app.get(AdminMfaService)
    const code=totp((mfa as any).decrypt(state.secretEncrypted),Math.floor(Date.now()/30000))
    const verified=await send('/auth/mfa/verify',{code},session.accessToken)
    assert.equal(verified.status,201);const proof:any=await verified.json();const headers={Authorization:'Bearer '+proof.accessToken}
    const list=await fetch(base+`/audit-logs?actor=${id}&eventKey=auth.login&severity=info&outcome=success&limit=1`,{headers})
    assert.equal(list.status,200);const data:any=await list.json();assert.equal(data.meta.total,1);assert.equal(data.data[0].id,loginEvent.id)
    assert.equal(data.data[0].oldValues,undefined)
    const detail=await fetch(base+'/audit-logs/'+loginEvent.id,{headers})
    assert.equal(detail.status,200);assert.equal((await detail.json() as any).requestId,loginEvent.requestId)
    assert.equal((await fetch(base+'/audit-logs?limit=101',{headers})).status,400)
    assert.equal((await fetch(base+'/audit-logs/'+loginEvent.id,{method:'DELETE',headers})).status,404)
    assert.equal((await fetch(base+'/audit-logs/'+loginEvent.id,{method:'PATCH',headers})).status,404)
    const failures=await Promise.all(Array.from({length:5},()=>send('/auth/login',{email,password:'WRONG_PRIVATE_PASSWORD'})))
    assert.ok(failures.every(result=>result.status===401))
    for(let attempt=0;attempt<50;attempt++){
      if(await db.auditLog.count({where:{eventKey:'auth.login',outcome:'failure',createdAt:{gte:loginEvent.createdAt}}})>=5)break
      await new Promise(resolve=>setTimeout(resolve,20))
    }
    assert.ok(await db.auditAlert.count({where:{kind:'repeated_login_failure'}}))
    const persisted=await db.auditLog.findMany({where:{OR:[{actorId:id},{eventKey:'auth.login',outcome:'failure',createdAt:{gte:loginEvent.createdAt}}]}})
    const serialized=JSON.stringify(persisted)
    assert.ok(!serialized.includes('WRONG_PRIVATE_PASSWORD'));assert.ok(!serialized.includes('Password123!'));assert.ok(!serialized.includes(session.accessToken));assert.ok(!serialized.includes(proof.recoveryCodes[0]))
    // Clearing the role does not grant audit access even with a previously signed admin payload.
    await db.userRole.deleteMany({where:{userId:id}})
    assert.equal((await fetch(base+'/audit-logs',{headers})).status,403)
    const changed=await send('/auth/change-password',{currentPassword:'Password123!',newPassword:'NextPassword123!'},proof.accessToken)
    assert.equal(changed.status,204)
    assert.equal((await fetch(base+'/auth/me',{headers})).status,401)
    const revocation=await db.auditLog.findFirstOrThrow({where:{actorId:id,eventKey:'auth.session_revoke'}})
    assert.equal(revocation.updatedCount,1)
  }finally{
    await app.close();await db.adminMfa.deleteMany({where:{userId:id}});await db.user.deleteMany({where:{id}});await db.$disconnect()
  }
})
