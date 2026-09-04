import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/shared/store/theme-context';
import { useI18n } from '../../src/shared/store/i18n-context';

export default function TabsLayout() {
  const { colors } = useTheme();
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
          height: 60,
          paddingBottom: 8,
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
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: t.tabLearning,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t.tabPractice,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="quiz" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t.tabProgress,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="trending-up" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabProfile,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
