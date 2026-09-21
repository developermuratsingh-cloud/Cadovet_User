import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { AppText, Card, EmergencyBanner, Logo } from '../../components';
import { useLightStatusBar } from '../../hooks/useLightStatusBar';
import { useTheme } from '../../theme/useTheme';

// Brand header (emergency strip, logo, trust pill) above a form card — mirrors the website's login page.
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { t } = useTranslation();
  useLightStatusBar();
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.emergency }}>
        <EmergencyBanner />
      </SafeAreaView>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[colors.primaryLight, colors.background]} style={{ padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg, alignItems: 'center' }}>
            <Logo size={72} tagline={t('auth.tagline')} />
            <View style={[styles.pill, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.full }]}>
              <AppText variant="label" color="primaryDark">⭐ {t('auth.trusted')}</AppText>
            </View>
            <View style={{ gap: 4, alignItems: 'center' }}>
              <AppText variant="title" style={{ textAlign: 'center' }}>{title}</AppText>
              <AppText color="textSecondary" style={{ textAlign: 'center' }}>{subtitle}</AppText>
            </View>
          </LinearGradient>
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, marginTop: -spacing.lg }}>
            <Card style={{ padding: spacing.xl, gap: spacing.lg, borderRadius: radius.lg }}>{children}</Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pill: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
});
