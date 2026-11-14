import { StyleSheet, View } from 'react-native';
import { Text } from '../../shared/ui/primitives';

export function FlashcardSessionScore({ completed, total, batches, answers, selfReportedCount, colors }: {
  completed: number; total: number; batches: number;
  answers: Array<{ correct: boolean }>; selfReportedCount: number;
  colors: { onSurface: string; onSurfaceVariant: string };
}) {
  const correct = answers.filter(answer => answer.correct).length;
  const completion = total > 0 ? completed / total : 0;
  const title = answers.length > 0 ? 'Đã hoàn thành bài kiểm tra'
    : completed > 0 ? 'Đã hoàn thành phiên học' : 'Chưa có kết quả';
  return <View style={styles.container}>
    <View style={[styles.circle, { borderColor: completion >= .8 ? '#15803d' : completion >= .5 ? '#b45309' : '#b91c1c' }]}>
      <Text style={styles.emoji} accessible={false}>{completion >= .8 ? '🎉' : '📚'}</Text>
      <Text style={[styles.score, { color: colors.onSurface }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.5}>{completed}/{total}</Text>
    </View>
    <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Từ hoàn tất trong phiên</Text>
    <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
    <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{batches} đợt học{answers.length > 0 ? ` · ${correct}/${answers.length} lượt trả lời đúng` : ''}</Text>
    {selfReportedCount > 0 && <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{selfReportedCount} từ tự đánh dấu đã biết</Text>}
    {answers.length === 0 && <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>Phiên này chưa có kết quả kiểm tra.</Text>}
  </View>;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', gap: 12 },
  circle: { width: 160, height: 160, borderRadius: 80, borderWidth: 5, padding: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  emoji: { fontSize: 28 },
  score: { width: '100%', fontSize: 32, fontWeight: '900', textAlign: 'center' },
  label: { fontSize: 13, textAlign: 'center', flexShrink: 1, paddingHorizontal: 4 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', maxWidth: '100%', flexShrink: 1 },
  description: { fontSize: 14, textAlign: 'center', maxWidth: '100%', flexShrink: 1 },
});
