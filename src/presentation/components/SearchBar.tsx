import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  maxLength?: number;
}

export function SearchBar({ value, onChangeText, placeholder, maxLength = 50 }: Props) {
  const { t } = useTranslation();
  const { colors, radius, shadow } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderRadius: radius.full, borderColor: focused ? colors.primary : colors.border }, shadow('sm')]}>
      <Ionicons name="search" size={20} color={focused ? colors.primary : colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={placeholder}
        maxLength={maxLength}
        returnKeyType="search"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { color: colors.text, fontFamily: fonts.regular }, Platform.OS === 'web' ? WEB_NO_OUTLINE : null]}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('search.clear')} onPress={() => onChangeText('')} hitSlop={10}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

// The bar already draws the focus border; suppress the browser's own outline on web.
const WEB_NO_OUTLINE = { outlineStyle: 'none' } as object;

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 50, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 14.5, paddingVertical: 8 },
});
