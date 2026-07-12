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
import { eventsForDiscipline, type Discipline } from '@/constants/events';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { successFeedback } from '@/lib/sound';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';

const DISCIPLINES: { value: Discipline; label: string; icon: 'radio-button-on' | 'scan' }[] = [
  { value: 'pistol', label: 'Pistol', icon: 'radio-button-on' },
  { value: 'rifle', label: 'Rifle', icon: 'scan' },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { setProfile } = useAppState();

  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const events = discipline ? eventsForDiscipline(discipline) : [];
  const canFinish = name.trim().length > 0 && discipline !== null && eventId !== null;

  function finish() {
    if (!canFinish || !discipline || !eventId) return;
    successFeedback();
    setProfile({
      name: name.trim(),
      discipline,
      primaryEventId: eventId,
      onboarded: true,
    });
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.header}>
                <AppText variant="title">Set up your lane</AppText>
                <AppText variant="body" color="secondary">
                  Three quick things and you&apos;re on the line.
                </AppText>
              </View>

              <View style={styles.section}>
                <AppText variant="label" color="secondary">
                  YOUR NAME
                </AppText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="What should we call you?"
                  placeholderTextColor={colors.textFaint}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.section}>
                <AppText variant="label" color="secondary">
                  DISCIPLINE
                </AppText>
                <View style={styles.disciplineRow}>
                  {DISCIPLINES.map((d) => {
                    const active = discipline === d.value;
                    return (
                      <Pressable
                        key={d.value}
                        onPress={() => {
                          setDiscipline(d.value);
                          setEventId(null);
                        }}
                        style={[
                          styles.disciplineCard,
                          {
                            backgroundColor: active ? colors.accentSoft : colors.surface,
                            borderColor: active ? colors.accent : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={d.icon}
                          size={30}
                          color={active ? colors.accent : colors.textSecondary}
                        />
                        <AppText variant="heading" color={active ? 'accent' : 'primary'}>
                          {d.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {discipline ? (
                <View style={styles.section}>
                  <AppText variant="label" color="secondary">
                    MAIN EVENT
                  </AppText>
                  <View style={styles.eventGrid}>
                    {events.map((e) => {
                      const active = eventId === e.id;
                      return (
                        <Pressable
                          key={e.id}
                          onPress={() => setEventId(e.id)}
                          style={[
                            styles.eventChip,
                            {
                              backgroundColor: active ? colors.accent : colors.surface,
                              borderColor: active ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <AppText
                            variant="label"
                            style={{ color: active ? colors.onAccent : colors.text }}
                          >
                            {e.name}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              <View style={styles.footer}>
                <Button
                  label="Start training"
                  icon="arrow-forward"
                  size="lg"
                  disabled={!canFinish}
                  onPress={finish}
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
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    gap: Spacing.four,
  },
  header: { gap: Spacing.one },
  section: { gap: Spacing.two },
  input: {
    height: 54,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '500',
  },
  disciplineRow: { flexDirection: 'row', gap: Spacing.two },
  disciplineCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  eventChip: {
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  footer: { marginTop: 'auto', paddingBottom: Spacing.five },
});
