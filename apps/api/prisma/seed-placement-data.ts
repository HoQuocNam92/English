import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
export async function seedPlacement(prisma: PrismaClient) {
  const items = JSON.parse(readFileSync(join(__dirname, 'data/placement-questions.json'), 'utf8'))
  const domains = await prisma.domain.findMany({ where: { isActive: true } })
  const levels = await prisma.level.findMany({ where: { isActive: true } })
  let created = 0
  let skipped = 0
  for (const item of items) {
    const domain = domains.find(d => d.code === item.domain)
    const level = levels.find(l => l.code === item.level)
    if (!domain) { skipped++; continue }
    if (!level) throw new Error(`Thiếu danh mục ${item.domain}/${item.level}. Chạy seed danh mục trước.`)
    if (await prisma.question.findFirst({ where: { topics: { has: item.tag } } })) continue
    await prisma.question.create({ data: { type: 'single_choice', skill: 'reading', prompt: item.prompt, context: item.context, explanation: item.explanation, domainId: domain.id, levelId: level.id, topics: ['placement', 'placement-v2', item.tag], points: 1, status: 'published', options: { create: item.options.map((text: string, index: number) => ({ text, key: String.fromCharCode(65 + index), isCorrect: index === item.correctIndex, order: index })) } } })
    created++
  }
  return { created, skipped, totalSeed: items.length, domains: [...new Set(items.map((i: any) => i.domain))] }
}
