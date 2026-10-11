import { Text } from './primitives';

export function RequiredMark() {
  return <Text accessibilityLabel="Bắt buộc" style={{ color: '#ba1a1a' }}> *</Text>;
}
