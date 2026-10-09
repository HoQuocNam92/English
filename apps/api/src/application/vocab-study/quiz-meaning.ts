import { quizMeanings, editedQuizMeanings } from './quiz-meanings'

export function quizMeaning(word: { id: string; term: string; definitionVi?: string | null; tags?: string[] }): string | null {
  if (word.tags?.includes('reviewed-meaning')) {
    const reviewed = (word.definitionVi || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)[0]
    if (reviewed.length >= 4 && reviewed.length <= 300) return reviewed
  }
  const edited = editedQuizMeanings[word.term.toLowerCase()]
  if (edited) return edited
  const saved = quizMeanings[word.id]
  if (saved && saved.term.toLowerCase() === word.term.toLowerCase()) return saved.meaning
  const text = (word.definitionVi || '').replace(/\s+/g, ' ').trim()
  if (/^(Xem|See)\b/i.test(text)) return null
  const first = text.split(/(?<=[.!?])\s+/)[0]
  return first.length >= 4 && first.length <= 180 ? first : null
}
