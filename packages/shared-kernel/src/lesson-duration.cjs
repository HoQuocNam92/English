/** Study estimate, not actual tracked study time. Ignore URLs and HTML markup. */
function estimateLessonMinutes(sections = [], summary = '') {
  const values = [];
  let vocabulary = 0;
  let code = 0;
  const visit = value => {
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => {
      if (!['url', 'audioUrl', 'imageUrl', 'source', 'id', 'language'].includes(key)) visit(item);
    });
  };
  for (const section of sections) {
    if (section.type === 'vocabulary_list') vocabulary++;
    if (section.type === 'code') code++;
    visit(section.content);
  }
  if (!values.length) visit(summary);
  const text = [...new Set(values)].join(' ').replace(/<[^>]*>/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(480, Math.max(1, Math.ceil(words / 160 + vocabulary * 0.5 + code)));
}
module.exports = { estimateLessonMinutes };
