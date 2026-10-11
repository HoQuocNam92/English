import { Button } from 'react-native-paper';

export function ClearFiltersButton({ onPress }: { onPress: () => void }) {
  return <Button mode="outlined" onPress={onPress} accessibilityLabel="Xóa lọc" style={{ alignSelf: 'flex-start', borderRadius: 12, backgroundColor: '#ffffff' }} contentStyle={{ minHeight: 44 }} labelStyle={{ fontSize: 14, fontWeight: '700' }}>Xóa lọc</Button>;
}
