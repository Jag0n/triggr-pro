import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { StatTile } from '@/components/stat-tile';
import { ThemeToggle } from '@/components/theme-toggle';
import { getEvent } from '@/constants/events';
import { Radius, Spacing } from '@/constants/theme';
import {
  bestSeries,
  formatDate,
  formatScore,
  formatSessionScore,
  sessionShotCount,
  statsFor,
  thisWeek,
} from '@/lib/stats';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Night owl';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { profile, sessions } = useAppState();

  const week = statsFor(thisWeek(sessions));
  const last = sessions[0];
  const lastEvent = last ? getEvent(last.eventId) : undefined;

  const allTimeBest = sessions.reduce<{ score: number; eventId: string } | null>((acc, s) => {
    const b = bestSeries(s);
    return !acc || b > acc.score ? { score: b, eventId: s.eventId } : acc;
  }, null);
  const bestEvent = allTimeBest ? getEvent(allTimeBest.eventId) : undefined;

  return (
    <Screen
      tabScreen
      title={`${greeting()},`}
      subtitle={undefined}
      headerRight={<ThemeToggle />}
    >
      <AppText variant="title" color="accent" style={styles.name}>
        {profile?.name ?? 'Shooter'}
      </AppText>

      {/* Quick actions — thumb-first */}
      <View style={styles.quickRow}>
        <Card tone="accent" style={styles.quickCard} onPress={() => router.push('/(tabs)/log')}>
          <View style={[styles.quickIcon, { backgroundColor: colors.accent }]}>
            <Ionicons name="disc" size={22} color={colors.onAccent} />
          </View>
          <AppText variant="heading">Log shots</AppText>
          <AppText variant="caption" color="secondary">
            Score a session
          </AppText>
        </Card>
        <Card tone="alt" style={styles.quickCard} onPress={() => router.push('/(tabs)/timer')}>
          <View style={[styles.quickIcon, { backgroundColor: colors.surface }]}>
            <Ionicons name="timer" size={22} color={colors.accent} />
          </View>
          <AppText variant="heading">Match timer</AppText>
          <AppText variant="caption" color="secondary">
            Commands & rhythm
          </AppText>
        </Card>
      </View>

      {/* This week */}
      <View style={styles.sectionHeader}>
        <AppText variant="heading">This week</AppText>
      </View>
      <View style={styles.statRow}>
        <StatTile label="Sessions" value={String(week.sessions)} />
        <StatTile label="Shots" value={String(week.shots)} />
        <StatTile
          label="Avg / 10"
          value={week.shots > 0 ? week.avg10.toFixed(1) : '—'}
          tone="accent"
        />
      </View>

      {/* Last session */}
      {last && lastEvent ? (
        <>
          <View style={styles.sectionHeader}>
            <AppText variant="heading">Last session</AppText>
          </View>
          <Card onPress={() => router.push({ pathname: '/session/[id]', params: { id: last.id } })}>
            <View style={styles.lastRow}>
              <View style={styles.lastInfo}>
                <AppText variant="heading">{lastEvent.name}</AppText>
                <AppText variant="caption" color="secondary">
                  {formatDate(last.startedAt)} · {sessionShotCount(last)} shots ·{' '}
                  {last.kind === 'match' ? 'Match' : 'Practice'}
                </AppText>
              </View>
              <AppText variant="title" color="accent" style={styles.lastScore}>
                {formatSessionScore(last)}
              </AppText>
            </View>
          </Card>
        </>
      ) : null}

      {/* Personal best */}
      {allTimeBest && bestEvent ? (
        <Card tone="alt">
          <View style={styles.pbRow}>
            <View style={[styles.pbIcon, { backgroundColor: colors.goldSoft }]}>
              <Ionicons name="trophy" size={20} color={colors.gold} />
            </View>
            <View style={styles.lastInfo}>
              <AppText variant="caption" color="secondary">
                Best series · {bestEvent.short}
              </AppText>
              <AppText variant="heading" color="gold">
                {formatScore(allTimeBest.score, bestEvent.decimal)}
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}

      {sessions.length === 0 ? (
        <Card tone="alt">
          <AppText variant="heading">Welcome to the range 🎯</AppText>
          <AppText variant="caption" color="secondary" style={styles.welcomeText}>
            Log your first session and Triggr starts building your score trends, averages and
            personal bests automatically.
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { marginTop: -Spacing.three },
  quickRow: { flexDirection: 'row', gap: Spacing.two },
  quickCard: { flex: 1 },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  sectionHeader: { marginTop: Spacing.one },
  statRow: { flexDirection: 'row', gap: Spacing.two },
  lastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lastInfo: { gap: 2, flex: 1 },
  lastScore: { fontVariant: ['tabular-nums'] },
  pbRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pbIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: { marginTop: Spacing.one },
});
