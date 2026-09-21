import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { HELPLINE_DISPLAY, SUPPORT_EMAIL } from '@/core/config/contact';
import { useGetMeQuery } from '@/data/api/userApi';
import { AppText, AsyncBoundary, Avatar, Button, Card, Chip, EmojiTile, HeroCard, MenuButton, Screen, SectionHeader } from '../../components';
import { useAppDispatch } from '../../state/hooks/useAppDispatch';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectAvailableLanguages, selectLanguage } from '../../state/selectors/languageSelectors';
import { selectThemeMode } from '../../state/selectors/themeSelectors';
import { languageChanged } from '../../state/slices/languageSlice';
import { themeModeChanged, type ThemeMode } from '../../state/slices/themeSlice';
import { signOut } from '../../state/thunks/sessionThunks';
import { callHelpline, emailSupport, openWhatsApp } from '../../utils/contact';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const query = useGetMeQuery();
  const language = useAppSelector(selectLanguage);
  const languages = useAppSelector(selectAvailableLanguages);
  const mode = useAppSelector(selectThemeMode);

  const confirmSignOut = () =>
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => dispatch(signOut()) },
    ]);

  return (
    <Screen refreshing={query.isFetching && !query.isLoading} onRefresh={query.refetch} contentStyle={{ paddingBottom: 96 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MenuButton />
        <AppText variant="title" style={{ flex: 1 }}>{t('profile.title')}</AppText>
      </View>

      <AsyncBoundary {...query}>
        {({ profile }) => {
          const address = [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ');
          return (
            <HeroCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Avatar name={profile.name} size={64} />
                <View style={{ flex: 1 }}>
                  <AppText variant="heading" style={{ color: '#FFFFFF' }} numberOfLines={2}>{profile.name}</AppText>
                  {profile.email ? <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>{profile.email}</AppText> : null}
                  {profile.mobile ? <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>{profile.mobile}</AppText> : null}
                </View>
              </View>
              {address ? <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>📍 {address}</AppText> : null}
              <Button title={t('profile.editTitle')} icon="create-outline" variant="glass" compact onPress={() => router.push('/profile-edit')} style={{ alignSelf: 'flex-start' }} />
            </HeroCard>
          );
        }}
      </AsyncBoundary>

      <Card onPress={() => router.push('/invoices')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <EmojiTile emoji="🧾" />
        <AppText variant="subheading" style={{ flex: 1 }}>{t('profile.invoices')}</AppText>
        <Ionicons name="chevron-forward" size={20} color="#718096" />
      </Card>

      <SectionHeader title={t('support.title')} />
      <Card>
        <AppText variant="caption" color="textMuted">{t('support.subtitle')}</AppText>
        <Button title={t('support.whatsapp')} icon="logo-whatsapp" variant="whatsapp" onPress={() => openWhatsApp()} />
        <Button title={`${t('support.call')} · ${HELPLINE_DISPLAY}`} icon="call" variant="outline" onPress={callHelpline} />
        <Button title={`${t('support.email')} · ${SUPPORT_EMAIL}`} icon="mail-outline" variant="ghost" onPress={() => emailSupport()} />
      </Card>

      <SectionHeader title={t('profile.preferences')} />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="contrast-outline" size={18} color="#1BAFBF" />
          <AppText variant="subheading">{t('profile.appearance')}</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {THEME_MODES.map((m) => (
            <Chip key={m} label={t(`profile.theme.${m}`)} selected={m === mode} onPress={() => dispatch(themeModeChanged(m))} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Ionicons name="language-outline" size={18} color="#1BAFBF" />
          <AppText variant="subheading">{t('profile.language')}</AppText>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {languages.map((l) => (
            <Chip key={l.code} label={l.label} selected={l.code === language} onPress={() => dispatch(languageChanged(l.code))} />
          ))}
        </View>
      </Card>

      <Button title={t('profile.logout')} icon="log-out-outline" variant="danger" onPress={confirmSignOut} />
    </Screen>
  );
}
