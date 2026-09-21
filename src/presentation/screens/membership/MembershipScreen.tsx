import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useGetMembershipOffersQuery } from '@/data/api/offersApi';
import type { MembershipOffer } from '@/domain/entities';
import { AppText, AsyncBoundary, Button, Card, Chip, Screen } from '../../components';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { useTheme } from '../../theme/useTheme';
import { openWhatsApp } from '../../utils/contact';
import { formatCurrency } from '../../utils/format';

type Filter = 'all' | 'Dogs' | 'Cats';

function OfferCard({ offer }: { offer: MembershipOffer }) {
  const { t } = useTranslation();
  const { colors, radius } = useTheme();
  const language = useAppSelector(selectLanguage);
  const saving = offer.originalPrice && offer.originalPrice > offer.price ? offer.originalPrice - offer.price : 0;
  const percent = saving && offer.originalPrice ? Math.round((saving / offer.originalPrice) * 100) : 0;

  return (
    <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
      {offer.imageUrl ? <Image source={{ uri: offer.imageUrl }} style={{ width: '100%', height: 150, backgroundColor: colors.primaryLight }} contentFit="contain" accessibilityLabel={offer.title} /> : null}
      <View style={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {offer.badge ? (
            <View style={{ backgroundColor: colors.lime, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 2 }}>
              <AppText variant="caption" style={{ color: '#1A2332', fontFamily: 'Poppins_700Bold', fontSize: 11 }}>{offer.badge}</AppText>
            </View>
          ) : null}
          <View style={{ backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 2 }}>
            <AppText variant="caption" color="primaryDark" style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11 }}>{offer.petType === 'Dogs' ? '🐶' : '🐱'} {t(`membership.${offer.petType === 'Dogs' ? 'dogs' : 'cats'}`)}</AppText>
          </View>
        </View>
        <AppText variant="heading">{offer.title}</AppText>
        {offer.subtitle ? <AppText variant="caption" color="textMuted">{offer.subtitle}</AppText> : null}

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <AppText variant="title" color="primaryDark">{formatCurrency(offer.price, language)}</AppText>
          {saving > 0 && offer.originalPrice ? <AppText color="textMuted" style={{ textDecorationLine: 'line-through', marginBottom: 3 }}>{formatCurrency(offer.originalPrice, language)}</AppText> : null}
        </View>
        {saving > 0 ? (
          <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(76,175,80,0.14)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 3 }}>
            <AppText variant="label" color="success">{t('membership.save', { amount: formatCurrency(saving, language), percent })}</AppText>
          </View>
        ) : null}
        {offer.rating ? <AppText variant="caption" color="warning">★ {offer.rating.toFixed(1)}  <AppText variant="caption" color="textMuted">({t('membership.reviews', { count: offer.reviewsCount })})</AppText></AppText> : null}

        {offer.inclusions.length > 0 ? (
          <View style={{ gap: 4, marginTop: 4 }}>
            <AppText variant="label" color="textSecondary">{t('membership.includes')}</AppText>
            {offer.inclusions.map((line) => (
              <View key={line} style={{ flexDirection: 'row', gap: 8 }}>
                <AppText color="secondary">✓</AppText>
                <AppText variant="caption" style={{ flex: 1 }}>{line}</AppText>
              </View>
            ))}
          </View>
        ) : null}

        <Button title={t('membership.enquire')} icon="logo-whatsapp" variant="whatsapp" compact onPress={() => openWhatsApp(t('membership.enquiryMessage', { lng: 'en', title: offer.title, price: formatCurrency(offer.price, 'en') }))} style={{ marginTop: 8 }} />
      </View>
    </Card>
  );
}

export default function MembershipScreen() {
  const { t } = useTranslation();
  const query = useGetMembershipOffersQuery();
  const [filter, setFilter] = useState<Filter>('all');
  const offers = useMemo(() => (query.data ?? []).filter((o) => filter === 'all' || o.petType === filter), [query.data, filter]);

  return (
    <Screen edges={['left', 'right', 'bottom']} refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch}>
      <AppText color="textSecondary">{t('membership.subtitle')}</AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip label={t('membership.all')} selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label={`🐶 ${t('membership.dogs')}`} selected={filter === 'Dogs'} onPress={() => setFilter('Dogs')} />
        <Chip label={`🐱 ${t('membership.cats')}`} selected={filter === 'Cats'} onPress={() => setFilter('Cats')} />
      </View>
      <AsyncBoundary {...query} isEmpty={() => offers.length === 0} emptyMessage={t('membership.empty')}>
        {() => offers.map((o) => <OfferCard key={o.id} offer={o} />)}
      </AsyncBoundary>
    </Screen>
  );
}
