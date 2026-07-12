import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

/** Corner sun/moon switch — flips light and dark instantly. */
export function ThemeToggle() {
  const { colors, scheme, toggle } = useTheme();

  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        toggle();
      }}
      accessibilityLabel="Toggle dark mode"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surfaceAlt,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons
        name={scheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={20}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
