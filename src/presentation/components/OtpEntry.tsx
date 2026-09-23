import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { validateOtp } from '@/domain/usecases/validation';
import { useForm } from '../hooks/useForm';
import { AppText } from './AppText';
import { Button } from './Button';
import { TextField } from './TextField';

const RESEND_SECONDS = 30;
const validators = { code: validateOtp };

interface Props {
  submitLabel: string;
  submitVariant?: 'primary' | 'danger';
  onSubmit: (code: string) => void;
  /** Must reject when sending fails, so the cooldown only starts after a code actually went out. */
  onResend: () => Promise<unknown>;
  /** Optional: lets the user go back and correct the number. */
  onChangeNumber?: () => void;
  loading?: boolean;
  error?: string | null;
}

/** The "enter the 6-digit code we texted you" step shared by sign in, sign up and account deletion. */
export function OtpEntry({ submitLabel, submitVariant, onSubmit, onResend, onChangeNumber, loading, error }: Props) {
  const { t } = useTranslation();
  const form = useForm({ code: '' }, validators);
  // A code was just sent to reach this step, so the first resend is only offered after the cooldown.
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = form.handleSubmit(({ code }) => onSubmit(code.trim()));
  const resend = async () => {
    try {
      await onResend();
      setCooldown(RESEND_SECONDS);
    } catch {
      // the calling screen shows the reason
    }
  };

  return (
    <>
      <TextField
        {...form.fieldProps('code', (v) => v.replace(/\D/g, '').slice(0, 6))}
        label={t('otp.code')}
        placeholder={t('otp.codePlaceholder')}
        icon="keypad-outline"
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {error ? <AppText color="danger" accessibilityRole="alert">{error}</AppText> : null}
      <Button title={submitLabel} variant={submitVariant} onPress={submit} loading={loading} />
      <Pressable accessibilityRole="button" disabled={cooldown > 0} onPress={resend} hitSlop={8} style={{ alignItems: 'center' }}>
        <AppText color={cooldown > 0 ? 'textMuted' : 'primaryDark'} bold={cooldown <= 0}>
          {cooldown > 0 ? t('otp.resendIn', { seconds: cooldown }) : t('otp.resend')}
        </AppText>
      </Pressable>
      {onChangeNumber ? (
        <Pressable accessibilityRole="button" onPress={onChangeNumber} hitSlop={8} style={{ alignItems: 'center' }}>
          <AppText color="primaryDark" bold>{t('otp.change')}</AppText>
        </Pressable>
      ) : null}
    </>
  );
}
