import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppDispatch } from '../state/hooks/useAppDispatch';
import { useAppSelector } from '../state/hooks/useAppSelector';
import { selectIsMenuOpen } from '../state/selectors/appSelectors';
import { selectCurrentUser } from '../state/selectors/userSelectors';
import { menuClosed } from '../state/slices/appSlice';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
import { Logo } from './Logo';

type IconName = keyof typeof Ionicons.glyphMap;
interface Item {
  key: 'myPets' | 'appointments' | 'records' | 'vaccination' | 'refer' | 'coupons' | 'membership' | 'needHelp' | 'contactSupport' | 'privacy' | 'deleteAccount';
  icon: IconName;
  href: Href;
  danger?: boolean;
}

// Order and grouping follow the product spec; groups are separated by a divider.
const GROUPS: Item[][] = [
  [
    { key: 'myPets', icon: 'paw-outline', href: '/pets' },
    { key: 'appointments', icon: 'calendar-outline', href: '/appointments' },
    { key: 'records', icon: 'medkit-outline', href: '/records' },
    { key: 'vaccination', icon: 'shield-checkmark-outline', href: '/vaccination' },
  ],
  [
    { key: 'refer', icon: 'gift-outline', href: '/refer' },
    { key: 'coupons', icon: 'pricetag-outline', href: '/coupons' },
    { key: 'membership', icon: 'ribbon-outline', href: '/membership' },
  ],
  [
    { key: 'needHelp', icon: 'help-circle-outline', href: '/help' },
    { key: 'contactSupport', icon: 'headset-outline', href: '/contact-support' },
    { key: 'privacy', icon: 'lock-closed-outline', href: '/privacy-policy' },
  ],
  [{ key: 'deleteAccount', icon: 'trash-outline', href: '/delete-account', danger: true }],
];

export function SideMenu() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, radius } = useTheme();
  const open = useAppSelector(selectIsMenuOpen);
  const user = useAppSelector(selectCurrentUser);

  const panelWidth = Math.min(320, Math.round(width * 0.84));
  const x = useRef(new Animated.Value(-panelWidth)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const close = () => dispatch(menuClosed());

  useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(x, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(x, { toValue: -panelWidth, duration: 180, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setVisible(false));
    }
  }, [open, panelWidth, x, fade]);

  // Swipe the panel to the left to dismiss it.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx < -12 && Math.abs(g.dy) < 20,
        onPanResponderMove: (_, g) => x.setValue(Math.min(0, g.dx)),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -panelWidth / 4) dispatch(menuClosed());
          else Animated.timing(x, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        },
      }),
    [dispatch, panelWidth, x],
  );

  const go = (href: Href) => {
    close();
    router.navigate(href);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={styles.flex}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,23,42,0.55)', opacity: fade }]}>
          <Pressable style={styles.flex} onPress={close} accessibilityRole="button" accessibilityLabel={t('menu.close')} />
        </Animated.View>

        <Animated.View
          {...pan.panHandlers}
          accessibilityViewIsModal
          style={[styles.panel, { width: panelWidth, backgroundColor: colors.background, transform: [{ translateX: x }] }]}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={{ paddingTop: insets.top + 10, paddingBottom: 14, paddingHorizontal: 20, gap: 8 }}>
            <View style={styles.row}>
              <View style={styles.logoChip}><Logo size={30} showWordmark={false} /></View>
              <Pressable accessibilityRole="button" accessibilityLabel={t('menu.close')} onPress={close} hitSlop={10}>
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </Pressable>
            </View>
            {user ? (
              <View style={[styles.row, { gap: 12, justifyContent: 'flex-start' }]}>
                <Avatar name={user.name} size={44} />
                <View style={styles.flex}>
                  <AppText variant="subheading" style={{ color: '#FFFFFF' }} numberOfLines={1}>{user.name}</AppText>
                  <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.88)' }} numberOfLines={1}>{user.email ?? user.mobile}</AppText>
                </View>
              </View>
            ) : null}
          </LinearGradient>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: insets.bottom + 12, gap: 2 }}>
            {GROUPS.map((group, gi) => (
              <View key={gi} style={{ gap: 2 }}>
                {gi > 0 ? <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4, marginHorizontal: 8 }} /> : null}
                {group.map((item) => {
                  const tone = item.danger ? colors.danger : colors.text;
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="menuitem"
                      accessibilityLabel={t(`menu.${item.key}`)}
                      onPress={() => go(item.href)}
                      style={({ pressed }) => [styles.item, { borderRadius: radius.md, backgroundColor: pressed ? colors.primaryLight : 'transparent' }]}>
                      <View style={[styles.iconWrap, { backgroundColor: item.danger ? 'rgba(217,48,37,0.10)' : colors.primaryLight, borderRadius: radius.sm + 4 }]}>
                        <Ionicons name={item.icon} size={19} color={item.danger ? colors.danger : colors.primaryDark} />
                      </View>
                      <AppText style={{ flex: 1, color: tone, fontFamily: fonts.medium, fontSize: 15 }}>{t(`menu.${item.key}`)}</AppText>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Pressable>
                  );
                })}
              </View>
            ))}
            <AppText variant="caption" color="textMuted" style={{ textAlign: 'center', marginTop: 10 }}>Cado Vet · v{Constants.expoConfig?.version ?? '1.0.0'}</AppText>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panel: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  logoChip: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, paddingHorizontal: 10 },
  iconWrap: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
});
