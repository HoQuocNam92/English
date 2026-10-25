import assert from 'node:assert/strict';
import test from 'node:test';
import { progressViewModel } from './progress.ts';

const milestone = (id, unlocked, progressPercent = 0) => ({ id, title: id, description: '', icon: '✓', target: 10, current: unlocked ? 10 : 0, xp: 50, color: 'violet', unlocked, progressPercent });

test('empty payload shows zero progress without division by zero', () => {
  const view = progressViewModel(null);
  assert.equal(view.overallPercent, 0);
  assert.equal(view.totalMilestones, 0);
  assert.equal(view.unlockedCount, 0);
  assert.deepEqual(view.milestones, []);
  assert.deepEqual(view.recentAttempts, []);
});

test('web and mobile progress is based on unlocked milestones, not lesson completion average', () => {
  const view = progressViewModel({ milestones: [milestone('one', true, 100), milestone('two', false, 80), milestone('three', false, 30)], gamification: { totalXp: 50, studyStreak: 2, unlockedCount: 99, totalMilestones: 99 } });
  assert.equal(view.overallPercent, 33);
  assert.equal(view.unlockedCount, 1);
  assert.equal(view.totalMilestones, 3);
  assert.equal(view.totalXp, 50);
  assert.equal(view.studyStreak, 2);
});

test('all milestones unlocked gives 100 percent', () => {
  assert.equal(progressViewModel({ milestones: [milestone('a', true), milestone('b', true)] }).overallPercent, 100);
});

test('no unlocked milestones gives zero percent even when individual milestones have partial progress', () => {
  assert.equal(progressViewModel({ milestones: [milestone('a', false, 90), milestone('b', false, 50)] }).overallPercent, 0);
});

test('partial milestone percentage is clamped for a safe progress bar', () => {
  const view = progressViewModel({ milestones: [milestone('low', false, -5), milestone('high', false, 160), milestone('mid', false, 37.6)] });
  assert.deepEqual(view.milestones.map(item => item.progressPercent), [0, 100, 38]);
});

test('vocabulary goal only exposes vocabulary next step', () => {
  const view = progressViewModel({ gamification: { learningGoal: 'vocabulary' } });
  assert.equal(view.includesVocabulary, true);
  assert.equal(view.includesCertification, false);
});

test('certification goal only exposes certification next step', () => {
  const view = progressViewModel({ gamification: { learningGoal: 'certification' } });
  assert.equal(view.includesVocabulary, false);
  assert.equal(view.includesCertification, true);
});

test('combined goal exposes both next steps', () => {
  const view = progressViewModel({ gamification: { learningGoal: 'both' } });
  assert.equal(view.includesVocabulary, true);
  assert.equal(view.includesCertification, true);
});

test('missing goal defaults to vocabulary as the API does for learners without certificate goals', () => {
  assert.equal(progressViewModel({}).learningGoal, 'vocabulary');
});

test('recent attempts are limited to three and preserve order', () => {
  const attempts = ['a', 'b', 'c', 'd'].map(id => ({ id, scorePercent: 70 }));
  assert.deepEqual(progressViewModel({ recentAttempts: attempts }).recentAttempts.map(item => item.id), ['a', 'b', 'c']);
});

test('missing or invalid game values never display NaN or negative XP and streak', () => {
  const view = progressViewModel({ gamification: { totalXp: Number.NaN, studyStreak: -2 } });
  assert.equal(view.totalXp, 0);
  assert.equal(view.studyStreak, 0);
});
import { buildLearningTrail } from './learning-trail.ts';

test('trail interleaves real lessons and word practice, gates future lessons and preserves earned checkpoints', () => {
  const first = { id: 'first', title: 'Requirements', href: '/learn/lessons/first', completed: false, estimatedMinutes: 20, vocabularyCount: 8 };
  const second = { ...first, id: 'second', title: 'Documentation', href: '/learn/lessons/second' };
  const domain = { id: 'software', name: 'Software', available: true, lessons: [first, second], assessment: { id: 'exam', href: '/learn/quiz/exam', passed: false, passingScorePercent: 75 } };
  let trail = buildLearningTrail([domain]);
  assert.deepEqual(trail.steps.map(step => step.kind), ['lesson', 'review', 'lesson', 'review', 'checkpoint']);
  assert.equal(trail.next.id, 'learn:first');
  assert.equal(trail.steps[2].ready, false);
  assert.equal(trail.steps[4].ready, false);
  first.completed = true;
  trail = buildLearningTrail([domain]);
  assert.equal(trail.next.id, 'review:first');
  assert.equal(trail.next.href, '/learn/flashcards/first/practice');
  assert.equal(trail.steps[2].ready, true);
  first.vocabularyReviewComplete = true;
  trail = buildLearningTrail([domain]);
  assert.equal(trail.next.id, 'learn:second');
  second.completed = true;
  trail = buildLearningTrail([domain]);
  assert.equal(trail.steps[4].ready, true);
  domain.assessment.passed = true;
  trail = buildLearningTrail([domain]);
  assert.equal(trail.stages[0].completed, true);
  assert.equal(trail.next, null, 'optional word review must not erase a passed course');
});

test('trail never invents practice for empty vocabularies or unlocks an incomplete curriculum', () => {
  const trail = buildLearningTrail([{ id: 'cloud', name: 'Cloud', available: false, lessons: [], assessment: { id: 'exam', href: '/learn/quiz/exam', passed: false, passingScorePercent: 75 } }]);
  assert.equal(trail.next, null);
  assert.equal(trail.steps.length, 1);
  assert.equal(trail.steps[0].ready, false);
});
