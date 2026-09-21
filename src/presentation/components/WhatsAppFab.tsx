import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { useAppSelector } from '../state/hooks/useAppSelector';
import { selectCurrentUser } from '../state/selectors/userSelectors';
import { useTheme } from '../theme/useTheme';
import { openWhatsApp } from '../utils/contact';

// Floating WhatsApp button, same green + placement as the website. Pre-fills the user's name.
export function WhatsAppFab({ bottom = 16 }: { bottom?: number }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const user = useAppSelector(selectCurrentUser);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('support.whatsapp')}
      onPress={() => openWhatsApp(user ? `Hello Cadovet! I'm ${user.name}. I would like help with my pet.` : undefined)}
      style={({ pressed }) => [styles.fab, { bottom, backgroundColor: colors.whatsapp, opacity: pressed ? 0.85 : 1 }]}>
      <Ionicons name="logo-whatsapp" size={30} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
