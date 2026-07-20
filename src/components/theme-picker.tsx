import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { THEME_IDS, Themes, Radius, Spacing } from '@/constants/theme';
import { tapFeedback } from '@/lib/sound';
import { useTheme } from '@/providers/theme';

/** Row of accent swatches — one per color theme, active one ringed. */
export function ThemePicker() {
  const { colors, scheme, themeId, setThemeId } = useTheme();

  return (
    <View style={styles.row}>
      {THEME_IDS.map((id) => {
        const theme = Themes[id];
        const swatch = theme[scheme];
        const active = id === themeId;
        return (
          <Pressable
            key={id}
            accessibilityLabel={`${theme.name} theme`}
            onPress={() => {
              tapFeedback();
              setThemeId(id);
            }}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
          >
            <View
              style={[
                styles.ring,
                { borderColor: active ? swatch.accent : 'transparent' },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: swatch.accent }]}>
                {active ? (
                  <Ionicons name="checkmark" size={18} color={swatch.onAccent} />
                ) : null}
              </View>
            </View>
            <AppText
              variant="caption"
              color={active ? 'primary' : 'faint'}
              style={active && { color: colors.accent, fontWeight: '700' }}
            >
              {theme.name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  item: { alignItems: 'center', gap: Spacing.one, flex: 1 },
  ring: {
    borderWidth: 2,
    borderRadius: Radius.full,
    padding: 3,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
