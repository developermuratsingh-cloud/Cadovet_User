import { Pressable, View } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: 4, borderWidth: 1, borderColor: colors.border }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: radius.full, backgroundColor: active ? colors.primary : 'transparent' }}>
            <AppText style={{ fontFamily: fonts.semibold, fontSize: 13.5, color: active ? colors.onPrimary : colors.textSecondary }}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
