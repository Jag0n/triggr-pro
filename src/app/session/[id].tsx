import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { BarTrend } from '@/components/bar-trend';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { getEvent } from '@/constants/events';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  avgPerShot,
  formatDate,
  formatScore,
  formatTime,
  seriesTotal,
  sessionShotCount,
  sessionTotal,
} from '@/lib/stats';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';

function confirmDialog(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SessionDetailScreen() {
  const { colors } = useTheme();
  const { sessions, deleteSession } = useAppState();
  const { id } = useLocalSearchParams<{ id: string }>();

  const session = sessions.find((s) => s.id === id);
  const event = session ? getEvent(session.eventId) : undefined;

  if (!session || !event) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.missing}>
            <AppText variant="body" color="secondary">
              Session not found.
            </AppText>
            <Button label="Back" variant="secondary" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const total = sessionTotal(session);
  const avg = avgPerShot(session) * 10;
  const seriesScores = session.series.map((s) => seriesTotal(s.shots));

  function handleDelete() {
    confirmDialog('Delete session?', 'This session will be permanently removed.', () => {
      deleteSession(session!.id);
      router.back();
    });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
              <AppText variant="label" color="secondary">
                {event.name.toUpperCase()}
              </AppText>
              <Pressable onPress={handleDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            </View>

            <View style={styles.hero}>
              <AppText variant="display" color="accent">
                {formatScore(total, event.decimal)}
              </AppText>
              <AppText variant="body" color="secondary">
                {formatDate(session.startedAt)} · {formatTime(session.startedAt)} ·{' '}
                {session.kind === 'match' ? 'Match' : 'Practice'}
              </AppText>
              <AppText variant="caption" color="faint">
                {sessionShotCount(session)} shots · avg {avg.toFixed(1)} / 10
              </AppText>
            </View>

            {seriesScores.length >= 2 ? (
              <Card>
                <View style={styles.chartHeader}>
                  <AppText variant="heading">Series</AppText>
                </View>
                <BarTrend
                  points={seriesScores.map((v, i) => ({
                    value: Math.round(v * 10) / 10,
                    label: `S${i + 1}`,
                  }))}
                  height={110}
                />
              </Card>
            ) : null}

            <Card>
              <View style={styles.seriesTable}>
                {session.series.map((s, i) => (
                  <View key={i} style={styles.seriesRow}>
                    <AppText variant="label" color="secondary" style={styles.seriesNum}>
                      S{i + 1}
                    </AppText>
                    <View style={styles.shots}>
                      {s.shots.map((shot, j) => (
                        <View
                          key={j}
                          style={[
                            styles.shotChip,
                            {
                              backgroundColor:
                                shot >= (event.decimal ? 10 : 9)
                                  ? colors.accentSoft
                                  : colors.surfaceAlt,
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            color={shot >= (event.decimal ? 10 : 9) ? 'accent' : 'secondary'}
                            style={styles.shotChipText}
                          >
                            {event.decimal ? shot.toFixed(1) : shot}
                          </AppText>
                        </View>
                      ))}
                    </View>
                    <AppText variant="mono" style={styles.seriesScore}>
                      {formatScore(seriesTotal(s.shots), event.decimal)}
                    </AppText>
                  </View>
                ))}
              </View>
            </Card>

            {session.note ? (
              <Card tone="alt">
                <AppText variant="label" color="secondary" style={styles.noteLabel}>
                  NOTES
                </AppText>
                <AppText variant="body">{session.note}</AppText>
              </Card>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: Spacing.five },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
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
  hero: { alignItems: 'center', gap: Spacing.one },
  chartHeader: { marginBottom: Spacing.three },
  seriesTable: { gap: Spacing.three },
  seriesRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  seriesNum: { width: 28 },
  shots: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  shotChip: {
    minWidth: 32,
    height: 26,
    borderRadius: Radius.sm - 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  shotChipText: { fontSize: 12, fontWeight: '700' },
  seriesScore: { width: 54, textAlign: 'right' },
  noteLabel: { marginBottom: Spacing.one },
});
