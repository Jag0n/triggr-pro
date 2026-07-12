import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { TIMER_SEQUENCES, type Discipline } from '@/constants/events';
import { Radius, Spacing } from '@/constants/theme';
import { formatClock } from '@/lib/stats';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
}) {
  const { colors } = useTheme();
  return (
    <View style={stepperStyles.row}>
      <AppText variant="body" color="secondary" style={stepperStyles.label}>
        {label}
      </AppText>
      <View style={stepperStyles.controls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={[stepperStyles.btn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="remove" size={20} color={colors.text} />
        </Pressable>
        <AppText variant="heading" style={stepperStyles.value}>
          {format ? format(value) : String(value)}
        </AppText>
        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={[stepperStyles.btn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="add" size={20} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  btn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 56, textAlign: 'center', fontVariant: ['tabular-nums'] },
});

export default function TimerScreen() {
  const { colors } = useTheme();
  const { profile } = useAppState();

  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline ?? 'pistol');
  const [parSeconds, setParSeconds] = useState(9);
  const [parPrep, setParPrep] = useState(5);
  const [parReps, setParReps] = useState(10);

  const sequences = TIMER_SEQUENCES.filter(
    (s) => s.discipline === 'both' || s.discipline === discipline,
  );

  return (
    <Screen
      tabScreen
      title="Match timer"
      subtitle="Range commands and rhythm training, spoken aloud."
    >
      <Segmented
        options={[
          { value: 'pistol', label: 'Pistol' },
          { value: 'rifle', label: 'Rifle' },
        ]}
        value={discipline}
        onChange={setDiscipline}
      />

      <AppText variant="heading">Match formats</AppText>
      <View style={styles.list}>
        {sequences.map((seq) => {
          const totalSec = seq.steps.reduce((a, s) => a + s.seconds, 0);
          return (
            <Card
              key={seq.id}
              onPress={() => router.push({ pathname: '/timer/run', params: { sequence: seq.id } })}
            >
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="megaphone-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.info}>
                  <AppText variant="heading">{seq.name}</AppText>
                  <AppText variant="caption" color="secondary">
                    {seq.description}
                  </AppText>
                </View>
                <AppText variant="caption" color="faint">
                  {formatClock(totalSec)}
                </AppText>
              </View>
            </Card>
          );
        })}
      </View>

      <AppText variant="heading">Par timer</AppText>
      <Card>
        <View style={styles.parBody}>
          <AppText variant="caption" color="secondary">
            Build your shot rhythm: a start beep, then a stop beep at your par time. Elite air
            pistol shooters release inside ~9 seconds.
          </AppText>
          <Stepper
            label="Par time"
            value={parSeconds}
            onChange={setParSeconds}
            min={2}
            max={60}
            step={1}
            format={(v) => `${v}s`}
          />
          <Stepper
            label="Prep before beep"
            value={parPrep}
            onChange={setParPrep}
            min={2}
            max={30}
            step={1}
            format={(v) => `${v}s`}
          />
          <Stepper
            label="Repetitions"
            value={parReps}
            onChange={setParReps}
            min={1}
            max={60}
            step={1}
          />
          <Button
            label="Start par timer"
            icon="play"
            size="lg"
            onPress={() =>
              router.push({
                pathname: '/timer/run',
                params: { par: String(parSeconds), prep: String(parPrep), reps: String(parReps) },
              })
            }
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  parBody: { gap: Spacing.three },
});
