import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

// Teal gradient card with a paw watermark — the website's dashboard hero.
export function HeroCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors, radius, shadow } = useTheme();
  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderRadius: radius.lg }, shadow('md'), style]}>
      <Ionicons name="paw" size={150} color="rgba(255,255,255,0.12)" style={styles.paw} />
      <Ionicons name="paw" size={70} color="rgba(255,255,255,0.10)" style={styles.paw2} />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { padding: 22, overflow: 'hidden' },
  content: { gap: 12 },
  paw: { position: 'absolute', right: -28, top: -20, transform: [{ rotate: '18deg' }] },
  paw2: { position: 'absolute', right: 60, bottom: -18, transform: [{ rotate: '-20deg' }] },
});
