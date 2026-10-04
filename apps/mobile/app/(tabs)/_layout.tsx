import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '../../src/shared/ui/AppIcon';
import { useTheme } from '../../src/shared/store/theme-context';
import { useI18n } from '../../src/shared/store/i18n-context';
import { iconColors } from '@techenglish/design-tokens';

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ size }) => <MaterialIcons name="home" size={size} color={iconColors.home} />
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Bài học',
          tabBarIcon: ({ size, color }) => <MaterialIcons name="menu-book" size={size} color={iconColors.learning} />,
        }}
      />
      <Tabs.Screen name="practice" options={{ href: null }} />
      <Tabs.Screen name="certificates" options={{ title: "Chứng chỉ", tabBarIcon: ({ size }) => <MaterialIcons name="workspace-premium" size={size} color={iconColors.certificate} /> }} />
      <Tabs.Screen
        name="progress"
        options={{
          title: t.tabProgress,
          tabBarIcon: ({ size }) => <MaterialIcons name="trending-up" size={size} color={iconColors.progress} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabProfile,
          tabBarIcon: ({ size }) => <MaterialIcons name="person" size={size} color={iconColors.profile} />
        }}
      />
    </Tabs>
  );
}
