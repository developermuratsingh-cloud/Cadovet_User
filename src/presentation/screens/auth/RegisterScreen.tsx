import { Link } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { isApiError } from '@/core/errors';
import { useSignupMutation } from '@/data/api/authApi';
import { normalizeIdentifier, validateCode, validateConfirmPassword, validateIdentifier, validateName, validatePassword } from '@/domain/usecases/validation';
import { AppText, Button, PasswordStrength, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { AuthLayout } from './AuthLayout';

const validators = {
  name: validateName,
  identifier: validateIdentifier,
  password: validatePassword,
  confirm: (v: string, all: { password: string }) => validateConfirmPassword(v, all.password),
  referralCode: validateCode(true),
};

export default function RegisterScreen() {
  const { t } = useTranslation();
  const errorMessage = useApiErrorMessage();
  const [signup, { isLoading, error }] = useSignupMutation();
  const identifierRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const referralRef = useRef<TextInput>(null);
  const form = useForm({ name: '', identifier: '', password: '', confirm: '', referralCode: '' }, validators);

  const submit = form.handleSubmit(({ name, identifier, password, referralCode }) => {
    signup({ name: name.trim(), identifier: normalizeIdentifier(identifier), password, referralCode: referralCode.trim() || undefined });
  });

  const serverError = error
    ? isApiError(error) && error.status === 409
      ? t('auth.alreadyExists')
      : isApiError(error) && error.status === 400 && /referral/i.test(error.message)
        ? t('auth.referralNotFound')
        : errorMessage(error)
    : null;

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
        onSubmitEditing={() => identifierRef.current?.focus()}
      />
      <TextField
        {...form.fieldProps('identifier')}
        inputRef={identifierRef}
        label={t('auth.identifier')}
        placeholder={t('auth.identifierPlaceholder')}
        icon="mail-outline"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <View style={{ gap: 8 }}>
        <TextField
          {...form.fieldProps('password')}
          inputRef={passwordRef}
          label={t('auth.password')}
          placeholder={t('auth.newPasswordPlaceholder')}
          icon="lock-closed-outline"
          secureTextEntry
          maxLength={72}
          textContentType="newPassword"
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <PasswordStrength password={form.values.password} />
      </View>
      <TextField
        {...form.fieldProps('confirm')}
        inputRef={confirmRef}
        label={t('auth.confirmPassword')}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        icon="shield-checkmark-outline"
        secureTextEntry
        maxLength={72}
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => referralRef.current?.focus()}
      />
      <TextField
        {...form.fieldProps('referralCode', (v) => v.toUpperCase().replace(/\s/g, ''))}
        inputRef={referralRef}
        label={t('auth.referralCode')}
        placeholder={t('auth.referralPlaceholder')}
        icon="gift-outline"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {serverError ? <AppText color="danger" accessibilityRole="alert">{serverError}</AppText> : null}
      <Button title={t('auth.createAccount')} onPress={submit} loading={isLoading} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <AppText color="textSecondary">{t('auth.haveAccount')}</AppText>
        <Link href="/login"><AppText color="primaryDark" bold>{t('auth.loginLink')}</AppText></Link>
      </View>
    </AuthLayout>
  );
}
