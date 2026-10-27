import assert from 'node:assert/strict';
import test from 'node:test';
import { isRichText, parseRichText, richTextToPlainText, safeRichTextLink } from './rich-text.ts';

test('legacy plain text and technical comparisons stay literal', () => {
  for (const value of ['p95 < 200ms; GET /v1/orders', 'Use <T> and A & B', 'Dòng 1\nDòng 2']) {
    assert.equal(isRichText(value), false);
    assert.deepEqual(parseRichText(value), [value]);
  }
});

test('Quill formatting, lists, entities and empty content survive parsing', () => {
  const value = '<h2>Đọc hiểu</h2><p><strong>A &amp; B</strong><br><em>Nội dung</em></p><ol><li>Một</li><li>Hai</li></ol>';
  assert.equal(richTextToPlainText(value), 'Đọc hiểu\nA & B\nNội dung\nMột\nHai');
  assert.equal(parseRichText(value)[0].tag, 'h2');
  assert.equal(richTextToPlainText('<p><br></p>'), '');
});

test('stored HTML cannot supply scripts, handlers, styles or unsafe URLs to renderers', () => {
  const nodes = parseRichText('<p onclick="evil()" style="color:red">Safe<script>evil()</script><svg><script>evil()</script></svg><img src=x onerror=evil()><a href="javascript:evil()">bad</a><a href="https://example.org">good</a></p>');
  const serialized = JSON.stringify(nodes);
  assert.ok(!serialized.includes('evil'));
  assert.ok(!serialized.includes('onclick'));
  assert.ok(!serialized.includes('style'));
  assert.ok(serialized.includes('https://example.org'));
  assert.equal(safeRichTextLink('data:text/html,bad'), undefined);
  assert.equal(safeRichTextLink('JaVaScRiPt:alert(1)'), undefined);
  assert.equal(safeRichTextLink('mailto:test@example.org'), 'mailto:test@example.org');
});
