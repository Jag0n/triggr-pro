import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
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
import { Card } from '@/components/card';
import { ScorePad } from '@/components/score-pad';
import { getEvent } from '@/constants/events';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { formatScore, round1, seriesTotal } from '@/lib/stats';
import { successFeedback } from '@/lib/sound';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';
import type { SessionKind } from '@/types/models';

function confirmDialog(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SessionLogScreen() {
  const { colors } = useTheme();
  const { addSession } = useAppState();
  const params = useLocalSearchParams<{ event: string; kind: SessionKind }>();

  const event = getEvent(params.event ?? '');
  const kind: SessionKind = params.kind === 'match' ? 'match' : 'practice';

  const [startedAt] = useState(() => new Date().toISOString());
  const [series, setSeries] = useState<number[][]>([[]]);
  const [phase, setPhase] = useState<'logging' | 'summary'>('logging');
  const [note, setNote] = useState('');

  const allShots = useMemo(() => series.flat(), [series]);
  const total = round1(allShots.reduce((a, b) => a + b, 0));

  if (!event) {
    return (
      <SafeAreaView>
        <AppText variant="body">Unknown event.</AppText>
      </SafeAreaView>
    );
  }

  const seriesIndex = series.length - 1;
  const currentSeries = series[seriesIndex];
  const isLastSeries = seriesIndex >= event.seriesCount - 1;
  const sessionComplete =
    isLastSeries && currentSeries.length === event.shotsPerSeries;

  function addShot(value: number) {
    if (phase !== 'logging') return;
    setSeries((prev) => {
      const next = prev.map((s) => [...s]);
      const cur = next[next.length - 1];
      if (cur.length >= event!.shotsPerSeries) return prev;
      cur.push(value);
      const nowFull = cur.length === event!.shotsPerSeries;
      const moreSeries = next.length < event!.seriesCount;
      if (nowFull && moreSeries) next.push([]);
      if (nowFull && !moreSeries) {
        successFeedback();
        // Full session logged — jump straight to summary.
        setTimeout(() => setPhase('summary'), 350);
      }
      return next;
    });
  }

  function undoShot() {
    setSeries((prev) => {
      const next = prev.map((s) => [...s]);
      // Drop trailing empty series so undo reaches the previous series' last shot.
      while (next.length > 1 && next[next.length - 1].length === 0) next.pop();
      const cur = next[next.length - 1];
      if (cur.length > 0) cur.pop();
      return next;
    });
  }

  function endEarly() {
    if (allShots.length === 0) {
      handleDiscard();
      return;
    }
    setPhase('summary');
  }

  function handleDiscard() {
    confirmDialog('Discard session?', 'All shots from this session will be lost.', () =>
      router.back(),
    );
  }

  function handleSave() {
    const cleaned = series.filter((s) => s.length > 0);
    if (cleaned.length === 0) {
      router.back();
      return;
    }
    successFeedback();
    addSession({
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      eventId: event!.id,
      kind,
      startedAt,
      endedAt: new Date().toISOString(),
      series: cleaned.map((shots) => ({ shots })),
      note: note.trim() || undefined,
    });
    router.back();
  }

  const filledSeries = series.filter((s) => s.length > 0);
  const bestSeriesScore =
    filledSeries.length > 0 ? Math.max(...filledSeries.map(seriesTotal)) : 0;

  // ---------- SUMMARY ----------
  if (phase === 'summary') {
    const avg = allShots.length > 0 ? round1((total / allShots.length) * 10) : 0;
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scrollCenter}>
            <View style={styles.content}>
              <View style={styles.summaryHeader}>
                <AppText variant="label" color="secondary">
                  {event.name.toUpperCase()} · {kind === 'match' ? 'MATCH' : 'PRACTICE'}
                </AppText>
                <AppText variant="display" color="accent">
                  {formatScore(total, event.decimal)}
                </AppText>
                <AppText variant="body" color="secondary">
                  {allShots.length} shots · avg {avg.toFixed(1)} / 10 · best series{' '}
                  {formatScore(bestSeriesScore, event.decimal)}
                </AppText>
              </View>

              <Card>
                <View style={styles.seriesTable}>
                  {filledSeries.map((s, i) => (
                    <View key={i} style={styles.seriesRow}>
                      <AppText variant="label" color="secondary" style={styles.seriesNum}>
                        S{i + 1}
                      </AppText>
                      <View style={styles.seriesShots}>
                        {s.map((shot, j) => (
                          <AppText key={j} variant="mono" color="secondary" style={styles.shotText}>
                            {event.decimal ? shot.toFixed(1) : shot}
                          </AppText>
                        ))}
                      </View>
                      <AppText variant="mono" style={styles.seriesTotal}>
                        {formatScore(seriesTotal(s), event.decimal)}
                      </AppText>
                    </View>
                  ))}
                </View>
              </Card>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Notes — conditions, feel, adjustments…"
                placeholderTextColor={colors.textFaint}
                multiline
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />

              <View style={styles.summaryActions}>
                <Button label="Save session" icon="checkmark" size="lg" onPress={handleSave} />
                {!sessionComplete ? (
                  <Button
                    label="Keep shooting"
                    variant="secondary"
                    onPress={() => setPhase('logging')}
                  />
                ) : null}
                <Button label="Discard" variant="ghost" onPress={handleDiscard} />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ---------- LOGGING ----------
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.logContentWrap}>
          <View style={styles.content}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <Pressable onPress={handleDiscard} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
              <View style={styles.topInfo}>
                <AppText variant="label" color="secondary">
                  {event.short} · {kind === 'match' ? 'MATCH' : 'PRACTICE'}
                </AppText>
              </View>
              <Pressable onPress={endEarly} style={styles.closeBtn}>
                <AppText variant="label" color="accent">
                  END
                </AppText>
              </Pressable>
            </View>

            {/* Score header */}
            <View style={styles.scoreHeader}>
              <AppText variant="display">{formatScore(total, event.decimal)}</AppText>
              <AppText variant="caption" color="secondary">
                Series {Math.min(seriesIndex + 1, event.seriesCount)} of {event.seriesCount} ·
                shot {currentSeries.length}/{event.shotsPerSeries}
              </AppText>
            </View>

            {/* Current series chips */}
            <View style={styles.chipsArea}>
              <View style={styles.chips}>
                {Array.from({ length: event.shotsPerSeries }, (_, i) => {
                  const shot = currentSeries[i];
                  const filled = shot !== undefined;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: filled ? colors.surface : colors.surfaceAlt,
                          borderColor: filled
                            ? shot >= (event.decimal ? 10 : 9)
                              ? colors.accent
                              : colors.border
                            : 'transparent',
                        },
                      ]}
                    >
                      {filled ? (
                        <AppText
                          variant="label"
                          color={shot >= (event.decimal ? 10 : 9) ? 'accent' : 'primary'}
                        >
                          {event.decimal ? shot.toFixed(1) : shot}
                        </AppText>
                      ) : null}
                    </View>
                  );
                })}
              </View>
              <View style={styles.seriesSub}>
                <AppText variant="caption" color="secondary">
                  Series total
                </AppText>
                <AppText variant="mono" color="accent">
                  {formatScore(seriesTotal(currentSeries), event.decimal)}
                </AppText>
              </View>
            </View>

            {/* Pad pinned to thumb zone */}
            <View style={styles.padArea}>
              <ScorePad
                decimal={event.decimal}
                onShot={addShot}
                onUndo={undoShot}
                canUndo={allShots.length > 0}
              />
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
  scrollCenter: { flexGrow: 1, alignItems: 'center' },
  logContentWrap: { flex: 1, alignItems: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  topInfo: { flex: 1, alignItems: 'center' },
  closeBtn: {
    width: 52,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreHeader: { alignItems: 'center', gap: Spacing.one },
  chipsArea: { gap: Spacing.two, flex: 1, justifyContent: 'center' },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  chip: {
    width: 48,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesSub: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  padArea: { paddingBottom: Spacing.four },
  summaryHeader: { alignItems: 'center', gap: Spacing.one, paddingTop: Spacing.five },
  seriesTable: { gap: Spacing.two },
  seriesRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  seriesNum: { width: 30 },
  seriesShots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  shotText: { fontSize: 13 },
  seriesTotal: { width: 56, textAlign: 'right' },
  noteInput: {
    minHeight: 80,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    fontSize: 15,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  summaryActions: { gap: Spacing.two, paddingBottom: Spacing.five },
});
