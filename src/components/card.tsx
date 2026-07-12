import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  tone?: 'default' | 'accent' | 'alt';
  padding?: keyof typeof Spacing;
}

export function Card({ onPress, tone = 'default', padding = 'three', style, ...rest }: CardProps) {
  const { colors } = useTheme();

  const toneStyle: ViewStyle = {
    default: { backgroundColor: colors.surface, borderColor: colors.border },
    alt: { backgroundColor: colors.surfaceAlt, borderColor: 'transparent' },
    accent: { backgroundColor: colors.accentSoft, borderColor: 'transparent' },
  }[tone];

  const inner = (
    <View
      style={[styles.base, toneStyle, { padding: Spacing[padding] }, !onPress && style]}
      {...rest}
    />
  );

  if (!onPress) return inner;

  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, style]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
