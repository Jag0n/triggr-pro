import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { MaxContentWidth, Spacing, TabBarClearance } from '@/constants/theme';
import { useTheme } from '@/providers/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Big title rendered above content. Omit for fully custom layouts. */
  title?: string;
  subtitle?: string;
  /** Element pinned to the top-right corner, next to the title. */
  headerRight?: ReactNode;
  scroll?: boolean;
  /** Extra bottom padding so content clears the floating tab bar. */
  tabScreen?: boolean;
}

export function Screen({
  children,
  title,
  subtitle,
  headerRight,
  scroll = true,
  tabScreen = false,
}: ScreenProps) {
  const { colors } = useTheme();

  const header =
    title || headerRight ? (
      <View style={styles.header}>
        <View style={styles.headerText}>
          {title ? <AppText variant="title">{title}</AppText> : null}
          {subtitle ? (
            <AppText variant="caption" color="secondary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {headerRight}
      </View>
    ) : null;

  const content = (
    <View style={styles.contentWrap}>
      <View style={styles.content}>
        {header}
        {children}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: tabScreen ? TabBarClearance : Spacing.five },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.fill, { paddingBottom: tabScreen ? TabBarClearance : 0 }]}>
            {content}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  contentWrap: { flex: 1, alignItems: 'center' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerText: { flex: 1, gap: Spacing.one },
});
