import React from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  disabled?: boolean;
};

export function ActionButton({ label, onPress, variant = 'primary', disabled }: ActionButtonProps) {
  const theme = useTheme();
  const backgroundColor =
    variant === 'primary' ? theme.accent : variant === 'outline' ? theme.background : theme.backgroundElement;
  const borderColor = variant === 'outline' ? theme.stroke : 'transparent';
  const textColor = variant === 'primary' ? theme.background : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          opacity: pressed ? 0.85 : 1,
          shadowColor: theme.accent,
          shadowOpacity: variant === 'primary' ? 0.25 : 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: variant === 'primary' ? 4 : 1,
        },
        disabled && styles.buttonDisabled,
      ]}>
      <ThemedText type="smallBold" style={[styles.buttonLabel, { color: textColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        {
          borderColor: theme.stroke,
          shadowColor: theme.accent,
        },
        style,
      ]}
      {...rest}>
      {children}
    </ThemedView>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <ThemedText type="smallBold" style={styles.label}>
      {children}
    </ThemedText>
  );
}

export function TextField(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        styles.input,
        {
          color: theme.text,
          borderColor: theme.stroke,
          backgroundColor: theme.background,
        },
        props.style,
      ]}
    />
  );
}

type PillButtonProps = {
  label: string;
  onPress?: () => void;
  selected?: boolean;
};

export function PillButton({ label, onPress, selected }: PillButtonProps) {
  const theme = useTheme();
  const backgroundColor = selected ? theme.accentSoft : theme.background;
  const borderColor = selected ? theme.accent : theme.stroke;
  const textColor = selected ? theme.accent : theme.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor,
          borderColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <ThemedText type="small" style={[styles.pillLabel, { color: textColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type TagProps = {
  label: string;
};

export function Tag({ label }: TagProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.tag,
        {
          borderColor: theme.stroke,
          backgroundColor: theme.background,
        },
      ]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.tagLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  buttonLabel: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  label: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pillLabel: {
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tag: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  tagLabel: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
