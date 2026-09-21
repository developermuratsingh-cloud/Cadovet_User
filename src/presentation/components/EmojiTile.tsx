import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export function EmojiTile({ emoji, size = 48 }: { emoji: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: colors.primaryLight }]}>
      <AppText style={{ fontSize: size * 0.5, lineHeight: size * 0.65 }}>{emoji}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({ tile: { alignItems: 'center', justifyContent: 'center' } });
