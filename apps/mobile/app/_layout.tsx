import { NotificationNavigation } from '../src/shared/notifications/NotificationNavigation';
import { NotificationHistoryProvider } from '../src/shared/notifications/NotificationHistoryProvider';
import { Platform } from 'react-native';
import { MobileUIProvider } from '../src/shared/ui/paper-theme';
import { TranslationProvider } from '../src/shared/ui/TranslationProvider';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/shared/store/auth-context';
import { ThemeProvider } from '../src/shared/store/theme-context';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// expo-notifications push was removed from Expo Go in SDK 53+
// Only set up notifications in dev builds / standalone builds
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo && Platform.OS !== 'web') {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter: require('../assets/fonts/Inter.ttf'), ...Feather.font, ...MaterialIcons.font, ...MaterialCommunityIcons.font });
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
            <NotificationHistoryProvider><TranslationProvider><MobileUIProvider><Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: '#f7f9fb'
                }
              }}
            /><NotificationNavigation /></MobileUIProvider></TranslationProvider></NotificationHistoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
