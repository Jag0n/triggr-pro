import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { EVENTS, type Discipline } from '@/constants/events';
import { Radius, Spacing } from '@/constants/theme';
import type { SessionKind } from '@/types/models';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';

export default function LogScreen() {
  const { colors } = useTheme();
  const { profile } = useAppState();

  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline ?? 'pistol');
  const [kind, setKind] = useState<SessionKind>('practice');

  const events = EVENTS.filter((e) => e.discipline === discipline);

  function start(eventId: string) {
    router.push({ pathname: '/session/log', params: { event: eventId, kind } });
  }

  return (
    <Screen tabScreen title="Log shots" subtitle="Pick your event and get on the line.">
      <Segmented
        options={[
          { value: 'pistol', label: 'Pistol' },
          { value: 'rifle', label: 'Rifle' },
        ]}
        value={discipline}
        onChange={setDiscipline}
      />
      <Segmented
        options={[
          { value: 'practice', label: 'Practice' },
          { value: 'match', label: 'Match' },
        ]}
        value={kind}
        onChange={setKind}
      />

      <View style={styles.list}>
        {events.map((e) => {
          const isPrimary = profile?.primaryEventId === e.id;
          return (
            <Card key={e.id} onPress={() => start(e.id)}>
              <View style={styles.row}>
                <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                  <AppText variant="label" color="accent">
                    {e.distance}
                  </AppText>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <AppText variant="heading">{e.name}</AppText>
                    {isPrimary ? (
                      <Ionicons name="star" size={14} color={colors.gold} />
                    ) : null}
                  </View>
                  <AppText variant="caption" color="secondary">
                    {e.seriesCount} × {e.shotsPerSeries} shots
                    {e.decimal ? ' · decimal scoring' : ''}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  badge: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
