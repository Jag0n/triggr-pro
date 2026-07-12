import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme';

export interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'accent' | 'gold';
}

export function StatTile({ label, value, hint, tone = 'default' }: StatTileProps) {
  const { colors } = useTheme();

  const valueColor = tone === 'accent' ? 'accent' : tone === 'gold' ? 'gold' : 'primary';

  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="caption" color="secondary" numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="title" color={valueColor} style={styles.value} numberOfLines={1}>
        {value}
      </AppText>
      {hint ? (
        <AppText variant="caption" color="faint" numberOfLines={1}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
    minWidth: 100,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
