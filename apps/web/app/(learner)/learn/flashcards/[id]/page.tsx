import { redirect } from 'next/navigation';

export default async function LegacyVocabularyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(id === 'all' || id === 'review' ? '/learn/flashcards' : `/learn/lessons/${encodeURIComponent(id)}`);
}
