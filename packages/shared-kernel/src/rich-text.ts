import { parseDocument } from 'htmlparser2';

export type RichTextNode = string | { tag: string; href?: string; children: RichTextNode[] };
const allowed = new Set(['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'blockquote', 'ol', 'ul', 'li', 'code', 'pre', 'a']);
const blocked = new Set(['script', 'style', 'iframe', 'object', 'svg', 'math', 'template']);

// Only recognize document markup; ordinary text such as "p95 < 200ms" stays literal.
export function isRichText(value: string): boolean {
  return /<(?:p|h[23]|ol|ul|blockquote|pre)(?:\s[^>]*)?>/i.test(value);
}

export function safeRichTextLink(value?: string): string | undefined {
  return value && /^(https?:\/\/|mailto:)/i.test(value.trim()) ? value.trim() : undefined;
}

export function parseRichText(value: string): RichTextNode[] {
  if (!isRichText(value)) return [value];
  const walk = (nodes: ReturnType<typeof parseDocument>['children']): RichTextNode[] => nodes.flatMap((node): RichTextNode[] => {
    if (node.type === 'text') return [node.data];
    if (!('name' in node) || !('children' in node) || blocked.has(node.name)) return [];
    const children = walk(node.children);
    if (!allowed.has(node.name)) return children;
    return [{ tag: node.name, href: node.name === 'a' ? safeRichTextLink(node.attribs.href) : undefined, children }];
  });
  return walk(parseDocument(value).children);
}

export function richTextToPlainText(value: string): string {
  const text = (nodes: RichTextNode[]): string => nodes.map(node => typeof node === 'string' ? node : `${text(node.children)}${['p', 'br', 'li', 'h2', 'h3', 'blockquote', 'pre'].includes(node.tag) ? '\n' : ''}`).join('');
  return text(parseRichText(value)).trim();
}
