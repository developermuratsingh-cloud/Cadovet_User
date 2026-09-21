import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { HELPLINE_DISPLAY } from '@/core/config/contact';
import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { callHelpline } from '../utils/contact';
import { AppText } from './AppText';

// The website's "24X7 emergency" strip; tapping it dials the helpline.
export function EmergencyBanner() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${t('support.emergency')} ${HELPLINE_DISPLAY}`} onPress={callHelpline} style={[styles.bar, { backgroundColor: colors.emergency }]}>
      <Ionicons name="alert-circle" size={18} color={colors.accent} />
      <AppText style={{ color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.4, flexShrink: 1 }}>
        {t('support.emergency')}  <AppText style={{ color: colors.lime, fontFamily: fonts.bold, fontSize: 12 }}>{HELPLINE_DISPLAY}</AppText>
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({ bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 14 } });
