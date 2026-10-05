import { quizMeanings, editedQuizMeanings } from './quiz-meanings'

export function quizMeaning(word: { id: string; term: string; definitionVi?: string | null }): string | null {
  const edited = editedQuizMeanings[word.term.toLowerCase()]
  if (edited) return edited
  const saved = quizMeanings[word.id]
  if (saved && saved.term.toLowerCase() === word.term.toLowerCase()) return saved.meaning
  const text = (word.definitionVi || '').replace(/\s+/g, ' ').trim()
  if (/^(Xem|See)\b/i.test(text)) return null
  const first = text.split(/(?<=[.!?])\s+/)[0]
  return first.length >= 4 && first.length <= 180 ? first : null
}
