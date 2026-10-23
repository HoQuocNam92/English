/** Grading hints are available through completed results, not the learner catalog. */
export function learnerQuestion(question: any) {
  const { acceptedAnswers, explanation, ...safe } = question
  return { ...safe, options: (question.options ?? []).map(({ isCorrect, explanation, ...option }: any) => option) }
}
