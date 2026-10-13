type Taxonomy = { id: string; code: string };
type ScopedQuestion = {
  domainId?: string | null;
  levelId?: string | null;
  domain?: { id?: string; code: string } | null;
  level?: { id?: string; code: string } | null;
};

// Prefer identity over labels, which may be duplicated across taxonomy records.
export function matchesExamScope(question: ScopedQuestion, domain?: Taxonomy, level?: Taxonomy) {
  const matches = (id: string | null | undefined, relation: { id?: string; code: string } | null | undefined, target?: Taxonomy) => {
    if (!target) return true;
    const actualId = id ?? relation?.id;
    return actualId ? actualId === target.id : relation?.code === target.code;
  };
  return matches(question.domainId, question.domain, domain) && matches(question.levelId, question.level, level);
}
