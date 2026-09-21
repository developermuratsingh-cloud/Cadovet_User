import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

interface Props {
  size?: number;
  showWordmark?: boolean;
  tagline?: string;
  light?: boolean; // white wordmark for use on the gradient
}

// Badge + "CADO" (teal) "VET" (lime) wordmark, as on the website header.
export function Logo({ size = 44, showWordmark = true, tagline, light }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="Cadovet">
      <Image source={require('../../../assets/images/logo.png')} style={{ width: size, height: size }} contentFit="contain" />
      {showWordmark ? (
        <View>
          <AppText style={{ fontFamily: fonts.extrabold, fontSize: size * 0.5, lineHeight: size * 0.6, letterSpacing: 0.5 }}>
            <AppText style={{ color: light ? '#FFFFFF' : colors.primary, fontFamily: fonts.extrabold, fontSize: size * 0.5, lineHeight: size * 0.6 }}>CADO</AppText>
            <AppText style={{ color: colors.lime, fontFamily: fonts.extrabold, fontSize: size * 0.5, lineHeight: size * 0.6 }}>VET</AppText>
          </AppText>
          {tagline ? <AppText variant="caption" style={{ color: light ? 'rgba(255,255,255,0.85)' : colors.textMuted, letterSpacing: 1.2, fontSize: 9.5, lineHeight: 13, fontFamily: fonts.semibold }}>{tagline.toUpperCase()}</AppText> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 10 } });
