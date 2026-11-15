'use dom';

import React, { useEffect, useRef } from 'react';
import { isRichText, parseRichText, type RichTextNode } from '../../../../../packages/shared-kernel/src/rich-text';

export default function SelectedText({ content, fontSize, lineHeight, color, fontWeight, monospace = false, onSelection, onOpenLink }: {
  content: string; fontSize: number; lineHeight: number; color: string; fontWeight: string; monospace?: boolean;
  onSelection: (text: string, context: string, rect: { x: number; y: number; width: number; height: number } | null) => Promise<void>;
  onOpenLink: (href: string) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      const selection = window.getSelection();
      const inside = selection?.rangeCount && root.current?.contains(selection.getRangeAt(0).commonAncestorContainer);
      const value = inside ? selection!.toString().trim() : '';
      const range = inside ? selection!.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();
      if (!value || value.length > 120 || !rect || (!rect.width && !rect.height)) {
        void onSelection('', '', null); return;
      }
      void onSelection(value, root.current?.innerText ?? root.current?.textContent ?? '', { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    };
    const changed = () => { clearTimeout(timer); timer = setTimeout(update, 120); };
    document.addEventListener('selectionchange', changed);
    document.addEventListener('pointerup', changed);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', changed);
      document.removeEventListener('pointerup', changed);
      void onSelection('', '', null);
    };
  }, [content]);
  const render = (nodes: RichTextNode[]): React.ReactNode => nodes.map((node, index) => typeof node === 'string' ? node : node.tag === 'br' ? <br key={index} /> : React.createElement(node.tag, { key: index, ...(node.href ? { href: node.href, onClick: (event: React.MouseEvent) => { event.preventDefault(); void onOpenLink(node.href!); } } : {}) }, render(node.children)));
  return <div style={{ display: 'block', width: '100%', minWidth: 0 }}>
    <style>{`html,body,#root{display:block!important;width:100%;min-width:0;margin:0;padding:0;background:transparent}*{box-sizing:border-box}p{margin:0 0 8px}a{color:#1d4ed8}::selection{background:#dcd6ff}button{font:inherit}`}</style>
    <div ref={root} style={{ fontFamily: monospace ? 'monospace' : 'system-ui,sans-serif', fontSize, lineHeight: `${lineHeight}px`, fontWeight, color, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', userSelect: 'text', WebkitUserSelect: 'text' }}>{render(!monospace && isRichText(content) ? parseRichText(content) : [content])}</div>

  </div>;
}
