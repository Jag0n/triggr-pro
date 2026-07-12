import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { ThemeToggle } from '@/components/theme-toggle';
import { eventsForDiscipline, getEvent, type Discipline } from '@/constants/events';
import { Radius, Spacing } from '@/constants/theme';
import { useAppState } from '@/providers/app-state';
import { useAuth } from '@/providers/auth';
import { useTheme, type ThemeMode } from '@/providers/theme';

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

export default function ProfileScreen() {
  const { colors, mode, setMode } = useTheme();
  const { profile, sessions, setProfile, clearAllData } = useAppState();
  const { isGuest, email, cloudAvailable, signOut } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile?.name ?? '');

  if (!profile) return null;

  const events = eventsForDiscipline(profile.discipline);
  const primaryEvent = getEvent(profile.primaryEventId);
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  function saveName() {
    const trimmed = nameDraft.trim();
    if (trimmed) setProfile({ ...profile!, name: trimmed });
    setEditingName(false);
  }

  function setDiscipline(d: Discipline) {
    const firstEvent = eventsForDiscipline(d)[0];
    setProfile({
      ...profile!,
      discipline: d,
      primaryEventId:
        getEvent(profile!.primaryEventId)?.discipline === d
          ? profile!.primaryEventId
          : firstEvent.id,
    });
  }

  async function handleSignOut() {
    confirmDialog(
      'Sign out?',
      'Your training data stays on this device. You will return to the welcome screen.',
      () => {
        void signOut().then(() => router.replace('/welcome'));
      },
    );
  }

  function handleClearData() {
    confirmDialog(
      'Delete all data?',
      `This permanently deletes ${sessions.length} session${sessions.length === 1 ? '' : 's'} and your profile from this device.`,
      () => {
        clearAllData();
        void signOut().then(() => router.replace('/welcome'));
      },
    );
  }

  return (
    <Screen tabScreen title="Profile" headerRight={<ThemeToggle />}>
      {/* Identity */}
      <Card>
        <View style={styles.identityRow}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <AppText variant="heading" style={{ color: colors.onAccent }}>
              {initials || '🎯'}
            </AppText>
          </View>
          <View style={styles.identityInfo}>
            {editingName ? (
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                onBlur={saveName}
                onSubmitEditing={saveName}
                autoFocus
                style={[
                  styles.nameInput,
                  { color: colors.text, borderColor: colors.accent },
                ]}
              />
            ) : (
              <Pressable
                onPress={() => {
                  setNameDraft(profile.name);
                  setEditingName(true);
                }}
              >
                <View style={styles.nameRow}>
                  <AppText variant="heading">{profile.name}</AppText>
                  <Ionicons name="pencil" size={14} color={colors.textFaint} />
                </View>
              </Pressable>
            )}
            <AppText variant="caption" color="secondary">
              {isGuest ? 'Local profile — data on this device' : (email ?? 'Signed in')}
            </AppText>
          </View>
        </View>
      </Card>

      {/* Shooting setup */}
      <AppText variant="heading">Shooting</AppText>
      <Card>
        <View style={styles.settingBlock}>
          <AppText variant="label" color="secondary">
            DISCIPLINE
          </AppText>
          <Segmented
            options={[
              { value: 'pistol', label: 'Pistol' },
              { value: 'rifle', label: 'Rifle' },
            ]}
            value={profile.discipline}
            onChange={setDiscipline}
          />
          <AppText variant="label" color="secondary" style={styles.blockGap}>
            MAIN EVENT
          </AppText>
          <View style={styles.eventGrid}>
            {events.map((e) => {
              const active = profile.primaryEventId === e.id;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => setProfile({ ...profile, primaryEventId: e.id })}
                  style={[
                    styles.eventChip,
                    {
                      backgroundColor: active ? colors.accent : colors.surfaceAlt,
                    },
                  ]}
                >
                  <AppText
                    variant="label"
                    style={{ color: active ? colors.onAccent : colors.textSecondary }}
                  >
                    {e.short}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {primaryEvent ? (
            <AppText variant="caption" color="faint">
              {primaryEvent.name} · {primaryEvent.seriesCount} × {primaryEvent.shotsPerSeries}{' '}
              shots{primaryEvent.decimal ? ' · decimal' : ''}
            </AppText>
          ) : null}
        </View>
      </Card>

      {/* Appearance */}
      <AppText variant="heading">Appearance</AppText>
      <Card>
        <Segmented
          options={
            [
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ] as { value: ThemeMode; label: string }[]
          }
          value={mode}
          onChange={setMode}
        />
      </Card>

      {/* Account & data */}
      <AppText variant="heading">Account & data</AppText>
      <Card>
        <View style={styles.rows}>
          <View style={styles.row}>
            <Ionicons name="cloud-outline" size={20} color={colors.textSecondary} />
            <View style={styles.rowInfo}>
              <AppText variant="body">Cloud sync</AppText>
              <AppText variant="caption" color="secondary">
                {!cloudAvailable
                  ? 'Not configured yet — data is stored on this device'
                  : isGuest
                    ? 'Sign in to back up your sessions'
                    : 'Sessions back up to your account'}
              </AppText>
            </View>
            {cloudAvailable && isGuest ? (
              <Pressable
                onPress={() => router.replace('/welcome')}
                style={[styles.smallAction, { backgroundColor: colors.accentSoft }]}
              >
                <AppText variant="label" color="accent">
                  Sign in
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <Ionicons name="albums-outline" size={20} color={colors.textSecondary} />
            <View style={styles.rowInfo}>
              <AppText variant="body">Training data</AppText>
              <AppText variant="caption" color="secondary">
                {sessions.length} session{sessions.length === 1 ? '' : 's'} logged
              </AppText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable onPress={() => void handleSignOut()} style={styles.row}>
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
            <View style={styles.rowInfo}>
              <AppText variant="body">Sign out</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable onPress={handleClearData} style={styles.row}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <View style={styles.rowInfo}>
              <AppText variant="body" color="danger">
                Delete all data
              </AppText>
            </View>
          </Pressable>
        </View>
      </Card>

      <AppText variant="caption" color="faint" style={styles.version}>
        Triggr v0.2.0-alpha · built for the podium 🎯
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: 2,
  },
  settingBlock: { gap: Spacing.two },
  blockGap: { marginTop: Spacing.two },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  eventChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rows: { gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowInfo: { flex: 1, gap: 2 },
  smallAction: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  divider: { height: StyleSheet.hairlineWidth },
  version: { textAlign: 'center', marginTop: Spacing.two },
});
