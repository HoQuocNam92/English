import { Button } from 'react-native-paper';

export function ClearFiltersButton({ onPress }: { onPress: () => void }) {
  return <Button mode="text" compact onPress={onPress} accessibilityLabel="Xóa lọc" style={{ alignSelf: 'flex-start', borderRadius: 10 }} contentStyle={{ minHeight: 44 }} labelStyle={{ fontSize: 12, fontWeight: '600' }}>Xóa lọc</Button>;
}
