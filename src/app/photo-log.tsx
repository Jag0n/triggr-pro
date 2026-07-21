import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ScorePad } from '@/components/score-pad';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { EVENTS, getEvent, type Discipline } from '@/constants/events';
import { Radius, Spacing } from '@/constants/theme';
import type { TargetAnalysis } from '@/lib/photo-analysis';
import { analyzeTargetImage } from '@/lib/target-scan';
import { formatScore, round1 } from '@/lib/stats';
import { successFeedback } from '@/lib/sound';
import { useAppState } from '@/providers/app-state';
import { useTheme } from '@/providers/theme';
import type { SessionKind } from '@/types/models';

type Phase = 'setup' | 'analyzing' | 'review';

interface PickedImage {
  uri: string;
}

export default function PhotoLogScreen() {
  const { colors } = useTheme();
  const { profile, addSession } = useAppState();

  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline ?? 'pistol');
  const [eventId, setEventId] = useState<string>(() => {
    const primary = getEvent(profile?.primaryEventId ?? '');
    return primary?.id ?? EVENTS[0].id;
  });
  const [kind, setKind] = useState<SessionKind>('practice');

  const [phase, setPhase] = useState<Phase>('setup');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [shots, setShots] = useState<number[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [error, setError] = useState('');
  const [startedAt] = useState(() => new Date().toISOString());

  const events = EVENTS.filter((e) => e.discipline === discipline);
  const event = getEvent(eventId) ?? events[0];

  const total = useMemo(() => round1(shots.reduce((a, b) => a + b, 0)), [shots]);

  function switchDiscipline(d: Discipline) {
    setDiscipline(d);
    const first = EVENTS.find((e) => e.discipline === d);
    if (first && getEvent(eventId)?.discipline !== d) setEventId(first.id);
  }

  async function pick(source: 'camera' | 'gallery') {
    setError('');
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError('Camera permission is needed to photograph the target.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setError('Photo library permission is needed to pick a target photo.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const picked: PickedImage = { uri: result.assets[0].uri };
      setImage(picked);
      await analyze(picked);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the image picker.');
    }
  }

  async function analyze(picked: PickedImage) {
    setPhase('analyzing');
    setError('');
    try {
      const analysis: TargetAnalysis = await analyzeTargetImage(picked.uri, event);
      if (!analysis.targetDetected) {
        setError('No target detected in the photo. Try a straight-on shot of the scoring rings.');
        setPhase('setup');
        return;
      }
      setShots(analysis.shots.map((s) => s.score));
      setAnalysisNotes(analysis.notes);
      successFeedback();
      setPhase('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Try again.');
      setPhase('setup');
    }
  }

  function removeShot(index: number) {
    setShots((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (shots.length === 0) return;
    const series: { shots: number[] }[] = [];
    for (let i = 0; i < shots.length; i += event.shotsPerSeries) {
      series.push({ shots: shots.slice(i, i + event.shotsPerSeries) });
    }
    successFeedback();
    addSession({
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      eventId: event.id,
      kind,
      startedAt,
      endedAt: new Date().toISOString(),
      series,
      note: analysisNotes ? `Photo log · ${analysisNotes}` : 'Photo log',
    });
    router.back();
  }

  // ---------- ANALYZING ----------
  if (phase === 'analyzing') {
    return (
      <Screen title="Reading target…" subtitle="Finding holes and scoring each ring.">
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" />
        ) : null}
        <Button label="Analyzing photo…" loading onPress={() => {}} />
      </Screen>
    );
  }

  // ---------- REVIEW ----------
  if (phase === 'review') {
    return (
      <Screen
        title="Review shots"
        subtitle="Tap a shot to remove it, use the pad to add missed ones."
        headerRight={
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        }
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} contentFit="cover" />
        ) : null}

        <View style={styles.totalRow}>
          <AppText variant="display" color="accent">
            {formatScore(total, event.decimal)}
          </AppText>
          <AppText variant="caption" color="secondary">
            {shots.length} shots · {event.short} · {kind === 'match' ? 'MATCH' : 'PRACTICE'}
          </AppText>
        </View>

        {analysisNotes ? (
          <Card>
            <AppText variant="caption" color="secondary">
              {analysisNotes}
            </AppText>
          </Card>
        ) : null}

        <View style={styles.chips}>
          {shots.map((shot, i) => (
            <Pressable
              key={i}
              onPress={() => removeShot(i)}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surface,
                  borderColor: shot >= (event.decimal ? 10 : 9) ? colors.accent : colors.border,
                },
              ]}
            >
              <AppText
                variant="label"
                color={shot >= (event.decimal ? 10 : 9) ? 'accent' : 'primary'}
              >
                {event.decimal ? shot.toFixed(1) : shot}
              </AppText>
            </Pressable>
          ))}
        </View>

        <ScorePad
          decimal={event.decimal}
          onShot={(value) => setShots((prev) => [...prev, value])}
          onUndo={() => setShots((prev) => prev.slice(0, -1))}
          canUndo={shots.length > 0}
        />

        <View style={styles.actions}>
          <Button
            label="Save session"
            icon="checkmark"
            size="lg"
            onPress={handleSave}
            disabled={shots.length === 0}
          />
          <Button
            label="Retake photo"
            variant="secondary"
            onPress={() => {
              setShots([]);
              setAnalysisNotes('');
              setImage(null);
              setPhase('setup');
            }}
          />
        </View>
      </Screen>
    );
  }

  // ---------- SETUP ----------
  return (
    <Screen
      title="Photo log"
      subtitle="Snap the target — shots are scored for you."
      headerRight={
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      }
    >
      <Segmented
        options={[
          { value: 'pistol', label: 'Pistol' },
          { value: 'rifle', label: 'Rifle' },
        ]}
        value={discipline}
        onChange={switchDiscipline}
      />
      <Segmented
        options={[
          { value: 'practice', label: 'Practice' },
          { value: 'match', label: 'Match' },
        ]}
        value={kind}
        onChange={setKind}
      />

      <View style={styles.eventList}>
        {events.map((e) => {
          const active = e.id === event.id;
          return (
            <Pressable
              key={e.id}
              onPress={() => setEventId(e.id)}
              style={[
                styles.eventChip,
                {
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <AppText variant="label" color={active ? 'accent' : 'secondary'}>
                {e.distance} · {e.short}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Card>
          <View style={styles.errorRow}>
            <Ionicons name="warning-outline" size={18} color={colors.danger} />
            <AppText variant="caption" color="secondary" style={styles.errorText}>
              {error}
            </AppText>
          </View>
        </Card>
      ) : null}

      <View style={styles.actions}>
        {Platform.OS !== 'web' ? (
          <Button label="From camera" icon="camera" size="lg" onPress={() => pick('camera')} />
        ) : null}
        <Button
          label="From gallery"
          icon="images"
          size="lg"
          variant={Platform.OS === 'web' ? 'primary' : 'secondary'}
          onPress={() => pick('gallery')}
        />
        {Platform.OS === 'web' ? (
          <AppText variant="caption" color="faint" style={styles.webNote}>
            Camera capture is available in the mobile app.
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  eventChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: Radius.lg,
  },
  totalRow: { alignItems: 'center', gap: Spacing.one },
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
  actions: { gap: Spacing.two, paddingBottom: Spacing.four },
  errorRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  errorText: { flex: 1 },
  webNote: { textAlign: 'center' },
});
