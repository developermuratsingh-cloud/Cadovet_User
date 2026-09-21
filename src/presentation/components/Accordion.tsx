import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Card } from './Card';

export function Accordion({ title, children, initiallyOpen = false }: { title: string; children: string; initiallyOpen?: boolean }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <Card style={{ padding: 0, gap: 0 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
        <AppText variant="subheading" style={{ flex: 1 }}>{title}</AppText>
        <Ionicons name={open ? 'remove-circle-outline' : 'add-circle-outline'} size={22} color={colors.primary} />
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <AppText color="textSecondary">{children}</AppText>
        </View>
      ) : null}
    </Card>
  );
}
