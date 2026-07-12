import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, type ColorValue } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/providers/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IoniconName, inactive: IoniconName) {
  return function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} size={23} color={color} />;
  };
}

export default function TabsLayout() {
  const { colors, scheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'web' ? 16 : 24,
          marginHorizontal: 16,
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          borderRadius: Radius.xl,
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: scheme === 'dark' ? 0.5 : 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="log"
        options={{ title: 'Log', tabBarIcon: tabIcon('disc', 'disc-outline') }}
      />
      <Tabs.Screen
        name="timer"
        options={{ title: 'Timer', tabBarIcon: tabIcon('timer', 'timer-outline') }}
      />
      <Tabs.Screen
        name="trends"
        options={{ title: 'Trends', tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
