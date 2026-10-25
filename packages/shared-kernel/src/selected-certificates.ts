type Certificate = { id: string; name?: string; code?: string; provider?: string; isActive?: boolean; domains?: any[] };
type Goal = { certificateId?: string; certificate?: Certificate | null };

export function selectedCertificates(catalog: Certificate[], goals: Goal[] | null | undefined) {
  const byId = new Map(catalog.map(item => [item.id, item]));
  const selected = new Map<string, Certificate>();
  for (const goal of goals ?? []) {
    const id = goal.certificateId ?? goal.certificate?.id;
    if (!id) continue;
    const certificate = byId.get(id) ?? (goal.certificate?.id === id ? goal.certificate : null);
    if (certificate && certificate.isActive !== false) selected.set(id, certificate);
  }
  return [...selected.values()];
}
