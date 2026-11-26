'use client';

type Annotation = { start: number; end: number; term: string; definitionVi: string; definitionEn?: string; partOfSpeech?: string; pronunciationIpa?: string; contextDependent?: boolean; contextExplanation?: string; standaloneMeaning?: string; sourceSentence?: string };
export function ReadingGlossary({ text, glossary }: { text: string; glossary?: unknown }) {
  const data = glossary as { text?: string; annotations?: Annotation[] } | undefined;
  if (data?.text !== text || !Array.isArray(data.annotations)) return <>{text}</>;
  const parts = [];
  let cursor = 0;
  for (const [index, item] of data.annotations.entries()) {
    if (item.contextDependent !== true || !item.standaloneMeaning || !item.sourceSentence || !text.includes(item.sourceSentence) || !Number.isInteger(item.start) || !Number.isInteger(item.end) || item.start < cursor || item.end > text.length || item.end <= item.start || text.slice(item.start, item.end) !== item.term || typeof item.definitionVi !== 'string') continue;
    parts.push(text.slice(cursor, item.start));
    parts.push(<button key={index} data-it-glossary type="button" aria-label={`Xem nghĩa theo ngữ cảnh: ${item.term}`} onClick={() => {
      window.dispatchEvent(new CustomEvent('reading-lookup', { detail: { text: item.term, context: text.slice(Math.max(0, item.start - 500), Math.max(0, item.start - 500) + 1600), result: { translation: item.definitionVi, definitionEn: item.definitionEn, partOfSpeech: item.partOfSpeech, pronunciationIpa: item.pronunciationIpa, contextExplanation: item.contextExplanation, standaloneMeaning: item.standaloneMeaning, sourceSentence: item.sourceSentence, contextDependent: true, source: 'reading', contextual: true } } }));
    }} className="cursor-pointer bg-transparent p-0 font-normal text-inherit underline decoration-current underline-offset-4 hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{item.term}</button>);
    cursor = item.end;
  }
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}
