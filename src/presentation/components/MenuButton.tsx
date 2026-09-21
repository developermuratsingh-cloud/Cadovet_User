import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useAppDispatch } from '../state/hooks/useAppDispatch';
import { menuOpened } from '../state/slices/appSlice';
import { useTheme } from '../theme/useTheme';

// Hamburger that opens the side menu (the menu itself is mounted once in the root layout).
export function MenuButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('menu.open')}
      onPress={() => dispatch(menuOpened())}
      hitSlop={8}
      style={({ pressed }) => ({ width: 42, height: 42, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}>
      <Ionicons name="menu" size={24} color={colors.primaryDark} />
    </Pressable>
  );
}
