import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BarTrend } from '@/components/bar-trend';
import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { StatTile } from '@/components/stat-tile';
import { EVENTS, getEvent } from '@/constants/events';
import { Radius, Spacing } from '@/constants/theme';
import {
  formatDate,
  formatSessionScore,
  formatTime,
  seriesAvg10,
  sessionShotCount,
  statsFor,
} from '@/lib/stats';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';

export default function TrendsScreen() {
  const { colors } = useTheme();
  const { sessions } = useAppState();
  const [filter, setFilter] = useState<string>('all');

  const usedEventIds = useMemo(
    () => EVENTS.filter((e) => sessions.some((s) => s.eventId === e.id)).map((e) => e.id),
    [sessions],
  );

  const filtered = useMemo(
    () => (filter === 'all' ? sessions : sessions.filter((s) => s.eventId === filter)),
    [sessions, filter],
  );

  const stats = statsFor(filtered);

  // Oldest → newest for the trend chart, last 10 sessions.
  const chartPoints = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
        .slice(-10)
        .map((s) => ({ value: seriesAvg10(s) })),
    [filtered],
  );

  if (sessions.length === 0) {
    return (
      <Screen tabScreen title="Trends" subtitle="Your scores, over time.">
        <EmptyState
          icon="stats-chart"
          title="No data yet"
          message="Log your first session and your score trends, averages and bests will build here automatically."
        />
      </Screen>
    );
  }

  return (
    <Screen tabScreen title="Trends" subtitle="Your scores, over time.">
      {/* Event filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {[{ id: 'all', short: 'All' }, ...usedEventIds.map((id) => getEvent(id)!)].map((e) => {
            const active = filter === e.id;
            return (
              <Pressable
                key={e.id}
                onPress={() => setFilter(e.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.accent : colors.surface,
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <AppText variant="label" style={{ color: active ? colors.onAccent : colors.text }}>
                  {e.short}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.statRow}>
        <StatTile label="Sessions" value={String(stats.sessions)} />
        <StatTile label="Shots" value={String(stats.shots)} />
      </View>
      <View style={styles.statRow}>
        <StatTile
          label="Avg / 10 shots"
          value={stats.shots > 0 ? stats.avg10.toFixed(1) : '—'}
          tone="accent"
        />
        <StatTile
          label="Best series"
          value={stats.best > 0 ? String(Math.round(stats.best * 10) / 10) : '—'}
          tone="gold"
        />
      </View>

      {chartPoints.length >= 2 ? (
        <Card>
          <View style={styles.chartHeader}>
            <AppText variant="heading">Average per 10 shots</AppText>
            <AppText variant="caption" color="secondary">
              Last {chartPoints.length} sessions
            </AppText>
          </View>
          <BarTrend points={chartPoints} />
        </Card>
      ) : null}

      <AppText variant="heading">History</AppText>
      <View style={styles.list}>
        {filtered.map((s) => {
          const event = getEvent(s.eventId);
          if (!event) return null;
          return (
            <Card
              key={s.id}
              onPress={() => router.push({ pathname: '/session/[id]', params: { id: s.id } })}
            >
              <View style={styles.row}>
                <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                  <AppText variant="label" color="accent">
                    {event.short}
                  </AppText>
                </View>
                <View style={styles.info}>
                  <AppText variant="body" style={styles.rowTitle}>
                    {formatDate(s.startedAt)} · {formatTime(s.startedAt)}
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    {sessionShotCount(s)} shots · {s.kind === 'match' ? 'Match' : 'Practice'}
                    {s.note ? ' · 📝' : ''}
                  </AppText>
                </View>
                <AppText variant="heading" color="accent" style={styles.score}>
                  {formatSessionScore(s)}
                </AppText>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: Spacing.two },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  statRow: { flexDirection: 'row', gap: Spacing.two },
  chartHeader: { marginBottom: Spacing.three, gap: 2 },
  list: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: {
    minWidth: 56,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  info: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '600' },
  score: { fontVariant: ['tabular-nums'] },
});
