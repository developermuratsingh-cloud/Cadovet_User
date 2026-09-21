import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { isApiError } from '@/core/errors';
import { useDeleteAccountMutation } from '@/data/api/userApi';
import { AppText, Button, Card, Screen, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { useTheme } from '../../theme/useTheme';

const BULLETS = ['b1', 'b2', 'b3', 'b4', 'b5'] as const;
const validators = { password: (v: string) => (v ? null : ({ code: 'required' } as const)) };

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const [deleteAccount, { isLoading, error }] = useDeleteAccountMutation();
  const form = useForm({ password: '' }, validators);

  const confirm = form.handleSubmit(({ password }) =>
    Alert.alert(t('deleteAccount.confirmTitle'), t('deleteAccount.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      // On success the mutation clears the session and the router returns to Login.
      { text: t('deleteAccount.confirm'), style: 'destructive', onPress: () => deleteAccount({ password }) },
    ]),
  );

  // 403 = wrong password (or a staff account); the server text tells the two apart.
  const serverError = error
    ? isApiError(error) && error.status === 403
      ? /password/i.test(error.message) ? t('deleteAccount.wrongPassword') : t('deleteAccount.staffBlocked')
      : errorMessage(error)
    : null;

  return (
    <Screen edges={['left', 'right', 'bottom']} footer={<Button title={t('deleteAccount.button')} icon="trash-outline" variant="danger" onPress={confirm} loading={isLoading} />}>
      <Card style={{ borderColor: colors.danger, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="warning" size={24} color={colors.danger} />
          <AppText variant="heading" color="danger">{t('deleteAccount.warningTitle')}</AppText>
        </View>
        <AppText color="textSecondary">{t('deleteAccount.intro')}</AppText>
        {BULLETS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', gap: 10 }}>
            <AppText color="danger">•</AppText>
            <AppText style={{ flex: 1 }}>{t(`deleteAccount.${b}`)}</AppText>
          </View>
        ))}
      </Card>

      <TextField
        {...form.fieldProps('password')}
        label={t('deleteAccount.password')}
        icon="lock-closed-outline"
        secureTextEntry
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={confirm}
      />
      {serverError ? <AppText color="danger" accessibilityRole="alert">{serverError}</AppText> : null}
    </Screen>
  );
}
