import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'lime' | 'outline' | 'danger' | 'ghost' | 'whatsapp' | 'glass';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

// Pill-shaped like the website's buttons.
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, compact, style }: Props) {
  const { colors, radius, shadow } = useTheme();
  const inactive = disabled || loading;

  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    success: { bg: colors.secondary, fg: '#FFFFFF', border: colors.secondary },
    lime: { bg: colors.lime, fg: colors.onPrimary, border: colors.lime },
    danger: { bg: colors.danger, fg: '#FFFFFF', border: colors.danger },
    whatsapp: { bg: colors.whatsapp, fg: '#FFFFFF', border: colors.whatsapp },
    outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
    glass: { bg: 'rgba(255,255,255,0.22)', fg: '#FFFFFF', border: 'rgba(255,255,255,0.55)' },
  }[variant];
  const filled = variant === 'primary' || variant === 'success' || variant === 'lime' || variant === 'whatsapp';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.bg, borderColor: palette.border, borderRadius: radius.full, opacity: inactive ? 0.5 : pressed ? 0.88 : 1 },
        filled && !inactive && shadow('sm'),
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={palette.fg} /> : null}
          <AppText numberOfLines={1} style={{ color: palette.fg, fontFamily: fonts.semibold, fontSize: compact ? 13.5 : 15.5 }}>{title}</AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 50, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, flexDirection: 'row', gap: 8 },
  compact: { minHeight: 42, paddingHorizontal: 16 },
});
