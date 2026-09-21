import { Ionicons } from '@expo/vector-icons';
import { useState, type Ref } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
  helper?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  inputRef?: Ref<TextInput>;
  showCounter?: boolean;
}

export function TextField({ label, error, helper, icon, inputRef, showCounter, multiline, secureTextEntry, style, onFocus, onBlur, value, maxLength, ...rest }: Props) {
  const { colors, radius } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = !!secureTextEntry;
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">{label}</AppText>
      <View style={[styles.field, multiline && styles.fieldMultiline, { backgroundColor: colors.surface, borderColor, borderRadius: radius.md }]}>
        {icon ? <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textMuted} style={multiline ? styles.iconTop : undefined} /> : null}
        <TextInput
          {...rest}
          ref={inputRef}
          value={value}
          maxLength={maxLength}
          multiline={multiline}
          secureTextEntry={isPassword && hidden}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={[styles.input, multiline && styles.multiline, { color: colors.text, fontFamily: fonts.regular }, Platform.OS === 'web' ? WEB_NO_OUTLINE : null, style]}
        />
        {isPassword ? (
          <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.footer}>
        {error ? <AppText variant="caption" color="danger" style={styles.flex} accessibilityRole="alert">{error}</AppText> : helper ? <AppText variant="caption" color="textMuted" style={styles.flex}>{helper}</AppText> : <View style={styles.flex} />}
        {showCounter && maxLength ? <AppText variant="caption" color="textMuted">{(value ?? '').length}/{maxLength}</AppText> : null}
      </View>
    </View>
  );
}

// The field wrapper already draws the focus border; suppress the browser's own outline on web.
const WEB_NO_OUTLINE = { outlineStyle: 'none' } as object;

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: { minHeight: 50, borderWidth: 1.5, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: 4 },
  iconTop: { marginTop: 14 },
  input: { flex: 1, minHeight: 48, fontSize: 15, paddingVertical: 8 },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  flex: { flex: 1 },
});
