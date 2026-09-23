import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { filterCountries, getCountryList, type Country, type CountryCode } from '@/core/config/countries';
import type { LanguageCode } from '@/core/config/languages';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { SearchBar } from './SearchBar';

interface Props {
  visible: boolean;
  selected: CountryCode;
  onSelect: (code: CountryCode) => void;
  onClose: () => void;
}

const ROW_HEIGHT = 56;

export function CountryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { colors, spacing } = useTheme();
  const [query, setQuery] = useState('');

  const all = useMemo(() => getCountryList(i18n.language === 'hi' ? ('hi' satisfies LanguageCode) : 'en'), [i18n.language]);
  const countries = useMemo(() => filterCountries(all, query), [all, query]);
  // Open scrolled to the current country instead of always at "Afghanistan".
  const selectedIndex = query ? -1 : countries.findIndex((c) => c.code === selected);

  const close = () => {
    setQuery('');
    onClose();
  };
  const choose = (code: CountryCode) => {
    setQuery('');
    onSelect(code);
  };

  const renderItem = ({ item }: { item: Country }) => {
    const active = item.code === selected;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${item.name} ${item.dial}`}
        onPress={() => choose(item.code)}
        style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, backgroundColor: active || pressed ? colors.primaryLight : 'transparent' }]}
      >
        <AppText style={styles.flag}>{item.flag}</AppText>
        <AppText style={styles.name} numberOfLines={1} bold={active}>{item.name}</AppText>
        <AppText color="textSecondary">{item.dial}</AppText>
        <View style={styles.check}>{active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}</View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { padding: spacing.lg }]}>
          <AppText variant="heading" style={styles.flex}>{t('auth.selectCountry')}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('auth.close')} onPress={close} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('auth.searchCountry')} maxLength={40} />
        </View>
        <FlatList
          data={countries}
          keyExtractor={(c) => c.code}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
          initialScrollIndex={selectedIndex > 0 ? selectedIndex : undefined}
          initialNumToRender={20}
          ListEmptyComponent={<AppText color="textMuted" style={styles.empty}>{t('auth.noCountry')}</AppText>}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  flag: { fontSize: 24, lineHeight: 30 },
  name: { flex: 1 },
  check: { width: 20, alignItems: 'center' },
  empty: { textAlign: 'center', padding: 32 },
});
