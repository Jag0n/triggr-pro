import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/providers/theme';

type Variant =
  | 'display' // huge scores / hero numbers
  | 'title' // screen titles
  | 'heading' // section headings
  | 'body'
  | 'label' // emphasized small
  | 'caption' // secondary small
  | 'mono'; // tabular numbers

export interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: 'primary' | 'secondary' | 'faint' | 'accent' | 'onAccent' | 'success' | 'gold' | 'danger';
}

export function AppText({ variant = 'body', color = 'primary', style, ...rest }: AppTextProps) {
  const { colors } = useTheme();

  const colorValue = {
    primary: colors.text,
    secondary: colors.textSecondary,
    faint: colors.textFaint,
    accent: colors.accent,
    onAccent: colors.onAccent,
    success: colors.success,
    gold: colors.gold,
    danger: colors.danger,
  }[color];

  return <Text style={[styles[variant], { color: colorValue }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '800',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  mono: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    fontVariant: ['tabular-nums'],
  },
});
