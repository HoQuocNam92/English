/** A short, single-paragraph excerpt; keep the selected phrase intact. */
function contextExcerpt(context, selection) {
  const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const phrase = normalize(selection);
  const paragraphs = String(context ?? '').split(/\r?\n/).map(normalize).filter(Boolean);
  const paragraph = paragraphs.find(value => phrase && value.toLowerCase().includes(phrase.toLowerCase())) ?? normalize(context);
  const index = phrase ? paragraph.toLowerCase().indexOf(phrase.toLowerCase()) : -1;
  const limit = Math.max(300, phrase.length);
  let start = index < 0 ? 0 : Math.max(0, index - Math.floor((limit - phrase.length) / 2));
  let end = Math.min(paragraph.length, start + limit);
  if (start > 0) {
    const boundary = paragraph.indexOf(' ', start);
    if (boundary >= 0 && boundary < index) start = boundary + 1;
  }
  if (end < paragraph.length) {
    const boundary = paragraph.lastIndexOf(' ', end);
    if (boundary >= (index < 0 ? start : index + phrase.length)) end = boundary;
  }
  const prefix = start > 0 ? '… ' : '';
  const suffix = end < paragraph.length ? ' …' : '';
  if (index < 0) return { before: prefix + paragraph.slice(start, end) + suffix, highlight: '', after: '' };
  return {
    before: prefix + paragraph.slice(start, index),
    highlight: paragraph.slice(index, index + phrase.length),
    after: paragraph.slice(index + phrase.length, end) + suffix,
  };
}
module.exports = { contextExcerpt };
