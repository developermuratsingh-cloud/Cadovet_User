import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { isApiError } from '@/core/errors';
import { useDeleteAccountMutation, useGetMeQuery, useSendDeleteOtpMutation } from '@/data/api/userApi';
import { AppText, Button, Card, OtpEntry, Screen } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useTheme } from '../../theme/useTheme';

const BULLETS = ['b1', 'b2', 'b3', 'b4', 'b5'] as const;

// Deleting is irreversible, so it needs fresh proof of ownership: a code texted to the account's mobile number.
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const errorMessage = useApiErrorMessage();
  const { data: me } = useGetMeQuery();
  const mobile = me?.profile.mobile;
  const [sendCode, { isLoading: sending, error: sendError }] = useSendDeleteOtpMutation();
  const [deleteAccount, { isLoading: deleting, error: deleteError }] = useDeleteAccountMutation();
  const [codeSent, setCodeSent] = useState(false);

  const send = async () => {
    try {
      await sendCode().unwrap();
      setCodeSent(true);
    } catch {
      // shown through sendError
    }
  };

  const confirm = (code: string) =>
    Alert.alert(t('deleteAccount.confirmTitle'), t('deleteAccount.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      // On success the mutation clears the session and the router returns to Login.
      { text: t('deleteAccount.confirm'), style: 'destructive', onPress: () => deleteAccount({ code }) },
    ]);

  // 403 = wrong/expired code (or a staff account); the server text tells the two apart.
  const deleteMessage = deleteError
    ? isApiError(deleteError) && deleteError.status === 403
      ? /code/i.test(deleteError.message) ? t('deleteAccount.wrongCode') : t('deleteAccount.staffBlocked')
      : isApiError(deleteError) && deleteError.status === 429 ? t('otp.tooMany') : errorMessage(deleteError)
    : null;
  const sendMessage = sendError ? (isApiError(sendError) && sendError.status === 429 ? t('otp.tooManyRequests') : errorMessage(sendError)) : null;

  return (
    <Screen edges={['left', 'right', 'bottom']} footer={codeSent ? undefined : <Button title={t('deleteAccount.sendCode')} icon="chatbubble-outline" variant="danger" onPress={send} loading={sending} disabled={!mobile} />}>
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

      {me && !mobile ? <AppText color="danger" accessibilityRole="alert">{t('deleteAccount.noMobile')}</AppText> : null}
      {mobile ? <AppText color="textSecondary">{t('deleteAccount.verifyIntro', { mobile })}</AppText> : null}
      {sendMessage ? <AppText color="danger" accessibilityRole="alert">{sendMessage}</AppText> : null}

      {codeSent ? (
        <OtpEntry
          submitLabel={t('deleteAccount.button')}
          submitVariant="danger"
          onSubmit={confirm}
          onResend={() => sendCode().unwrap()}
          loading={deleting}
          error={deleteMessage}
        />
      ) : null}
    </Screen>
  );
}
