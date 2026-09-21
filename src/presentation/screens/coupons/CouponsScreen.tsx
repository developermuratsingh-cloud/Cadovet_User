import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetCouponsQuery } from '@/data/api/offersApi';
import type { Coupon } from '@/domain/entities';
import { AppText, AsyncBoundary, Button, Card, Screen } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { bookingReset, couponChanged } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { formatDate } from '../../utils/format';

export default function CouponsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors, radius } = useTheme();
  const language = useAppSelector(selectLanguage);
  const query = useGetCouponsQuery();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const useOnBooking = (code: string) => {
    dispatch(bookingReset());
    dispatch(couponChanged(code)); // validated against the chosen service on the review step
    router.push('/book');
  };

  const offerLabel = (c: Coupon) => (c.discountType === 'PERCENT' ? t('coupons.percentOff', { value: c.discountValue }) : t('coupons.flatOff', { value: c.discountValue }));

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <AppText color="textSecondary">{t('coupons.subtitle')}</AppText>
      <AsyncBoundary {...query} isEmpty={(d) => d.length === 0} emptyMessage={t('coupons.empty')}>
        {(coupons) =>
          coupons.map((c) => (
            <Card key={c.code} style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.primaryLight }}>
                  <AppText variant="subheading" color="primaryDark" style={{ letterSpacing: 1 }}>{c.code}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="subheading">{offerLabel(c)}</AppText>
                  <AppText variant="caption" color="textMuted">{c.title}</AppText>
                </View>
              </View>
              {c.description ? <AppText variant="caption" color="textSecondary">{c.description}</AppText> : null}
              <AppText variant="caption" color="textMuted">
                {[c.minAmount > 0 ? t('coupons.minAmount', { amount: c.minAmount }) : null, c.validUntil ? t('coupons.validUntil', { date: formatDate(c.validUntil, language) }) : null].filter(Boolean).join('  ·  ')}
              </AppText>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <Button
                  title={copiedCode === c.code ? t('coupons.copied') : t('coupons.copy')}
                  icon={copiedCode === c.code ? 'checkmark' : 'copy-outline'}
                  variant="outline"
                  compact
                  onPress={async () => {
                    await Clipboard.setStringAsync(c.code);
                    setCopiedCode(c.code);
                    setTimeout(() => setCopiedCode((cur) => (cur === c.code ? null : cur)), 2000);
                  }}
                />
                <Button title={t('coupons.use')} icon="calendar" variant="success" compact onPress={() => useOnBooking(c.code)} />
              </View>
            </Card>
          ))
        }
      </AsyncBoundary>
    </Screen>
  );
}
