const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

// Use the range position: the same word can occur several times with different meanings.
export function getSelectionContext(range: Range, content: Element): string {
  const ancestor = range.commonAncestorContainer;
  const element = ancestor.nodeType === 1 ? ancestor as Element : ancestor.parentElement;
  const block = element?.closest('p, li, h1, h2, h3, h4, td, blockquote');
  const container = block && content.contains(block) ? block : content;
  const before = range.cloneRange();
  before.selectNodeContents(container);
  before.setEnd(range.startContainer, range.startOffset);
  const after = range.cloneRange();
  after.selectNodeContents(container);
  after.setStart(range.endContainer, range.endOffset);
  const selected = normalize(range.toString());
  const prefix = normalize(before.toString()).slice(-500);
  const suffix = normalize(after.toString()).slice(0, Math.max(0, 1600 - prefix.length - selected.length - 2));
  return [prefix, selected, suffix].filter(Boolean).join(' ').slice(0, 1600);
}
