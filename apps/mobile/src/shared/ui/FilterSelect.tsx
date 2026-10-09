import { useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Dialog, Portal, RadioButton, Searchbar, TouchableRipple, Icon } from 'react-native-paper';
import { Text, Button } from './primitives';

export function FilterSelect({ label, value, items, onChange }: { label: string; value: string; items: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { height } = useWindowDimensions();
  const selected = items.find(item => item.value === value)?.label || 'Tất cả';
  const close = () => { setOpen(false); setQuery(''); };
  const visible = items.filter(item => item.label.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
  return <>
    <TouchableRipple accessibilityRole="button" accessibilityLabel={`${label}: ${selected}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={s.trigger} borderless>
      <View style={{ gap: 6 }}>
        <Text style={s.label}>{label}</Text>
        <View style={s.valueRow}><Text numberOfLines={2} style={s.value}>{selected}</Text><Icon source="chevron-down" size={22} color="#59657c" /></View>
      </View>
    </TouchableRipple>
    <Portal><Dialog visible={open} onDismiss={close} style={{ backgroundColor: '#ffffff', borderRadius: 24 }}>
      <Dialog.Title>{label}</Dialog.Title>
      {items.length > 8 && <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}><Searchbar accessibilityLabel={`Tìm ${label.toLocaleLowerCase('vi')}`} placeholder="Tìm lựa chọn…" value={query} onChangeText={setQuery} inputStyle={{ minHeight: 48, fontSize: 15 }} style={{ backgroundColor: '#f0f2f8' }} /></View>}
      <Dialog.ScrollArea style={{ maxHeight: height * 0.5, paddingHorizontal: 4 }}>
        <RadioButton.Group value={value} onValueChange={next => { onChange(next); close(); }}>
          <FlatList data={visible} keyExtractor={item => item.value} keyboardShouldPersistTaps="handled" renderItem={({ item }) => <RadioButton.Item value={item.value} label={item.label} labelStyle={{ fontSize: 15, lineHeight: 22 }} labelMaxFontSizeMultiplier={2} position="trailing" style={{ paddingVertical: 8 }} />} ListEmptyComponent={<Text style={{ padding: 20 }}>Không có lựa chọn phù hợp.</Text>} />
        </RadioButton.Group>
      </Dialog.ScrollArea>
      <Dialog.Actions><Button mode="text" onPress={close}>Đóng</Button></Dialog.Actions>
    </Dialog></Portal>
  </>;
}
const s = StyleSheet.create({
  trigger: { flexGrow: 1, flexShrink: 1, minWidth: 140, minHeight: 84, borderWidth: 1, borderColor: '#e4e8f1', borderRadius: 16, padding: 16, backgroundColor: '#ffffff', justifyContent: 'center', overflow: 'hidden' },
  label: { fontSize: 13, color: '#59657c' }, valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, value: { flex: 1, fontSize: 15, fontWeight: '600', color: '#17213a' },
});
