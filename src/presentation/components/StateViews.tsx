import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useApiErrorMessage } from '../hooks/useApiErrorMessage';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Button } from './Button';

export function LoadingView() {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({ message, emoji = '🐾', actionLabel, onAction }: { message: string; emoji?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.center}>
      <AppText style={{ fontSize: 40, lineHeight: 52 }}>{emoji}</AppText>
      <AppText color="textSecondary" style={styles.centerText}>{message}</AppText>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="outline" compact /> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => unknown }) {
  const { t } = useTranslation();
  const message = useApiErrorMessage()(error);
  return (
    <View style={styles.center}>
      <AppText style={{ fontSize: 40, lineHeight: 52 }}>📡</AppText>
      <AppText color="textSecondary" style={styles.centerText}>{message}</AppText>
      <Button title={t('common.retry')} onPress={onRetry} variant="outline" compact />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: 40, alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  centerText: { textAlign: 'center' },
});
