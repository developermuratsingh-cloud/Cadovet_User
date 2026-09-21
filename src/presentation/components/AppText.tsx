import { StyleSheet, Text, type TextProps } from 'react-native';

import { fonts } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type Variant = 'display' | 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  color?: 'text' | 'textSecondary' | 'textMuted' | 'primary' | 'primaryDark' | 'secondary' | 'danger' | 'success' | 'warning' | 'onPrimary' | 'lime';
  bold?: boolean;
}

export function AppText({ variant = 'body', color = 'text', bold, style, ...rest }: Props) {
  const { colors } = useTheme();
  return <Text {...rest} style={[styles[variant], { color: colors[color] }, bold && styles.bold, style]} />;
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 40 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34 },
  heading: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23 },
  body: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 18 },
  bold: { fontFamily: fonts.bold },
});
