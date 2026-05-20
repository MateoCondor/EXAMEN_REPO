import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const scale = Platform.OS === 'web' ? 1.16 : 1;
const font = (value: number) => Math.round(value * scale);
const line = (value: number) => Math.round(value * scale);

const styles = StyleSheet.create({
  small: {
    fontSize: font(14),
    lineHeight: line(20),
    fontWeight: 500,
    fontFamily: Fonts.sans,
  },
  smallBold: {
    fontSize: font(14),
    lineHeight: line(20),
    fontWeight: 700,
    fontFamily: Fonts.sans,
  },
  default: {
    fontSize: font(16),
    lineHeight: line(24),
    fontWeight: 500,
    fontFamily: Fonts.sans,
  },
  title: {
    fontSize: font(48),
    fontWeight: 700,
    lineHeight: line(52),
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: font(32),
    lineHeight: line(44),
    fontWeight: 600,
    fontFamily: Fonts.sans,
  },
  link: {
    lineHeight: line(30),
    fontSize: font(14),
    fontFamily: Fonts.sans,
  },
  linkPrimary: {
    lineHeight: line(30),
    fontSize: font(14),
    color: '#1E88E5',
    fontFamily: Fonts.sans,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: font(12),
  },
});
