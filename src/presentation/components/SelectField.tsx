import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface FieldProps {
  label: string;
  error?: string | null;
  /** What the closed field shows. */
  display: string;
  placeholder?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

// Looks like a text field but opens a picker, like the website's <select> and date inputs.
function PickerBox({ label, error, display, placeholder, icon, onPress }: FieldProps) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" color="textSecondary">{label}</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: display || placeholder }}
        onPress={onPress}
        style={[styles.box, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, borderRadius: radius.md }]}>
        <AppText style={[styles.value, styles.small]} color={display ? 'text' : 'textMuted'} numberOfLines={1}>{display || placeholder}</AppText>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
      </Pressable>
      {error ? <AppText variant="caption" color="danger" accessibilityRole="alert">{error}</AppText> : null}
    </View>
  );
}

function PickerSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={t('auth.close')} style={styles.backdrop} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.background, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }]}>
        <View style={styles.sheetHeader}>
          <AppText variant="subheading" style={styles.value}>{title}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('auth.close')} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

interface SelectProps {
  label: string;
  title?: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function SelectField({ label, title, placeholder, options, value, onChange, error }: SelectProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <PickerBox label={label} error={error} display={selected?.label ?? ''} placeholder={placeholder} icon="chevron-down" onPress={() => setOpen(true)} />
      <PickerSheet visible={open} title={title ?? label} onClose={() => setOpen(false)}>
        <FlatList
          data={options}
          keyExtractor={(o, i) => `${o.value}-${i}`}
          style={styles.list}
          renderItem={({ item }) => {
            const active = item.value === value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, backgroundColor: active || pressed ? colors.primaryLight : 'transparent' }]}>
                <AppText style={styles.value} bold={active}>{item.label}</AppText>
                {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            );
          }}
        />
      </PickerSheet>
    </>
  );
}

interface DateFieldProps {
  label: string;
  placeholder: string;
  /** The value as shown in the closed field. */
  display: string;
  error?: string | null;
  onPress: () => void;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

// A date box that opens whatever calendar is passed as children.
export function DateField({ label, placeholder, display, error, onPress, visible, onClose, children }: DateFieldProps) {
  return (
    <>
      <PickerBox label={label} error={error} display={display} placeholder={placeholder} icon="calendar-outline" onPress={onPress} />
      <PickerSheet visible={visible} title={label} onClose={onClose}>
        <View style={styles.calendar}>{children}</View>
      </PickerSheet>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  box: { minHeight: 48, borderWidth: 1.5, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { flex: 1 },
  small: { fontSize: 13 }, // matches the text inputs it sits next to
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  sheet: { maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  list: { flexGrow: 0 },
  row: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  calendar: { padding: 16, paddingTop: 0 },
});
