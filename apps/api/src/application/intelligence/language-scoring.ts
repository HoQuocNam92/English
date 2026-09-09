export type ScoreBreakdown = {
  overallScore: number;
  technicalScore: number;
  grammarScore: number;
  clarityScore: number;
  vocabScore: number;
  suggestions: Array<{ type: string; text: string }>;
};

const TECHNICAL_TERMS = [
  'api', 'architecture', 'availability', 'backup', 'cache', 'ci/cd', 'cloud',
  'database', 'deploy', 'downtime', 'latency', 'monitoring', 'performance',
  'recovery', 'risk', 'scalability', 'security', 'server', 'sla', 'throughput',
];

const CONNECTORS = [
  'however', 'therefore', 'because', 'although', 'first', 'second', 'finally',
  'in addition', 'for example', 'as a result', 'on the other hand',
];

const clamp = (value: number, min = 0, max = 10) =>
  Math.round(Math.min(max, Math.max(min, value)) * 10) / 10;

const wordsOf = (text: string) =>
  text.trim().match(/[A-Za-z][A-Za-z0-9'/-]*/g)?.map((word) => word.toLowerCase()) ?? [];

export function scoreEnglishResponse(text: string, expectedKeywords: string[] = []): ScoreBreakdown {
  const words = wordsOf(text);
  const normalized = ` ${words.join(' ')} `;
  const sentences = text.split(/[.!?]+/).map((value) => value.trim()).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
  const uniqueRatio = words.length ? new Set(words).size / words.length : 0;
  const avgSentenceLength = sentences.length ? words.length / sentences.length : words.length;
  const startsWithCapital = sentences.filter((sentence) => /^[A-Z]/.test(sentence)).length;
  const sentenceCapitalRatio = sentences.length ? startsWithCapital / sentences.length : 0;
  const connectorCount = CONNECTORS.filter((term) => normalized.includes(` ${term} `)).length;
  const technicalCount = TECHNICAL_TERMS.filter((term) => normalized.includes(` ${term} `)).length;
  const expected = expectedKeywords.map((term) => term.toLowerCase()).filter(Boolean);
  const matchedExpected = expected.filter((term) => normalized.includes(` ${term} `)).length;

  const grammarScore = clamp(
    3 + Math.min(3, words.length / 40) + sentenceCapitalRatio * 2 +
      (/[.!?]\s*$/.test(text.trim()) ? 1 : 0) - (avgSentenceLength > 35 ? 1 : 0),
  );
  const clarityScore = clamp(
    3 + Math.min(2.5, sentences.length / 2) + Math.min(1.5, connectorCount * 0.5) +
      Math.min(1.5, paragraphs.length * 0.5) + (avgSentenceLength >= 7 && avgSentenceLength <= 28 ? 1.5 : 0),
  );
  const vocabScore = clamp(3 + uniqueRatio * 4 + Math.min(3, technicalCount * 0.6));
  const technicalScore = clamp(
    expected.length
      ? 3 + (matchedExpected / expected.length) * 5 + Math.min(2, technicalCount * 0.4)
      : 4 + Math.min(4, technicalCount * 0.7) + Math.min(2, words.length / 80),
  );
  const overallScore = clamp(
    grammarScore * 0.25 + clarityScore * 0.25 + vocabScore * 0.2 + technicalScore * 0.3,
  );

  const suggestions: ScoreBreakdown['suggestions'] = [];
  if (words.length < 60) suggestions.push({ type: 'detail', text: 'Phát triển câu trả lời với lý do, ví dụ thực tế và kết luận rõ ràng.' });
  if (sentenceCapitalRatio < 0.8) suggestions.push({ type: 'grammar', text: 'Viết hoa chữ đầu câu và kết thúc mỗi câu bằng dấu câu.' });
  if (connectorCount < 2) suggestions.push({ type: 'clarity', text: 'Dùng từ nối như however, therefore hoặc for example để liên kết các ý.' });
  if (technicalCount < 2) suggestions.push({ type: 'vocabulary', text: 'Bổ sung thuật ngữ kỹ thuật cụ thể và dùng chúng trong đúng ngữ cảnh.' });
  if (expected.length && matchedExpected / expected.length < 0.5) suggestions.push({ type: 'technical', text: `Cần đề cập thêm các ý chính: ${expected.filter((term) => !normalized.includes(` ${term} `)).slice(0, 4).join(', ')}.` });
  if (!suggestions.length) suggestions.push({ type: 'strength', text: 'Câu trả lời có cấu trúc tốt, rõ ràng và sử dụng từ vựng kỹ thuật phù hợp.' });

  return { overallScore, technicalScore, grammarScore, clarityScore, vocabScore, suggestions };
}

export function buildFeedback(scores: ScoreBreakdown) {
  const strengths = [
    ['nội dung kỹ thuật', scores.technicalScore],
    ['ngữ pháp', scores.grammarScore],
    ['độ rõ ràng', scores.clarityScore],
    ['từ vựng', scores.vocabScore],
  ].sort((a, b) => Number(b[1]) - Number(a[1]));
  return `Điểm mạnh nhất: ${strengths[0][0]} (${strengths[0][1]}/10). ${scores.suggestions.map((item) => item.text).join(' ')}`;
}
