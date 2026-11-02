// Conservative: use lesson-linked terms, never turn every English word into an IT term.
const ordinary = new Set(['team', 'reference', 'domain', 'object', 'capacity', 'region', 'resource', 'application', 'type', 'state', 'target', 'record', 'value', 'source', 'role', 'policy', 'key', 'model', 'change', 'control', 'result', 'user', 'condition', 'responsibility', 'constant', 'fix', 'extract', 'transform', 'load', 'feature', 'label', 'precision', 'recall', 'salt', 'span', 'promise', 'reservation', 'convergence', 'cancellation']);
const reviewedTerms = new Set(['elasticity', 'agility', 'high availability', 'availability zone', 'amazon s3', 'amazon ebs']);
const trusted = v => reviewedTerms.has(v.term.toLowerCase()) || v.tags?.some(t => t === 'airflow' || t === 'reviewed-meaning' || /^(software-|focused-)/.test(t));
const standalone = new Set('database cache browser repository server json dns tcp udp aws etl elt dataset timeout idempotency backpressure authentication authorization phishing backup failover runbook credential session subnet router switch checkpointing backfill overfitting rollback refactoring pagination concurrency throughput bottleneck reconciliation redelivery acknowledgement configuration deployment elasticity agility'.split(' '));
const contextRules = { feature: /model|train|dataset|learn|prediction/i, label: /model|train|dataset|learn|prediction/i, precision: /model|classif|prediction/i, recall: /model|classif|prediction/i, span: /trace|tracing|telemetry/i, salt: /password|hash/i, promise: /async|javascript|resolve|reject/i };
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function buildAnnotations(text, vocabulary, globalVocabulary = []) {
  const annotations = [];
  const candidates = [...globalVocabulary.filter(v => v.status === 'published' && trusted(v) && (/\s|-/u.test(v.term) || standalone.has(v.term.toLowerCase()))), ...vocabulary.filter(v => trusted(v) && v.status !== 'draft')];
  const words = [...new Map(candidates.map(v => [v.term.toLowerCase(), v])).values()].filter(v => v.definitionVi?.trim() && (!ordinary.has(v.term.toLowerCase()) || contextRules[v.term.toLowerCase()]?.test(text))).sort((a,b) => b.term.length-a.term.length);
  for (const word of words) {
    const parts = word.term.trim().split(/[\s-]+/).map(escape);
    // Match regular plurals and hyphen/space variants; never substrings of other words.
    const last = parts.pop();
    const plural = /[^aeiou]y$/i.test(last) ? `(?:${last}|${last.slice(0,-1)}ies)` : `(?:${last}|${last}(?:s|es))`;
    const pattern = [...parts, plural].join('[\\s-]+');
    const matcher = new RegExp(`(?<![\\p{L}\\p{N}_])${pattern}(?![\\p{L}\\p{N}_])`, 'giu');
    for (const match of text.matchAll(matcher)) {
      const start = match.index, end = start + match[0].length;
      if (annotations.some(a => start < a.end && end > a.start)) continue;
      // One representative occurrence per term keeps the paragraph readable.
      annotations.push({ start, end, term: match[0], ...(word.status === 'published' ? { vocabularyId: word.id } : {}), definitionVi: word.definitionVi, definitionEn: word.definitionEn });
      break;
    }
  }
  return annotations.sort((a,b)=>a.start-b.start);
}
module.exports = { buildAnnotations };
