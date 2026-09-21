import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { passwordStrength } from '@/domain/usecases/validation';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  if (!password) return null;

  const level = passwordStrength(password);
  const tone = [colors.danger, colors.warning, colors.lime, colors.secondary][level];
  const label = [t('auth.strength.weak'), t('auth.strength.weak'), t('auth.strength.fair'), t('auth.strength.strong')][level];

  return (
    <View style={{ gap: 4 }} accessibilityLabel={label}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: radius.full, backgroundColor: i <= level ? tone : colors.border }} />
        ))}
      </View>
      <AppText variant="caption" style={{ color: tone }}>{label}</AppText>
    </View>
  );
}
