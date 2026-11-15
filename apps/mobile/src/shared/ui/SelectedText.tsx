'use dom';

import React, { useEffect, useRef, useState } from 'react';
import { isRichText, parseRichText, type RichTextNode } from '../../../../../packages/shared-kernel/src/rich-text';

export default function SelectedText({ content, fontSize, lineHeight, color, fontWeight, monospace = false, onLookup, onOpenLink }: {
  content: string; fontSize: number; lineHeight: number; color: string; fontWeight: string; monospace?: boolean;
  onLookup: (text: string, context: string) => Promise<void>;
  onOpenLink: (href: string) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState('');
  useEffect(() => {
    const update = () => {
      const selection = window.getSelection();
      const inside = selection?.rangeCount && root.current?.contains(selection.getRangeAt(0).commonAncestorContainer);
      const value = inside ? selection!.toString().trim() : '';
      setSelected(value.length <= 120 ? value : '');
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, [content]);
  const render = (nodes: RichTextNode[]): React.ReactNode => nodes.map((node, index) => typeof node === 'string' ? node : node.tag === 'br' ? <br key={index} /> : React.createElement(node.tag, { key: index, ...(node.href ? { href: node.href, onClick: (event: React.MouseEvent) => { event.preventDefault(); void onOpenLink(node.href!); } } : {}) }, render(node.children)));
  return <>
    <style>{`html,body{margin:0;padding:0;background:transparent}*{box-sizing:border-box}p{margin:0 0 8px}a{color:#1d4ed8}::selection{background:#dcd6ff}button{font:inherit}`}</style>
    <div ref={root} style={{ fontFamily: monospace ? 'monospace' : 'system-ui,sans-serif', fontSize, lineHeight: `${lineHeight}px`, fontWeight, color, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', userSelect: 'text', WebkitUserSelect: 'text' }}>{render(!monospace && isRichText(content) ? parseRichText(content) : [content])}</div>
    {selected && <button type="button" onPointerDown={event => event.preventDefault()} onClick={() => {
      const value = selected;
      const context = root.current?.innerText ?? root.current?.textContent ?? '';
      window.getSelection()?.removeAllRanges(); setSelected('');
      void onLookup(value, context);
    }} style={{ marginTop: 8, minHeight: 40, padding: '8px 16px', background: '#3525cd', color: 'white', border: 0, borderRadius: 10 }}>Dịch “{selected}”</button>}
  </>;
}
