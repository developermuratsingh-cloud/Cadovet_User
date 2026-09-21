import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  flat?: boolean;
}

export function Card({ children, onPress, style, flat }: Props) {
  const { colors, radius, spacing, shadow } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg - 4,
    padding: spacing.lg,
    gap: spacing.sm,
    ...(flat ? null : shadow('sm')),
  };

  if (!onPress) return <View style={[styles.card, base, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, base, style, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({ card: { borderWidth: 1 } });
