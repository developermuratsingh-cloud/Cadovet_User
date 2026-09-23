import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { dialCode, type CountryCode } from '@/core/config/countries';
import { useLoginWithOtpMutation, useSendOtpMutation } from '@/data/api/authApi';
import { HOME_COUNTRY, toServerMobile, validateMobile } from '@/domain/usecases/validation';
import { AppText, Button, MobileField, OtpEntry } from '../../components';
import { useForm } from '../../hooks/useForm';
import { useOtpErrorMessage } from '../../hooks/useOtpErrorMessage';
import { AuthLayout } from './AuthLayout';

const validators = { mobile: (v: string, all: { country: CountryCode }) => validateMobile(v, all.country) };

// Passwordless: enter the mobile number, then the 6-digit code sent to it.
export default function LoginScreen() {
  const { t } = useTranslation();
  const otpError = useOtpErrorMessage();
  const [sendOtp, { isLoading: sending, error: sendError, reset: resetSend }] = useSendOtpMutation();
  const [login, { isLoading: verifying, error: verifyError, reset: resetVerify }] = useLoginWithOtpMutation();
  const form = useForm({ mobile: '', country: HOME_COUNTRY }, validators);
  // The number the code went to, in the form the server stores it, plus how to show it to the user.
  const [sentTo, setSentTo] = useState<{ mobile: string; label: string } | null>(null);

  const requestCode = form.handleSubmit(async ({ mobile, country }) => {
    const server = toServerMobile(mobile, country);
    try {
      await sendOtp({ mobile: server, purpose: 'login' }).unwrap();
      setSentTo({ mobile: server, label: `${dialCode(country)} ${mobile.trim()}` });
    } catch {
      // shown through sendError
    }
  });

  const changeNumber = () => {
    resetSend();
    resetVerify();
    setSentTo(null);
  };

  if (sentTo) {
    return (
      <AuthLayout title={t('otp.title')} subtitle={t('otp.sent', { mobile: sentTo.label })}>
        <OtpEntry
          submitLabel={t('otp.verifyLogin')}
          onSubmit={(code) => login({ mobile: sentTo.mobile, code })}
          onResend={() => sendOtp({ mobile: sentTo.mobile, purpose: 'login' }).unwrap()}
          onChangeNumber={changeNumber}
          loading={verifying}
          error={otpError(verifyError, 'verify') ?? otpError(sendError, 'send')}
        />
      </AuthLayout>
    );
  }

  const sendMessage = otpError(sendError, 'send');
  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <MobileField
        {...form.fieldProps('mobile')}
        country={form.values.country}
        onChangeCountry={(c) => form.setValue('country', c)}
        label={t('auth.mobile')}
        placeholder={t('auth.mobilePlaceholder')}
        returnKeyType="send"
        onSubmitEditing={requestCode}
      />
      {sendMessage ? <AppText color="danger" accessibilityRole="alert">{sendMessage}</AppText> : null}
      <Button title={t('auth.sendOtp')} onPress={requestCode} loading={sending} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <AppText color="textSecondary">{t('auth.noAccount')}</AppText>
        <Link href="/register"><AppText color="primaryDark" bold>{t('auth.signupLink')}</AppText></Link>
      </View>
    </AuthLayout>
  );
}
