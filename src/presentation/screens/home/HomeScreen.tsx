import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetAppointmentsQuery } from '@/data/api/appointmentApi';
import { useGetBlogsQuery } from '@/data/api/blogApi';
import { useGetDoctorsQuery } from '@/data/api/doctorApi';
import { useGetPetsQuery } from '@/data/api/petApi';
import { useGetServicesQuery } from '@/data/api/serviceApi';
import type { Service } from '@/domain/entities';
import { partitionAppointments } from '@/domain/usecases/appointments';
import { filterServices } from '@/domain/usecases/search';
import { AppText, Avatar, BlogCard, Button, Card, EmergencyBanner, EmojiTile, EmptyState, ErrorState, HeroCard, LoadingView, Logo, MenuButton, Screen, SearchBar, SectionHeader } from '../../components';
import { useLightStatusBar } from '../../hooks/useLightStatusBar';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectLanguage } from '../../state/selectors/languageSelectors';
import { selectCurrentUser } from '../../state/selectors/userSelectors';
import { bookingReset, serviceSelected } from '../../state/slices/bookingSlice';
import { useTheme } from '../../theme/useTheme';
import { formatCurrency } from '../../utils/format';
import { serviceEmoji } from '../../utils/icons';
import { AppointmentCard } from '../appointments/AppointmentCard';

