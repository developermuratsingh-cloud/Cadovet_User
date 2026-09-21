import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';

import { WhatsAppFab } from '@/presentation/components';
import { fonts } from '@/presentation/theme/tokens';
import { useTheme } from '@/presentation/theme/useTheme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;

const icon = (name: IconName, focused: IconName) =>
  function TabIcon({ color, size, focused: isFocused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={isFocused ? focused : name} size={size} color={color} />;
  };

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="appointments" options={{ title: t('tabs.appointments'), tabBarIcon: icon('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="pets" options={{ title: t('tabs.pets'), tabBarIcon: icon('paw-outline', 'paw') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
      <WhatsAppFab bottom={(insets.bottom || 8) + 68} />
    </View>
  );
}
