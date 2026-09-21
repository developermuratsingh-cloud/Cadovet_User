import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAppSelector } from '../state/hooks/useAppSelector';
import { selectIsOnline } from '../state/selectors/appSelectors';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export function OfflineBanner() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const online = useAppSelector(selectIsOnline);
  if (online) return null;
  return (
    <View accessibilityRole="alert" style={{ backgroundColor: colors.warning, paddingVertical: 6, paddingHorizontal: 16 }}>
      <AppText variant="caption" style={{ color: '#000', textAlign: 'center', fontWeight: '600' }}>{t('errors.offline')}</AppText>
    </View>
  );
}
