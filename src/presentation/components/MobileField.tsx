import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { dialCode, flagEmoji, type CountryCode } from '@/core/config/countries';
import { sanitizePhoneInput } from '@/domain/usecases/validation';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { CountryPickerModal } from './CountryPickerModal';
import { TextField } from './TextField';

type FieldProps = Omit<ComponentProps<typeof TextField>, 'value' | 'onChangeText' | 'leading' | 'icon' | 'keyboardType' | 'secureTextEntry' | 'maxLength'>;

interface Props extends FieldProps {
  value: string;
  country: CountryCode;
  onChangeText: (value: string) => void;
  onChangeCountry: (country: CountryCode) => void;
}

/** Mobile number input with a country-code button that opens a searchable list. Only digits can be typed. */
export function MobileField({ value, country, onChangeText, onChangeCountry, ...rest }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [picking, setPicking] = useState(false);

  const handleChange = (text: string) => {
    const phone = sanitizePhoneInput(text, country);
    // A pasted "+44 …" number moves the country button with it.
    if (phone.country !== country) onChangeCountry(phone.country);
    onChangeText(phone.digits);
  };

  return (
    <>
      <TextField
        {...rest}
        value={value}
        onChangeText={handleChange}
        leading={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('auth.countryCode')} ${dialCode(country)}`}
            onPress={() => setPicking(true)}
            hitSlop={8}
            style={[styles.code, { borderRightColor: colors.border }]}
          >
            <AppText style={styles.flag}>{flagEmoji(country)}</AppText>
            <AppText bold>{dialCode(country)}</AppText>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        }
        keyboardType="phone-pad"
        maxLength={20}
        autoCorrect={false}
        textContentType="telephoneNumber"
        autoComplete="tel"
      />
      <CountryPickerModal
        visible={picking}
        selected={country}
        onSelect={(code) => {
          onChangeCountry(code);
          setPicking(false);
        }}
        onClose={() => setPicking(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  code: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 10, borderRightWidth: 1, minHeight: 28 },
  flag: { fontSize: 20, lineHeight: 26 },
});