export default function HomeScreen() {
  const { t } = useTranslation();
  useLightStatusBar();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors, spacing } = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const language = useAppSelector(selectLanguage);
  const appointments = useGetAppointmentsQuery();
  const pets = useGetPetsQuery();
  const doctors = useGetDoctorsQuery();
  const services = useGetServicesQuery();
  const blogs = useGetBlogsQuery();
  const [query, setQuery] = useState('');

  const upcoming = useMemo(() => (appointments.data ? partitionAppointments(appointments.data).upcoming : []), [appointments.data]);
  const searching = query.trim().length > 0;
  const results = useMemo(() => filterServices(services.data ?? [], query.trim()), [services.data, query]);
  const refreshing = (appointments.isFetching || pets.isFetching || doctors.isFetching || services.isFetching || blogs.isFetching) && !appointments.isLoading;
  const refresh = () => {
    appointments.refetch();
    pets.refetch();
    doctors.refetch();
    services.refetch();
    blogs.refetch();
  };

  const startBooking = () => {
    dispatch(bookingReset());
    router.push('/book');
  };
  // Tapping a service jumps straight to choosing the pet for it.
  const bookService = (service: Service) => {
    dispatch(bookingReset());
    dispatch(serviceSelected(service));
    router.push('/book');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.emergency }}>
        <EmergencyBanner />
      </SafeAreaView>
      <Screen edges={[]} refreshing={refreshing} onRefresh={refresh} contentStyle={{ paddingBottom: 96 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MenuButton />
          <View style={{ flex: 1 }}>
            <Logo size={38} tagline={t('auth.tagline')} />
          </View>
          {user ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('tabs.profile')} onPress={() => router.push('/profile')}>
              <Avatar name={user.name} size={42} />
            </Pressable>
          ) : null}
        </View>

        <SearchBar value={query} onChangeText={setQuery} placeholder={t('search.placeholder')} />

        {searching ? (
          <View style={{ gap: spacing.md }}>
            {services.isLoading ? (
              <LoadingView />
            ) : services.error && !services.data ? (
              <ErrorState error={services.error} onRetry={services.refetch} />
            ) : results.length === 0 ? (
              <EmptyState emoji="🔍" message={t('search.noResults', { query: query.trim() })} />
            ) : (
              <>
                <AppText variant="label" color="textMuted">{t('search.results', { count: results.length })}</AppText>
                {results.map((s) => (
                  <Card key={s.id} onPress={() => bookService(s)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <EmojiTile emoji={serviceEmoji(s.category, s.name)} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="subheading">{s.name}</AppText>
                      {s.description ? <AppText variant="caption" color="textMuted" numberOfLines={2}>{s.description}</AppText> : null}
                      <AppText variant="label" color="primaryDark">{formatCurrency(s.price, language)}</AppText>
                    </View>
                  </Card>
                ))}
              </>
            )}
          </View>
        ) : (
          <>
            <HeroCard>
              <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>👋 {t('home.welcomeBack')}</AppText>
              <AppText variant="title" style={{ color: '#FFFFFF' }} numberOfLines={2}>{user?.name ?? ' '}!</AppText>
              <AppText style={{ color: 'rgba(255,255,255,0.92)' }}>{t('home.heroSubtitle')}</AppText>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <Button title={t('home.bookAppointment')} icon="calendar" variant="success" compact onPress={startBooking} />
                <Button title={t('home.addNewPet')} variant="glass" compact onPress={() => router.push('/pet/form')} />
              </View>
            </HeroCard>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Card style={{ flex: 1, alignItems: 'center' }} onPress={() => router.push('/pets')}>
                <AppText style={{ fontSize: 26, lineHeight: 34 }}>🐾</AppText>
                <AppText variant="display" color="primary">{pets.data?.length ?? '–'}</AppText>
                <AppText variant="label" color="textMuted" style={{ textAlign: 'center' }}>{t('home.statPets')}</AppText>
              </Card>
              <Card style={{ flex: 1, alignItems: 'center' }} onPress={() => router.push('/appointments')}>
                <AppText style={{ fontSize: 26, lineHeight: 34 }}>📅</AppText>
                <AppText variant="display" color="secondary">{appointments.data ? upcoming.length : '–'}</AppText>
                <AppText variant="label" color="textMuted" style={{ textAlign: 'center' }}>{t('home.statUpcoming')}</AppText>
              </Card>
            </View>

            {services.data?.length ? (
              <View style={{ gap: spacing.md }}>
                <SectionHeader title={t('home.ourServices')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }} style={{ marginHorizontal: -spacing.lg }}>
                  <View style={{ width: spacing.lg - spacing.md }} />
                  {services.data.map((s) => (
                    <Card key={s.id} onPress={() => bookService(s)} style={{ width: 150, alignItems: 'center', gap: 6 }}>
                      <EmojiTile emoji={serviceEmoji(s.category, s.name)} size={52} />
                      <AppText variant="label" style={{ textAlign: 'center' }} numberOfLines={2}>{s.name}</AppText>
                      <AppText variant="caption" color="primaryDark" bold>{formatCurrency(s.price, language)}</AppText>
                    </Card>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <SectionHeader title={t('home.nextAppointment')} actionLabel={t('common.seeAll')} onAction={() => router.push('/appointments')} />
            {upcoming[0] ? (
              <AppointmentCard appointment={upcoming[0]} onPress={() => router.push({ pathname: '/appointment/[id]', params: { id: upcoming[0].id } })} />
            ) : (
              <EmptyState emoji="📅" message={t('home.noUpcoming')} actionLabel={t('home.bookAppointment')} onAction={startBooking} />
            )}

            {doctors.data?.length ? (
              <>
                <SectionHeader title={t('home.ourDoctors')} />
                {doctors.data.map((d) => (
                  <Card key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <Avatar name={d.name.replace(/^Dr\.?\s*/i, '')} size={48} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="subheading">{d.name}</AppText>
                      <AppText variant="caption" color="textMuted" numberOfLines={2}>{d.specialization}</AppText>
                    </View>
                    <AppText variant="label" color="warning">★ {d.rating.toFixed(1)}</AppText>
                  </Card>
                ))}
              </>
            ) : null}

            <SectionHeader title={t('blog.latest')} actionLabel={t('common.seeAll')} onAction={() => router.push('/blog')} />
            {blogs.data?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg }} style={{ marginHorizontal: -spacing.lg }}>
                <View style={{ width: spacing.lg - spacing.md }} />
                {blogs.data.slice(0, 5).map((p) => (
                  <BlogCard key={p.id} post={p} width={270} onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: p.slug } })} />
                ))}
              </ScrollView>
            ) : blogs.isLoading ? (
              <LoadingView />
            ) : blogs.error ? (
              <ErrorState error={blogs.error} onRetry={blogs.refetch} />
            ) : (
              <EmptyState emoji="📰" message={t('blog.empty')} />
            )}
          </>
        )}
      </Screen>
    </View>
  );
}
