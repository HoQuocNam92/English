import { compactTextSize } from './font-styles';
import { matchesFilterOption } from '../utils/filter-options';
import { useRef, useState, type ComponentRef } from 'react';
import { FlatList, Keyboard, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Text, TouchableOpacity } from './primitives';
import { MaterialIcons } from './AppIcon';

export function FilterSelect({ label, value, items, onChange }: { label: string; value: string; items: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const anchor = useRef<ComponentRef<typeof View>>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 16, width: 280 });
  const { height, width } = useWindowDimensions();
  const selected = items.find(item => item.value === value)?.label || 'Tất cả';
  const close = () => { setOpen(false); setQuery(''); };
  const menuHeight = Math.min(360, height * 0.55, 118 + items.length * 50);
  const show = () => {
    Keyboard.dismiss();
    anchor.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      const menuWidth = Math.min(width - 32, Math.max(280, measuredWidth));
      const below = y + measuredHeight + 8;
      const top = below + menuHeight <= height - 24 ? below : Math.max(32, y - menuHeight - 8);
      setPosition({ top, left: Math.max(16, Math.min(x, width - menuWidth - 16)), width: menuWidth });
      setQuery(''); setOpen(true);
    });
  };
  const visible = items.filter(item => matchesFilterOption(item.label, query));
  return <>
    <View ref={anchor} collapsable={false} style={s.anchor}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity accessibilityLabel={`${label}: ${selected}`} accessibilityState={{ expanded: open }} onPress={show} style={[s.trigger, open && s.focused]}>
        <Text numberOfLines={1} style={[s.value, value !== '' && s.selectedValue]}>{selected}</Text><MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={20} color={open ? '#3525cd' : '#59657c'} />
      </TouchableOpacity>
    </View>
    <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
      <View style={{ flex: 1 }}>
        <Pressable accessibilityLabel="Đóng danh sách lựa chọn" onPress={close} style={s.backdrop} />
        <View accessibilityViewIsModal style={[s.menu, position, { maxHeight: menuHeight, top: Math.min(position.top, Math.max(32, height - menuHeight - 16)) }]}>
          <View style={s.menuHeader}><Text style={s.menuTitle}>{label}</Text><TouchableOpacity accessibilityLabel="Đóng" onPress={close} style={s.close}><MaterialIcons name="close" size={18} color="#59657c" /></TouchableOpacity></View>
          <Searchbar accessibilityLabel={`Tìm ${label.toLocaleLowerCase('vi')}`} placeholder="Tìm trong danh sách…" value={query} onChangeText={setQuery} style={s.search} inputStyle={{ minHeight: 44, fontSize: compactTextSize(14) }} iconColor="#777587" />
          <FlatList style={{ flexGrow: 0, maxHeight: Math.max(80, menuHeight - 112) }} data={visible} keyExtractor={item => item.value} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 6 }} renderItem={({ item }) => <TouchableOpacity accessibilityRole="menuitem" accessibilityState={{ selected: item.value === value }} onPress={() => { onChange(item.value); close(); }} style={[s.option, item.value === value && s.selectedOption]}><Text style={[s.optionText, item.value === value && s.selectedValue]}>{item.label}</Text>{item.value === value && <MaterialIcons name="check" size={18} color="#3525cd" />}</TouchableOpacity>} ListEmptyComponent={<Text style={{ padding: 16, color: '#59657c' }}>Không có lựa chọn phù hợp.</Text>} />
        </View>
      </View>
    </Modal>
  </>;
}
const s = StyleSheet.create({
  anchor: { flexGrow: 1, flexShrink: 1, minWidth: 140, gap: 6 }, label: { fontSize: 13, fontWeight: '600', color: '#59657c' },
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, borderWidth: 1, borderColor: '#d8d5e8', borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#fff' }, focused: { borderColor: '#3525cd', backgroundColor: '#faf9ff' }, value: { flex: 1, fontSize: 14, color: '#17213a' }, selectedValue: { color: '#3525cd', fontWeight: '600' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#10182b14' }, menu: { position: 'absolute', borderWidth: 1, borderColor: '#ddd9ee', borderRadius: 16, backgroundColor: '#fff', elevation: 16, shadowColor: '#17213a', shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, overflow: 'hidden' }, menuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14, paddingRight: 4 }, menuTitle: { fontSize: 13, fontWeight: '700' }, close: { width: 44, height: 44, alignItems: 'center' }, search: { borderWidth: 1, borderColor: '#ddd9ee', borderRadius: 10, marginHorizontal: 10, backgroundColor: '#fff', elevation: 0 }, option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 9 }, optionText: { flex: 1, fontSize: 14, color: '#17213a' }, selectedOption: { backgroundColor: '#eeecff' },
});
