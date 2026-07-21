import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'lg' | 'md' | 'sm';
  icon?: IoniconName;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  loading,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const bg = {
    primary: colors.accent,
    secondary: colors.surfaceAlt,
    ghost: 'transparent',
    danger: colors.dangerSoft,
  }[variant];

  const fg = {
    primary: colors.onAccent,
    secondary: colors.text,
    ghost: colors.textSecondary,
    danger: colors.danger,
  }[variant];

  const height = { lg: 58, md: 50, sm: 38 }[size];
  const fontSize = { lg: 18, md: 16, sm: 14 }[size];

  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          height,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={fontSize + 3} color={fg} /> : null}
          <AppText variant="heading" style={{ color: fg, fontSize }}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
