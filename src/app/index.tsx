import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAppState } from '@/providers/app-state';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/providers/theme';

/** Entry gate: welcome → onboarding → app, based on persisted state. */
export default function Index() {
  const { colors } = useTheme();
  const { ready, authenticated } = useAuth();
  const { hydrated, profile } = useAppState();

  if (!ready || !hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!authenticated) return <Redirect href="/welcome" />;
  if (!profile?.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
