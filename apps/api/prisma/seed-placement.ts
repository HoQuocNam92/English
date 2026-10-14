import { PrismaClient } from '@prisma/client'
import { seedPlacement } from './seed-placement-data'
const prisma = new PrismaClient()
seedPlacement(prisma).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
