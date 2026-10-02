import StructureForm from './StructureForm';

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; domainId?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <StructureForm certificateId={id} mode={query.mode === 'topic' ? 'topic' : 'domain'} initialDomainId={query.domainId ?? ''} />;
}
