import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/providers/theme';

export interface BarTrendPoint {
  value: number;
  label?: string;
}

export interface BarTrendProps {
  points: BarTrendPoint[];
  /** Chart scales between these; defaults derived from data. */
  min?: number;
  max?: number;
  height?: number;
  /** Highlight the best bar in gold. */
  highlightBest?: boolean;
}

/** Dependency-free bar chart tuned for score trends. */
export function BarTrend({ points, min, max, height = 120, highlightBest = true }: BarTrendProps) {
  const { colors } = useTheme();

  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const hi = max ?? Math.max(...values);
  const lo = min ?? Math.min(...values);
  const span = hi - lo || 1;
  const best = Math.max(...values);

  return (
    <View style={[styles.chart, { height }]}>
      {points.map((p, i) => {
        const frac = 0.15 + 0.85 * ((p.value - lo) / span);
        const isBest = highlightBest && p.value === best && points.length > 1;
        return (
          <View key={i} style={styles.barCol}>
            <AppText variant="caption" color={isBest ? 'gold' : 'faint'} style={styles.barValue}>
              {p.value}
            </AppText>
            <View
              style={[
                styles.bar,
                {
                  height: `${frac * 100}%`,
                  backgroundColor: isBest ? colors.gold : colors.accent,
                  opacity: isBest ? 1 : 0.55 + 0.45 * ((p.value - lo) / span),
                },
              ]}
            />
            {p.label ? (
              <AppText variant="caption" color="faint" style={styles.barLabel} numberOfLines={1}>
                {p.label}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.one,
  },
  bar: {
    width: '68%',
    borderRadius: Radius.sm,
    minHeight: 6,
  },
  barValue: { fontSize: 10, lineHeight: 12 },
  barLabel: { fontSize: 9, lineHeight: 11 },
});
