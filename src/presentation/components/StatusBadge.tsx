import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

export function StatusBadge({ label, tone }: Props) {
  const { colors, radius } = useTheme();
  const fg = tone === 'neutral' ? colors.textSecondary : colors[tone];
  return (
    <View style={[styles.badge, { borderColor: fg, borderRadius: radius.full }]}>
      <AppText variant="caption" style={{ color: fg, fontFamily: 'Poppins_600SemiBold', fontSize: 11.5 }}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 3, borderWidth: 1.2 } });
