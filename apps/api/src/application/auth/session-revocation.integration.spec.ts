import 'reflect-metadata'
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { randomUUID, createHash } from 'node:crypto'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { AuthService } from './auth.service'
import { UsersService } from '../user/user.service'
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy'
import { SessionEventsController } from '../../presentation/session-events.controller'

test('both password-change APIs and password reset revoke every access/refresh session; connected browser receives revocation', {skip:process.env.ADMIN_SECURITY_QA!=='1'},async()=>{
  const db=new PrismaService(),id=randomUUID(),email=`session-${id}@example.invalid`
  const jwt=new JwtService({secret:'session-qa-signing-key'})
  const auth=new AuthService(db,jwt,{} as any,{} as any)
  const users=new UsersService(db)
  const strategy=new JwtStrategy({get:()=> 'session-qa-signing-key'} as any,db)
  const sessions=async()=>{
    const ids=[randomUUID(),randomUUID()]
    await db.refreshToken.createMany({data:ids.map(sid=>({id:sid,userId:id,tokenHash:createHash('sha256').update(sid).digest('hex'),expiresAt:new Date(Date.now()+3600000)}))})
    return ids
  }
  try{
    await db.user.create({data:{id,email,passwordHash:await bcrypt.hash('OldPassword123!',4)}})
    let ids=await sessions()
    assert.equal((await strategy.validate({sub:id,sid:ids[0]})).sub,id)
    const signal=new Promise<string>((resolve,reject)=>{
      const timer=setTimeout(()=>{subscription.unsubscribe();reject(Error('Revocation signal timeout'))},5000)
      const subscription=new SessionEventsController(db).events({sub:id,email,roles:[],permissions:[],sid:ids[0]}).subscribe({next:event=>{if(event.type==='revoked'){clearTimeout(timer);resolve(event.type)}},error:reject})
    })
    await users.changePassword(id,{currentPassword:'OldPassword123!',newPassword:'NextPassword123!'})
    for(const sid of ids){await assert.rejects(strategy.validate({sub:id,sid}));await assert.rejects(auth.refresh(sid))}
    assert.equal(await signal,'revoked')
    ids=await sessions()
    await auth.changePassword(id,{currentPassword:'NextPassword123!',newPassword:'FinalPassword123!'})
    for(const sid of ids){await assert.rejects(strategy.validate({sub:id,sid}));await assert.rejects(auth.refresh(sid))}
    ids=await sessions()
    const token='a'.repeat(64)
    await db.passwordResetToken.create({data:{userId:id,email,otpHash:createHash('sha256').update(token).digest('hex'),expiresAt:new Date(Date.now()+3600000)}})
    await auth.resetPassword({token,newPassword:'ResetPassword123!'})
    for(const sid of ids){await assert.rejects(strategy.validate({sub:id,sid}));await assert.rejects(auth.refresh(sid))}
    await assert.rejects(strategy.validate({sub:id}))
  }finally{
    await db.passwordResetToken.deleteMany({where:{userId:id}})
    await db.user.deleteMany({where:{id}})
    await db.$disconnect()
  }
})
