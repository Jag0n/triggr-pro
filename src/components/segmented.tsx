import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

export interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              tapFeedback();
              onChange(opt.value);
            }}
            style={[styles.segment, active && { backgroundColor: colors.surface }]}
          >
            <AppText
              variant="label"
              color={active ? 'primary' : 'secondary'}
              style={styles.segmentLabel}
            >
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: Spacing.one,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.md - Spacing.one,
    alignItems: 'center',
  },
  segmentLabel: { textTransform: 'none' },
});
