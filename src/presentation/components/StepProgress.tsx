import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';

export function StepProgress({ current, total }: { current: number; total: number }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: current }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 6, borderRadius: radius.full, backgroundColor: i < current ? colors.lime : colors.border }} />
      ))}
    </View>
  );
}
