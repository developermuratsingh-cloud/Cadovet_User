import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { dialCode, type CountryCode } from '@/core/config/countries';
import { useSendOtpMutation, useSignupWithOtpMutation } from '@/data/api/authApi';
import { HOME_COUNTRY, toServerMobile, validateCode, validateMobile, validateName, validateOptionalEmail } from '@/domain/usecases/validation';
import { AppText, Button, MobileField, OtpEntry, TextField } from '../../components';
import { useForm } from '../../hooks/useForm';
import { useOtpErrorMessage } from '../../hooks/useOtpErrorMessage';
import { AuthLayout } from './AuthLayout';

const validators = {
  name: validateName,
  mobile: (v: string, all: { country: CountryCode }) => validateMobile(v, all.country),
  email: validateOptionalEmail,
  referralCode: validateCode(true),
};

// Mobile number is required (it receives the sign-in code); email is optional. No password: the code proves the number.
export default function RegisterScreen() {
  const { t } = useTranslation();
  const otpError = useOtpErrorMessage();
  const [sendOtp, { isLoading: sending, error: sendError, reset: resetSend }] = useSendOtpMutation();
  const [signup, { isLoading: verifying, error: verifyError, reset: resetVerify }] = useSignupWithOtpMutation();
  const mobileRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const referralRef = useRef<TextInput>(null);
  const form = useForm({ name: '', mobile: '', country: HOME_COUNTRY, email: '', referralCode: '' }, validators);
  const [sentTo, setSentTo] = useState<{ mobile: string; label: string } | null>(null);

  const requestCode = form.handleSubmit(async ({ mobile, country, email }) => {
    const server = toServerMobile(mobile, country);
    try {
      // The email goes along so the server can reject one that is already taken before any SMS is sent.
      await sendOtp({ mobile: server, purpose: 'signup', email: email.trim() || undefined }).unwrap();
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
    const { name, email, referralCode } = form.values;
    return (
      <AuthLayout title={t('otp.title')} subtitle={t('otp.sent', { mobile: sentTo.label })}>
        <OtpEntry
          submitLabel={t('otp.verifySignup')}
          onSubmit={(code) =>
            signup({ name: name.trim(), mobile: sentTo.mobile, email: email.trim() || undefined, referralCode: referralCode.trim() || undefined, code })
          }
          onResend={() => sendOtp({ mobile: sentTo.mobile, purpose: 'signup', email: email.trim() || undefined }).unwrap()}
          onChangeNumber={changeNumber}
          loading={verifying}
          error={otpError(verifyError, 'verify') ?? otpError(sendError, 'send')}
        />
      </AuthLayout>
    );
  }

  const sendMessage = otpError(sendError, 'send');
  return (
    <AuthLayout title={t('auth.signupTitle')} subtitle={t('auth.signupSubtitle')}>
      <TextField
        {...form.fieldProps('name')}
        label={t('auth.name')}
        placeholder={t('auth.namePlaceholder')}
        icon="happy-outline"
        maxLength={60}
        textContentType="name"
        autoComplete="name"
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => mobileRef.current?.focus()}
      />
      <MobileField
        {...form.fieldProps('mobile')}
        country={form.values.country}
        onChangeCountry={(c) => form.setValue('country', c)}
        inputRef={mobileRef}
        label={t('auth.mobile')}
        placeholder={t('auth.mobilePlaceholder')}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        {...form.fieldProps('email')}
        inputRef={emailRef}
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        icon="mail-outline"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={() => referralRef.current?.focus()}
      />
      <TextField
        {...form.fieldProps('referralCode')}
        inputRef={referralRef}
        label={t('auth.referralCode')}
        placeholder={t('auth.referralPlaceholder')}
        icon="gift-outline"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        returnKeyType="go"
        onSubmitEditing={requestCode}
      />
      {sendMessage ? <AppText color="danger" accessibilityRole="alert">{sendMessage}</AppText> : null}
      <Button title={t('auth.sendOtp')} onPress={requestCode} loading={sending} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <AppText color="textSecondary">{t('auth.haveAccount')}</AppText>
        <Link href="/login"><AppText color="primaryDark" bold>{t('auth.loginLink')}</AppText></Link>
      </View>
    </AuthLayout>
  );
}
