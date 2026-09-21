import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Accordion, AppText, Button, Card, HeroCard, Screen, SectionHeader } from '../../components';

const FAQ = ['1', '2', '3', '4', '5', '6'] as const;

export default function HelpScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <HeroCard>
        <AppText style={{ fontSize: 34, lineHeight: 44 }}>🙋</AppText>
        <AppText variant="title" style={{ color: '#FFFFFF' }}>{t('help.title')}</AppText>
        <AppText style={{ color: 'rgba(255,255,255,0.92)' }}>{t('help.subtitle')}</AppText>
      </HeroCard>

      <SectionHeader title={t('help.faqTitle')} />
      {FAQ.map((n, i) => (
        <Accordion key={n} title={t(`help.q${n}`)} initiallyOpen={i === 0}>{t(`help.a${n}`)}</Accordion>
      ))}

      <Card>
        <AppText variant="subheading">{t('help.stillNeedHelp')}</AppText>
        <Button title={t('menu.contactSupport')} icon="headset-outline" onPress={() => router.push('/contact-support')} />
      </Card>
    </Screen>
  );
}
