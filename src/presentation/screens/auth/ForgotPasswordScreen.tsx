import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput, View } from 'react-native';

import { isApiError } from '@/core/errors';
import { useForgotPasswordMutation, useResetPasswordMutation } from '@/data/api/authApi';
import { normalizeIdentifier, validateConfirmPassword, validateIdentifier, validateOtp, validatePassword } from '@/domain/usecases/validation';
import { AppText, Button, PasswordStrength, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { AuthLayout } from './AuthLayout';

const RESEND_SECONDS = 30;
const requestValidators = { identifier: validateIdentifier };
const resetValidators = {
  code: validateOtp,
  password: validatePassword,
  confirm: (v: string, all: { password: string }) => validateConfirmPassword(v, all.password),
};

// Two steps on one screen: ask for the email/mobile, then enter the code and choose a new password.
export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const errorMessage = useApiErrorMessage();
  const [sendCode, { isLoading: sending, error: sendError }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting, error: resetError }] = useResetPasswordMutation();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const requestForm = useForm({ identifier: '' }, requestValidators);
  const resetForm = useForm({ code: '', password: '', confirm: '' }, resetValidators);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submitRequest = requestForm.handleSubmit(async ({ identifier: raw }) => {
    const id = normalizeIdentifier(raw);
    try {
      await sendCode({ identifier: id }).unwrap();
      setIdentifier(id);
      setStep('reset');
      setCooldown(RESEND_SECONDS);
    } catch {
      // shown through sendError
    }
  });

  const resend = async () => {
    try {
      await sendCode({ identifier }).unwrap();
      setCooldown(RESEND_SECONDS);
    } catch {
      // shown through sendError
    }
  };

  const submitReset = resetForm.handleSubmit(async ({ code, password }) => {
    try {
      await resetPassword({ identifier, code: code.trim(), password }).unwrap();
      Alert.alert(t('forgot.done'));
      router.replace('/login');
    } catch {
      // shown through resetError
    }
  });

  const resetMessage = resetError
    ? isApiError(resetError) && resetError.status === 429
      ? t('forgot.tooMany')
      : isApiError(resetError) && resetError.status === 400 && /code/i.test(resetError.message)
        ? t('forgot.invalidCode')
        : errorMessage(resetError)
    : null;

  return (
    <AuthLayout title={t('forgot.title')} subtitle={step === 'request' ? t('forgot.subtitle') : t('forgot.sent', { identifier })}>
      {step === 'request' ? (
        <>
          <TextField
            {...requestForm.fieldProps('identifier')}
            label={t('auth.identifier')}
            placeholder={t('auth.identifierPlaceholder')}
            icon="person-outline"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            autoComplete="username"
            returnKeyType="send"
            onSubmitEditing={submitRequest}
          />
          {sendError ? <AppText color="danger" accessibilityRole="alert">{errorMessage(sendError)}</AppText> : null}
          <Button title={t('forgot.sendCode')} icon="mail-outline" onPress={submitRequest} loading={sending} />
        </>
      ) : (
        <>
          <TextField
            {...resetForm.fieldProps('code', (v) => v.replace(/\D/g, '').slice(0, 6))}
            label={t('forgot.code')}
            placeholder={t('forgot.codePlaceholder')}
            icon="keypad-outline"
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <View style={{ gap: 8 }}>
            <TextField
              {...resetForm.fieldProps('password')}
              inputRef={passwordRef}
              label={t('forgot.newPassword')}
              placeholder={t('auth.newPasswordPlaceholder')}
              icon="lock-closed-outline"
              secureTextEntry
              maxLength={72}
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <PasswordStrength password={resetForm.values.password} />
          </View>
          <TextField
            {...resetForm.fieldProps('confirm')}
            inputRef={confirmRef}
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            icon="shield-checkmark-outline"
            secureTextEntry
            maxLength={72}
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submitReset}
          />
          {resetMessage ? <AppText color="danger" accessibilityRole="alert">{resetMessage}</AppText> : null}
          {sendError ? <AppText color="danger" accessibilityRole="alert">{errorMessage(sendError)}</AppText> : null}
          <Button title={t('forgot.reset')} icon="checkmark-circle" variant="success" onPress={submitReset} loading={resetting} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Button
              title={cooldown > 0 ? t('forgot.resendIn', { seconds: cooldown }) : t('forgot.resend')}
              variant="ghost"
              compact
              disabled={cooldown > 0}
              loading={sending}
              onPress={resend}
            />
            <Button title={t('forgot.change')} variant="ghost" compact onPress={() => setStep('request')} />
          </View>
        </>
      )}
      <View style={{ alignItems: 'center' }}>
        <Link href="/login"><AppText color="primaryDark" bold>{t('forgot.backToLogin')}</AppText></Link>
      </View>
    </AuthLayout>
  );
}
