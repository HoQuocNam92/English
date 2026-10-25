export type TrailDomain = {
  id: string; name: string; available: boolean;
  lessons: { id: string; title: string; href: string; completed: boolean; estimatedMinutes: number; vocabularyCount: number; vocabularyReviewComplete?: boolean }[];
  assessment: { id: string; href: string; passed: boolean; passingScorePercent: number } | null;
};
export function buildLearningTrail(domains: TrailDomain[]) {
  const stages = domains.map((domain, stageIndex) => {
    let precedingComplete = true;
    const units = domain.lessons.map((lesson, index) => {
      const ready = lesson.completed || precedingComplete;
      precedingComplete = precedingComplete && lesson.completed;
      const steps = [{
        id: `learn:${lesson.id}`, kind: 'lesson', title: lesson.title, href: lesson.href,
        completed: lesson.completed, ready, minutes: lesson.estimatedMinutes,
        description: 'Học nội dung mới, đọc ví dụ và tìm hiểu thuật ngữ trong ngữ cảnh.',
      }];
      if (lesson.vocabularyCount > 0) steps.push({
        id: `review:${lesson.id}`, kind: 'review', title: `Luyện ${lesson.vocabularyCount} từ trong bài`,
        href: `/learn/flashcards/${lesson.id}/practice`,
        completed: lesson.completed && lesson.vocabularyReviewComplete === true,
        ready: lesson.completed, minutes: Math.min(15, Math.max(5, lesson.vocabularyCount)),
        description: 'Ôn bằng flashcards và tự đánh giá mức nhớ từng từ. Hoạt động ôn bổ sung được ghi nhận từ lịch sử ôn thực tế.',
      });
      return { id: lesson.id, number: index + 1, title: lesson.title, steps };
    });
    const lessonsComplete = domain.available && domain.lessons.length > 0 && domain.lessons.every(lesson => lesson.completed);
    const checkpoint = domain.assessment ? {
      id: `checkpoint:${domain.assessment.id}`, kind: 'checkpoint', title: 'Kiểm tra cuối chặng',
      href: domain.assessment.href, completed: domain.assessment.passed, ready: lessonsComplete, minutes: 0,
      description: `Học đủ các chủ đề rồi làm tổng kết. Mức đạt ${domain.assessment.passingScorePercent}%. Không tự động chuyển cấp.`,
    } : null;
    const steps = [...units.flatMap(unit => unit.steps), ...(checkpoint ? [checkpoint] : [])];
    return { id: domain.id, number: stageIndex + 1, title: domain.name, units, checkpoint, steps, completed: checkpoint?.completed === true };
  });
  const steps = stages.flatMap(stage => stage.steps);
  return { stages, steps, next: stages.filter(stage => !stage.completed).flatMap(stage => stage.steps).find(step => step.ready && !step.completed) ?? null };
}
