import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth';
import { useTheme } from '@/providers/theme';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { cloudAvailable, signInWithEmail, signUpWithEmail, signInWithGoogle, continueAsGuest } =
    useAuth();

  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleEmailSubmit() {
    if (!email.trim() || password.length < 6) {
      setError('Enter your email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    const err = isSignUp
      ? await signUpWithEmail(email.trim(), password)
      : await signInWithEmail(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace('/');
  }

  async function handleGoogle() {
    setError(null);
    const err = await signInWithGoogle();
    if (err) setError(err);
  }

  function handleGuest() {
    continueAsGuest();
    router.replace('/');
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.toggleCorner}>
          <ThemeToggle />
        </View>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.hero}>
                <View style={[styles.logoRing, { borderColor: colors.accent }]}>
                  <View style={[styles.logoDot, { backgroundColor: colors.accent }]} />
                </View>
                <AppText variant="display" style={styles.wordmark}>
                  TRIGGR
                </AppText>
                <AppText variant="body" color="secondary" style={styles.tagline}>
                  The shooter&apos;s operating system.{'\n'}Train. Log. Improve.
                </AppText>
              </View>

              <View style={styles.actions}>
                {cloudAvailable ? (
                  <>
                    <Button
                      label="Continue with Google"
                      icon="logo-google"
                      variant="secondary"
                      size="lg"
                      onPress={() => void handleGoogle()}
                    />
                    {showEmail ? (
                      <View style={styles.emailForm}>
                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          placeholder="Email"
                          placeholderTextColor={colors.textFaint}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          style={[
                            styles.input,
                            {
                              backgroundColor: colors.surface,
                              color: colors.text,
                              borderColor: colors.border,
                            },
                          ]}
                        />
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Password"
                          placeholderTextColor={colors.textFaint}
                          secureTextEntry
                          style={[
                            styles.input,
                            {
                              backgroundColor: colors.surface,
                              color: colors.text,
                              borderColor: colors.border,
                            },
                          ]}
                        />
                        <Button
                          label={isSignUp ? 'Create account' : 'Sign in'}
                          size="lg"
                          loading={busy}
                          onPress={() => void handleEmailSubmit()}
                        />
                        <Pressable onPress={() => setIsSignUp((v) => !v)}>
                          <AppText variant="caption" color="secondary" style={styles.center}>
                            {isSignUp
                              ? 'Already have an account? Sign in'
                              : 'New to Triggr? Create an account'}
                          </AppText>
                        </Pressable>
                      </View>
                    ) : (
                      <Button
                        label="Continue with Email"
                        icon="mail-outline"
                        size="lg"
                        onPress={() => setShowEmail(true)}
                      />
                    )}
                  </>
                ) : (
                  <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
                    <Ionicons name="cloud-offline-outline" size={18} color={colors.textSecondary} />
                    <AppText variant="caption" color="secondary" style={styles.noticeText}>
                      Cloud accounts are not set up yet — your data will be saved on this device
                      and can sync to an account later.
                    </AppText>
                  </View>
                )}

                {error ? (
                  <AppText variant="caption" color="danger" style={styles.center}>
                    {error}
                  </AppText>
                ) : null}

                <Button
                  label={cloudAvailable ? 'Continue without account' : 'Get started'}
                  variant={cloudAvailable ? 'ghost' : 'primary'}
                  size="lg"
                  onPress={handleGuest}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  toggleCorner: {
    position: 'absolute',
    top: Spacing.six,
    right: Spacing.three,
    zIndex: 10,
  },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
    paddingBottom: Spacing.five,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.six,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
  },
  wordmark: { letterSpacing: 6 },
  tagline: { textAlign: 'center' },
  actions: { gap: Spacing.three },
  emailForm: { gap: Spacing.two },
  input: {
    height: 54,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '500',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  noticeText: { flex: 1 },
  center: { textAlign: 'center' },
});
