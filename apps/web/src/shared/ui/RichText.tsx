import { Fragment, type ReactNode } from 'react';
import { parseRichText, type RichTextNode } from '../../../../../packages/shared-kernel/src/rich-text';

// Build React elements from an allowlist instead of injecting stored HTML.
export function RichText({ text }: { text: ReactNode }) {
  if (typeof text !== 'string') return <>{text}</>;
  const render = (nodes: RichTextNode[], parentTag?: string): ReactNode => nodes.map((node, index) => {
    if (typeof node === 'string') return <Fragment key={index}>{node}</Fragment>;
    const children = render(node.children, node.tag);
    if (node.tag === 'a') return node.href ? <a key={index} href={node.href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a> : <Fragment key={index}>{children}</Fragment>;
    if (node.tag === 'br') return <br key={index} />;
    // Spans keep this safe to use inside existing paragraphs and table summaries.
    const styles: Record<string, string> = { p: 'block min-h-[1em]', h2: 'block text-xl font-bold', h3: 'block text-lg font-bold', strong: 'font-bold', em: 'italic', u: 'underline', s: 'line-through', blockquote: 'block border-l-4 border-current/20 pl-3 italic', ol: 'block', ul: 'block', li: 'list-item ml-5 list-disc', code: 'font-mono rounded bg-black/5 px-1', pre: 'block whitespace-pre-wrap font-mono' };
    return <span key={index} role={['ol', 'ul'].includes(node.tag) ? 'list' : node.tag === 'li' ? 'listitem' : undefined} style={node.tag === 'ol' ? { counterReset: 'list-item' } : node.tag === 'li' && parentTag === 'ol' ? { listStyleType: 'decimal' } : undefined} className={styles[node.tag]}>{children}</span>;
  });
  return <span className="rich-text whitespace-pre-wrap break-words">{render(parseRichText(text))}</span>;
}
