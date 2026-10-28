const { estimateLessonMinutes } = require('@techenglish/shared-kernel/lesson-duration');

async function repairSeededLessonDurations(prisma) {
  // Only the old seed's known default is repaired. Explicitly configured durations remain intact.
  const lessons = await prisma.lesson.findMany({ where: { slug: { startsWith: 'aws-clf-c02-knowledge-' }, estimatedMinutes: 12 }, include: { sections: true } });
  let updated = 0;
  for (const lesson of lessons) {
    // Leave edited lesson records alone, even when their chosen duration happens to be twelve.
    if (Math.abs(new Date(lesson.updatedAt).getTime() - new Date(lesson.createdAt).getTime()) > 1000) continue;
    const estimatedMinutes = estimateLessonMinutes(lesson.sections, lesson.summary);
    if (estimatedMinutes !== 12) updated += (await prisma.lesson.updateMany({ where: { id: lesson.id, estimatedMinutes: 12 }, data: { estimatedMinutes } })).count;
  }
  return { checked: lessons.length, updated };
}
module.exports = { repairSeededLessonDurations };
