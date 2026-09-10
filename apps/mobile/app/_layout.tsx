import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/shared/store/auth-context';
import { ThemeProvider } from '../src/shared/store/theme-context';
import { I18nProvider } from '../src/shared/store/i18n-context';
import { AiChatBubble } from '../src/shared/ui/AiChatBubble';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: '#f7f9fb'
                }
              }}
            />
            <AiChatBubble />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
