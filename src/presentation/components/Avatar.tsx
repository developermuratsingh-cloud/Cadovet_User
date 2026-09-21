import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

// Teal→green gradient circle with the user's initial (website portal avatar).
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, size >= 56 && styles.ring]}>
      <AppText style={{ color: '#FFFFFF', fontFamily: fonts.bold, fontSize: size * 0.42, lineHeight: size * 0.55 }}>{(name.trim()[0] ?? '?').toUpperCase()}</AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
});
