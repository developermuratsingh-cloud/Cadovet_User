import { Link } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { isApiError } from '@/core/errors';
import { useLoginMutation } from '@/data/api/authApi';
import { normalizeIdentifier, validateIdentifier } from '@/domain/usecases/validation';
import { AppText, Button, TextField } from '../../components';
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage';
import { useForm } from '../../hooks/useForm';
import { AuthLayout } from './AuthLayout';

const validators = {
  identifier: validateIdentifier,
  // Existing accounts may have short passwords, so login only requires that one is entered.
  password: (v: string) => (v ? null : ({ code: 'required' } as const)),
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const errorMessage = useApiErrorMessage();
  const [login, { isLoading, error }] = useLoginMutation();
  const passwordRef = useRef<TextInput>(null);
  const form = useForm({ identifier: '', password: '' }, validators);

  const submit = form.handleSubmit(({ identifier, password }) => {
    login({ identifier: normalizeIdentifier(identifier), password });
  });

  const serverError = error ? (isApiError(error) && error.status === 401 ? t('auth.invalidCredentials') : errorMessage(error)) : null;

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <TextField
        {...form.fieldProps('identifier')}
        label={t('auth.identifier')}
        placeholder={t('auth.identifierPlaceholder')}
        icon="person-outline"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        {...form.fieldProps('password')}
        inputRef={passwordRef}
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        icon="lock-closed-outline"
        secureTextEntry
        textContentType="password"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <View style={{ alignItems: 'flex-end', marginTop: -6 }}>
        <Link href="/forgot-password"><AppText color="primaryDark" variant="label">{t('auth.forgotPassword')}</AppText></Link>
      </View>
      {serverError ? <AppText color="danger" accessibilityRole="alert">{serverError}</AppText> : null}
      <Button title={t('auth.login')} onPress={submit} loading={isLoading} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <AppText color="textSecondary">{t('auth.noAccount')}</AppText>
        <Link href="/register"><AppText color="primaryDark" bold>{t('auth.signupLink')}</AppText></Link>
      </View>
    </AuthLayout>
  );
}
