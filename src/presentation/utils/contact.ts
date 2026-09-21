import { Alert, Linking } from 'react-native';

import { DEFAULT_WHATSAPP_MESSAGE, HELPLINE_TEL, SUPPORT_EMAIL, WHATSAPP_NUMBER } from '@/core/config/contact';
import i18n from '../i18n';

const open = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(i18n.t('support.openFailed'));
  }
};

// wa.me is a universal link: it opens the WhatsApp app when installed and WhatsApp Web otherwise.
export const openWhatsApp = (message: string = DEFAULT_WHATSAPP_MESSAGE) =>
  open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);

export const callHelpline = () => open(HELPLINE_TEL);

export const emailSupport = (subject = 'Cadovet app support', body = '') =>
  open(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`);
