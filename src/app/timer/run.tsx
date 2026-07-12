import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { getTimerSequence, type TimerStep } from '@/constants/events';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { formatClock } from '@/lib/stats';
import { beepStart, beepStop, beepTick, speak, stopSpeech, tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

function buildParSteps(par: number, prep: number, reps: number): TimerStep[] {
  const steps: TimerStep[] = [
    { label: 'GET READY', announce: 'Par timer. Get ready.', seconds: 3, tone: 'prep' },
  ];
  for (let i = 1; i <= reps; i++) {
    steps.push({ label: `REP ${i} — PREP`, seconds: prep, tone: 'hold' });
    steps.push({ label: `REP ${i} — FIRE`, seconds: par, tone: 'fire' });
  }
  return steps;
}

function announceRemaining(seconds: number) {
  if (seconds >= 120) speak(`${Math.round(seconds / 60)} minutes remaining.`);
  else if (seconds >= 60) speak('One minute remaining.');
  else speak(`${seconds} seconds remaining.`);
}

export default function TimerRunScreen() {
  useKeepAwake();
  const { colors, scheme } = useTheme();
  const params = useLocalSearchParams<{
    sequence?: string;
    par?: string;
    prep?: string;
    reps?: string;
  }>();

  const sequence = params.sequence ? getTimerSequence(params.sequence) : undefined;
  const steps = useMemo<TimerStep[]>(() => {
    if (sequence) return sequence.steps;
    const par = Number(params.par ?? 9);
    const prep = Number(params.prep ?? 5);
    const reps = Number(params.reps ?? 10);
    return buildParSteps(par, prep, reps);
  }, [sequence, params.par, params.prep, params.reps]);

  const title = sequence?.name ?? 'Par timer';

  const [stepIndex, setStepIndex] = useState(-1); // -1 = not started
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);

  const endAtRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef(0);
  const firedWarningsRef = useRef<Set<number>>(new Set());
  const stepIndexRef = useRef(-1);

  function enterStep(index: number) {
    stopSpeech();
    if (index >= steps.length) {
      setDone(true);
      endAtRef.current = null;
      beepStop();
      speak('Complete. Well done.');
      return;
    }
    const step = steps[index];
    stepIndexRef.current = index;
    setStepIndex(index);
    firedWarningsRef.current = new Set();
    if (step.tone === 'fire') beepStart();
    else if (step.tone === 'hold') beepStop();
    else beepTick();
    if (step.announce) speak(step.announce);
    if (step.seconds <= 0) {
      // Announce-only step: show it briefly, then advance.
      endAtRef.current = Date.now() + 2500;
      setRemaining(0);
    } else {
      endAtRef.current = Date.now() + step.seconds * 1000;
      setRemaining(step.seconds);
    }
  }

  function start() {
    enterStep(0);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (paused || done || endAtRef.current === null) return;
      const msLeft = endAtRef.current - Date.now();
      const secLeft = msLeft / 1000;
      setRemaining(Math.max(0, secLeft));

      const idx = stepIndexRef.current;
      const step = idx >= 0 ? steps[idx] : undefined;
      if (step?.warnings) {
        for (const w of step.warnings) {
          if (secLeft <= w && secLeft > w - 1 && !firedWarningsRef.current.has(w)) {
            firedWarningsRef.current.add(w);
            announceRemaining(w);
          }
        }
      }

      if (msLeft <= 0) enterStep(idx + 1);
    }, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, done, steps]);

  // Stop speech when leaving the screen.
  useEffect(() => () => stopSpeech(), []);

  function togglePause() {
    tapFeedback();
    if (paused) {
      endAtRef.current = Date.now() + pausedRemainingRef.current * 1000;
      setPaused(false);
    } else {
      pausedRemainingRef.current = remaining;
      setPaused(true);
      stopSpeech();
    }
  }

  function skip() {
    tapFeedback();
    if (done) return;
    enterStep(stepIndexRef.current + 1);
  }

  function exit() {
    stopSpeech();
    router.back();
  }

  const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : undefined;
  const toneColor = !step
    ? colors.textSecondary
    : step.tone === 'fire'
      ? colors.success
      : step.tone === 'hold'
        ? colors.danger
        : colors.textSecondary;
  const toneBg = !step
    ? 'transparent'
    : step.tone === 'fire'
      ? colors.successSoft
      : step.tone === 'hold'
        ? colors.dangerSoft
        : 'transparent';

  const started = stepIndex >= 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: toneBg }]} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.contentWrap}>
          <View style={styles.content}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <Pressable onPress={exit} style={styles.iconBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
              <AppText variant="label" color="secondary">
                {title.toUpperCase()}
              </AppText>
              <View style={styles.iconBtn} />
            </View>

            {/* Main display */}
            <View style={styles.main}>
              {done ? (
                <>
                  <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                  <AppText variant="title">Complete</AppText>
                  <AppText variant="body" color="secondary">
                    Good work. Rhythm builds results.
                  </AppText>
                </>
              ) : !started ? (
                <>
                  <AppText variant="heading" color="secondary" style={styles.centerText}>
                    {steps.length} phases ·{' '}
                    {formatClock(steps.reduce((a, s) => a + s.seconds, 0))} total
                  </AppText>
                  <AppText variant="caption" color="faint" style={styles.centerText}>
                    Commands are spoken aloud — turn your volume up.
                  </AppText>
                </>
              ) : (
                <>
                  <AppText variant="label" style={[styles.phaseLabel, { color: toneColor }]}>
                    {step?.label}
                  </AppText>
                  <AppText
                    variant="display"
                    style={[styles.clock, paused && { color: colors.textFaint }]}
                  >
                    {formatClock(remaining)}
                  </AppText>
                  <AppText variant="caption" color="faint">
                    Phase {stepIndex + 1} of {steps.length}
                    {stepIndex + 1 < steps.length ? ` · next: ${steps[stepIndex + 1].label}` : ''}
                  </AppText>
                </>
              )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {!started && !done ? (
                <Pressable
                  onPress={start}
                  style={[styles.bigStart, { backgroundColor: colors.accent }]}
                >
                  <Ionicons name="play" size={34} color={colors.onAccent} />
                </Pressable>
              ) : done ? (
                <Pressable
                  onPress={exit}
                  style={[styles.bigStart, { backgroundColor: colors.accent }]}
                >
                  <Ionicons name="checkmark" size={34} color={colors.onAccent} />
                </Pressable>
              ) : (
                <View style={styles.controlRow}>
                  <Pressable
                    onPress={skip}
                    style={[styles.smallBtn, { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Ionicons name="play-skip-forward" size={22} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={togglePause}
                    style={[styles.bigStart, { backgroundColor: colors.accent }]}
                  >
                    <Ionicons name={paused ? 'play' : 'pause'} size={34} color={colors.onAccent} />
                  </Pressable>
                  <Pressable
                    onPress={exit}
                    style={[styles.smallBtn, { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Ionicons name="stop" size={22} color={colors.danger} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  contentWrap: { flex: 1, alignItems: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  phaseLabel: { fontSize: 16, letterSpacing: 2 },
  clock: { fontSize: 88, lineHeight: 96 },
  centerText: { textAlign: 'center' },
  controls: { paddingBottom: Spacing.six, alignItems: 'center' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  bigStart: {
    width: 84,
    height: 84,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
