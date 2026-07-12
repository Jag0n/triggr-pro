import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

export interface ScorePadProps {
  /** Decimal events do two taps: whole value, then tenths. */
  decimal: boolean;
  onShot: (value: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const ROWS: (number | 'undo')[][] = [
  [10, 9, 8],
  [7, 6, 5],
  [4, 3, 2],
  [1, 0, 'undo'],
];

/**
 * Thumb-zone score pad. Integer events: one tap per shot. Decimal events:
 * tap the whole number, then a tenths strip appears for the second tap.
 */
export function ScorePad({ decimal, onShot, onUndo, canUndo }: ScorePadProps) {
  const { colors } = useTheme();
  const [pendingWhole, setPendingWhole] = useState<number | null>(null);

  function handleNumber(n: number) {
    tapFeedback();
    if (!decimal) {
      onShot(n);
      return;
    }
    setPendingWhole(n);
  }

  function handleTenth(t: number) {
    if (pendingWhole === null) return;
    tapFeedback();
    onShot(Math.round((pendingWhole + t / 10) * 10) / 10);
    setPendingWhole(null);
  }

  function handleUndo() {
    tapFeedback();
    if (pendingWhole !== null) {
      setPendingWhole(null);
      return;
    }
    onUndo();
  }

  return (
    <View style={styles.pad}>
      {decimal ? (
        <View
          style={[
            styles.tenthsRow,
            { backgroundColor: colors.surfaceAlt, opacity: pendingWhole === null ? 0.35 : 1 },
          ]}
        >
          {pendingWhole !== null ? (
            <AppText variant="heading" color="accent" style={styles.tenthsPending}>
              {pendingWhole}.
            </AppText>
          ) : (
            <AppText variant="caption" color="secondary" style={styles.tenthsPending}>
              0–9 →
            </AppText>
          )}
          {Array.from({ length: 10 }, (_, t) => (
            <Pressable
              key={t}
              disabled={pendingWhole === null}
              onPress={() => handleTenth(t)}
              style={({ pressed }) => [
                styles.tenthKey,
                pressed && { backgroundColor: colors.accentSoft },
              ]}
            >
              <AppText variant="heading" color={pendingWhole === null ? 'faint' : 'primary'}>
                {t}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) =>
            key === 'undo' ? (
              <Pressable
                key="undo"
                onPress={handleUndo}
                disabled={!canUndo && pendingWhole === null}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor: colors.surfaceAlt,
                    opacity: !canUndo && pendingWhole === null ? 0.4 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons name="backspace-outline" size={26} color={colors.danger} />
              </Pressable>
            ) : (
              <Pressable
                key={key}
                onPress={() => handleNumber(key)}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor:
                      decimal && pendingWhole === key ? colors.accent : colors.surface,
                    borderColor: colors.border,
                    borderWidth: StyleSheet.hairlineWidth,
                  },
                  pressed && { backgroundColor: colors.accentSoft },
                ]}
              >
                <AppText
                  variant="title"
                  style={[
                    styles.keyText,
                    decimal && pendingWhole === key && { color: colors.onAccent },
                    key === 10 && { color: colors.accent },
                    decimal && pendingWhole === key && key === 10 && { color: colors.onAccent },
                  ]}
                >
                  {key}
                </AppText>
              </Pressable>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const KEY_HEIGHT = 62;

const styles = StyleSheet.create({
  pad: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  key: {
    flex: 1,
    height: KEY_HEIGHT,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontVariant: ['tabular-nums'] },
  tenthsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    height: 48,
  },
  tenthsPending: { width: 38, textAlign: 'center' },
  tenthKey: {
    flex: 1,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
