'use client';

import { useEffect, useRef, useState, type TextareaHTMLAttributes } from 'react';
import type Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { isRichText, richTextToPlainText } from '../../../../../packages/shared-kernel/src/rich-text';

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  value: string;
  onChange: (value: string) => void;
};

export function RichTextEditor({ value, onChange, className = '', placeholder, disabled, readOnly, required, minLength, maxLength, ...props }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<Quill | null>(null);
  const validation = useRef<HTMLTextAreaElement>(null);
  const latest = useRef({ value, onChange, maxLength });
  latest.current = { value, onChange, maxLength };
  const lastEmitted = useRef(value);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void import('quill').then(({ default: QuillClass }) => {
      if (cancelled || !host.current) return;
      const container = host.current;
      const element = document.createElement('div');
      container.replaceChildren(element);
      const quill = new QuillClass(element, {
        theme: 'snow',
        placeholder,
        formats: ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'link', 'code'],
        modules: { toolbar: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'code', 'link'], ['clean']], history: { userOnly: true } },
      });
      const initial = latest.current.value;
      if (isRichText(initial)) quill.setContents(quill.clipboard.convert({ html: initial }), 'silent');
      else quill.setText(initial, 'silent');
      lastEmitted.current = initial;
      quill.root.setAttribute('role', 'textbox');
      quill.root.setAttribute('aria-multiline', 'true');
      quill.root.setAttribute('aria-label', props['aria-label'] ?? placeholder ?? 'Nội dung');
      const changed = (_delta: unknown, old: ReturnType<Quill['getContents']>, source: string) => {
        if (source !== 'user') return;
        const html = quill.getText().trim() ? quill.getSemanticHTML() : '';
        // API limits apply to the stored string, including markup.
        if (latest.current.maxLength && html.length > latest.current.maxLength) {
          const range = quill.getSelection();
          quill.setContents(old, 'silent');
          if (range) quill.setSelection(Math.min(range.index, quill.getLength() - 1), 0, 'silent');
          setLimitReached(true);
          return;
        }
        setLimitReached(false);
        lastEmitted.current = html;
        latest.current.onChange(html);
      };
      quill.on('text-change', changed);
      editor.current = quill;
      setReady(true);
      cleanup = () => { quill.off('text-change', changed); editor.current = null; container.replaceChildren(); };
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; cleanup?.(); };
  }, []); // A single editor instance; controlled value updates below preserve the cursor.

  useEffect(() => {
    const quill = editor.current;
    if (!quill) return;
    quill.enable(!disabled && !readOnly);
    quill.root.dataset.placeholder = placeholder ?? '';
    quill.root.setAttribute('aria-required', String(Boolean(required)));
    quill.root.setAttribute('aria-invalid', String(Boolean(props['aria-invalid'])));
    if (value !== lastEmitted.current) {
      if (isRichText(value)) quill.setContents(quill.clipboard.convert({ html: value }), 'silent');
      else quill.setText(value, 'silent');
      lastEmitted.current = value;
      setLimitReached(false);
    }
  }, [value, ready, disabled, readOnly, placeholder, required, props['aria-invalid']]);

  useEffect(() => {
    const plain = richTextToPlainText(value);
    validation.current?.setCustomValidity(required && !plain.trim() ? 'Vui lòng nhập nội dung.' : minLength && plain.length < minLength && plain.length > 0 ? `Vui lòng nhập ít nhất ${minLength} ký tự.` : '');
  }, [value, ready, required, minLength]);

  return <div className={`rich-text-editor relative min-w-0 font-normal ${className}`}>
    <div ref={host} hidden={!ready} />
    {!ready && <textarea {...props} aria-label={props['aria-label'] ?? placeholder ?? 'Nội dung'} value={value} onChange={event => onChange(event.target.value)} placeholder={failed ? placeholder : 'Đang tải trình soạn thảo…'} disabled={disabled} readOnly={readOnly} required={required} minLength={minLength} maxLength={maxLength} className="min-h-28 w-full rounded-xl border border-outline-variant p-3" />}
    {ready && <textarea ref={validation} tabIndex={-1} aria-hidden="true" value={richTextToPlainText(value)} onChange={() => {}} required={required} disabled={disabled} onInvalid={() => editor.current?.focus()} className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0" />}
    {limitReached && <p role="status" className="mt-1 text-xs text-error">Nội dung vượt giới hạn lưu trữ {maxLength} ký tự (bao gồm định dạng).</p>}
  </div>;
}
