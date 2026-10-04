import { View } from 'react-native';
import { privacySections } from '../../../packages/shared-kernel/src/policies';
import { FeatureScreen } from '../src/shared/ui/FeatureScreen';
import { Text, controlStyles } from '../src/shared/ui/primitives';
export default function Policy() { return <FeatureScreen title="Chính sách bảo mật">{privacySections.map(([title, content]) => <View key={title} style={[controlStyles.card, { gap: 12, marginBottom: 12 }]}><Text style={{fontWeight:'700',fontSize:18}}>{title}</Text><Text>{content}</Text></View>)}</FeatureScreen>; }
