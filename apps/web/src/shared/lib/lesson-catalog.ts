import { lessonTrackByType } from './lesson-tracks';

export type CatalogLesson = {
  id: string; title: string; summary: string; type: string; estimatedMinutes: number;
  domain?: { code: string; name: string }; level?: { code: string; name: string };
  keyConcepts?: string[];
  certificates?: { certificate: { id: string; code: string; name: string } }[];
  vocabularies?: { vocabulary: { id: string; term: string } }[];
  _count?: { vocabularies: number };
};
export type LessonProfile = {
  learningGoal?: string; level?: { code: string };
  domains?: { domain: { code: string } }[];
  certGoals?: { certificate: { id: string; code: string } }[];
};
const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
const ranks = ['beginner', 'intermediate', 'advanced', 'professional'];
export function filterLessons(items: CatalogLesson[], profile: LessonProfile | null, filters: { query: string; scope: string; domainCode: string; certificateId: string; vocabulary: string }) {
  const domains = new Set(profile?.domains?.map(link => link.domain.code));
  const certificates = new Set(profile?.certGoals?.map(link => link.certificate.id));
  const rank = ranks.indexOf(profile?.level?.code ?? '');
  return items.filter(item => {
    const linkedCertificates = item.certificates ?? [];
    if (filters.scope === 'path') {
      const domainMatch = Boolean(item.domain && domains.has(item.domain.code));
      const certificateMatch = linkedCertificates.some(link => certificates.has(link.certificate.id));
      const matchesGoal = profile?.learningGoal === 'certification' ? certificateMatch : profile?.learningGoal === 'vocabulary' ? domainMatch : domainMatch || certificateMatch;
      if (!matchesGoal) return false;
      const lessonRank = ranks.indexOf(item.level?.code ?? '');
      if (rank >= 0 && lessonRank !== rank) return false;
    }
    if (filters.domainCode && item.domain?.code !== filters.domainCode) return false;
    if (filters.certificateId && !linkedCertificates.some(link => link.certificate.id === filters.certificateId)) return false;
    const hasVocabulary = (item._count?.vocabularies ?? item.vocabularies?.length ?? 0) > 0;
    if (filters.vocabulary === 'with' && !hasVocabulary) return false;
    if (filters.vocabulary === 'without' && hasVocabulary) return false;
    if (!['all', 'with', 'without'].includes(filters.vocabulary) && !item.vocabularies?.some(link => link.vocabulary.id === filters.vocabulary)) return false;

    const searchText = [item.title, item.summary, item.domain?.name, item.domain?.code, item.level?.name, lessonTrackByType(item.type)?.label, ...(item.keyConcepts ?? []), ...linkedCertificates.flatMap(link => [link.certificate.name, link.certificate.code]), ...(item.vocabularies ?? []).map(link => link.vocabulary.term)].filter(Boolean).join(' ');
    return normalize(searchText).includes(normalize(filters.query));
  }).sort((a, b) => Number(b.level?.code === profile?.level?.code) - Number(a.level?.code === profile?.level?.code));
}
