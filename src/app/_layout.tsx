import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppStateProvider } from '@/providers/app-state';
import { AuthProvider } from '@/providers/auth';
import { ThemeProvider, useTheme } from '@/providers/theme';

function ThemedApp() {
  const { colors, scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="session/log" options={{ gestureEnabled: false }} />
        <Stack.Screen name="session/[id]" />
        <Stack.Screen name="timer/run" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppStateProvider>
          <ThemedApp />
        </AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
