import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HELPLINE_DISPLAY, SUPPORT_EMAIL } from '@/core/config/contact';
import { validateMessage } from '@/domain/usecases/validation';
import { AppText, Button, Card, Chip, HeroCard, Screen, SectionHeader, TextField } from '../../components';
import { useForm } from '../../hooks/useForm';
import { useAppSelector } from '../../state/hooks/useAppSelector';
import { selectCurrentUser } from '../../state/selectors/userSelectors';
import { useTheme } from '../../theme/useTheme';
import { callHelpline, emailSupport, openWhatsApp } from '../../utils/contact';

type Topic = 'general' | 'appointment' | 'billing' | 'feedback';
const TOPICS: Topic[] = ['general', 'appointment', 'billing', 'feedback'];
const MESSAGE_MAX = 500;
const validators = { message: validateMessage(10, MESSAGE_MAX) };

function Channel({ icon, color, title, desc, onPress }: { icon: keyof typeof Ionicons.glyphMap; color: string; title: string; desc: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="subheading">{title}</AppText>
        <AppText variant="caption" color="textMuted">{desc}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Card>
  );
}

export default function ContactSupportScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const [topic, setTopic] = useState<Topic>('general');
  const form = useForm({ message: '' }, validators);

  // Support messages are written for the Cado Vet team, so the topic and identity are always in English.
  const compose = (message: string) => {
    const topicLabel = t(`contact.topics.${topic}`, { lng: 'en' });
    const who = user ? `${user.name} (${user.email ?? user.mobile})` : 'Cado Vet app user';
    return `[${topicLabel}] ${message.trim()}\n\n— ${who}`;
  };
  const sendWhatsApp = form.handleSubmit(({ message }) => openWhatsApp(compose(message)));
  const sendEmail = form.handleSubmit(({ message }) => emailSupport(`Cadovet app – ${t(`contact.topics.${topic}`, { lng: 'en' })}`, compose(message)));

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <HeroCard>
        <AppText style={{ fontSize: 34, lineHeight: 44 }}>🎧</AppText>
        <AppText variant="title" style={{ color: '#FFFFFF' }}>{t('contact.title')}</AppText>
        <AppText style={{ color: 'rgba(255,255,255,0.92)' }}>{t('contact.subtitle')}</AppText>
      </HeroCard>

      <Channel icon="logo-whatsapp" color={colors.whatsapp} title={t('support.whatsapp')} desc={t('contact.whatsappDesc')} onPress={() => openWhatsApp()} />
      <Channel icon="call" color={colors.primary} title={HELPLINE_DISPLAY} desc={t('contact.callDesc')} onPress={callHelpline} />
      <Channel icon="mail" color={colors.secondary} title={SUPPORT_EMAIL} desc={t('contact.emailDesc')} onPress={() => emailSupport()} />

      <SectionHeader title={t('contact.formTitle')} />
      <Card style={{ gap: 14 }}>
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textSecondary">{t('contact.topic')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TOPICS.map((k) => <Chip key={k} label={t(`contact.topics.${k}`)} selected={k === topic} onPress={() => setTopic(k)} />)}
          </View>
        </View>
        <TextField {...form.fieldProps('message')} label={t('contact.message')} placeholder={t('contact.messagePlaceholder')} multiline maxLength={MESSAGE_MAX} showCounter />
        <Button title={t('contact.sendWhatsapp')} icon="logo-whatsapp" variant="whatsapp" onPress={sendWhatsApp} />
        <Button title={t('contact.sendEmail')} icon="mail-outline" variant="outline" onPress={sendEmail} />
      </Card>
    </Screen>
  );
}
