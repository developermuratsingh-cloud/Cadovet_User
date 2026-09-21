import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share, View } from 'react-native';

import { useGetMyReferralQuery } from '@/data/api/offersApi';
import { AppText, AsyncBoundary, Button, Card, HeroCard, Screen, SectionHeader } from '../../components';
import { useTheme } from '../../theme/useTheme';

function Step({ n, text }: { n: number; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="label" style={{ color: '#1A2332' }}>{n}</AppText>
      </View>
      <AppText style={{ flex: 1 }}>{text}</AppText>
    </View>
  );
}

export default function ReferScreen() {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  const query = useGetMyReferralQuery();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <HeroCard>
        <AppText style={{ fontSize: 34, lineHeight: 44 }}>🎁</AppText>
        <AppText variant="title" style={{ color: '#FFFFFF' }}>{t('refer.heroTitle')}</AppText>
        <AppText style={{ color: 'rgba(255,255,255,0.92)' }}>{t('refer.heroSubtitle')}</AppText>
      </HeroCard>

      <AsyncBoundary {...query}>
        {(ref) => {
          const coupon = ref.friendCoupon;
          const offerText = coupon ? `${coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} (${coupon.code})` : t('refer.offerFallback');
          const shareMessage = t('refer.shareMessage', {
            code: ref.code,
            offer: coupon && coupon.discountType === 'PERCENT' ? t('refer.shareOffer', { value: coupon.discountValue, coupon: coupon.code }) : '',
          });

          return (
            <>
              <Card style={{ alignItems: 'center', gap: 12 }}>
                <AppText variant="label" color="textMuted">{t('refer.yourCode')}</AppText>
                <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primaryLight }}>
                  <AppText selectable variant="display" color="primaryDark" style={{ letterSpacing: 4 }} accessibilityLabel={`${t('refer.yourCode')} ${ref.code}`}>{ref.code}</AppText>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    title={copied ? t('refer.copied') : t('refer.copy')}
                    icon={copied ? 'checkmark' : 'copy-outline'}
                    variant="outline"
                    compact
                    onPress={async () => {
                      await Clipboard.setStringAsync(ref.code);
                      setCopied(true);
                      if (timer.current) clearTimeout(timer.current);
                      timer.current = setTimeout(() => setCopied(false), 2000);
                    }}
                  />
                  <Button title={t('refer.share')} icon="share-social" variant="success" compact onPress={() => Share.share({ message: shareMessage })} />
                </View>
              </Card>

              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <AppText style={{ fontSize: 30, lineHeight: 38 }}>🤝</AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" color="textMuted">{t('refer.friendsJoined')}</AppText>
                  <AppText variant="title" color="secondary">{ref.friendsJoined}</AppText>
                </View>
              </Card>

              <SectionHeader title={t('refer.howTitle')} />
              <Card style={{ gap: 14 }}>
                <Step n={1} text={t('refer.step1')} />
                <Step n={2} text={t('refer.step2')} />
                <Step n={3} text={t('refer.step3', { offer: offerText })} />
              </Card>
            </>
          );
        }}
      </AsyncBoundary>
    </Screen>
  );
}
