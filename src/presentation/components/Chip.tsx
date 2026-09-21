import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, disabled, onPress }: Props) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: radius.full,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? 0.4 : 1,
        },
      ]}>
      <AppText variant="label" style={{ color: selected ? colors.onPrimary : colors.textSecondary }}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({ chip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1.5 } });
