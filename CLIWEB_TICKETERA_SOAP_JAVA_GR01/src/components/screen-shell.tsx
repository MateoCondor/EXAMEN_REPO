import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/fade-in';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/ticketera-ui';
import { useAuth } from '@/hooks/use-auth';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function ScreenShell({ title, subtitle, actions, children }: ScreenShellProps) {
  const { width } = useWindowDimensions();
  const { logout } = useAuth();
  const isCompact = width < 820;

  return (
    <ThemedView style={styles.page}>
      <View pointerEvents="none" style={[styles.orb, styles.orbOne]} />
      <View pointerEvents="none" style={[styles.orb, styles.orbTwo]} />
      <View pointerEvents="none" style={[styles.track, styles.trackOne]} />
      <View pointerEvents="none" style={[styles.track, styles.trackTwo]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: BottomTabInset + Spacing.six,
          },
        ]}>
        <SafeAreaView style={styles.safeArea}>
          <FadeInView>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <ThemedText type="title" style={[styles.title, isCompact && styles.titleCompact, { flex: 1 }]}>
                  {title}
                </ThemedText>
                <ActionButton label="Cerrar sesión" variant="ghost" onPress={logout} />
              </View>
              {subtitle ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              ) : null}
              {actions ? <View style={styles.actions}>{actions}</View> : null}
            </View>
          </FadeInView>

          <View style={styles.content}>{children}</View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth + 120,
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 40,
  },
  subtitle: {
    maxWidth: 620,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  content: {
    gap: Spacing.three,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.7,
  },
  orbOne: {
    width: 420,
    height: 420,
    backgroundColor: 'rgba(30, 136, 229, 0.22)',
    top: -120,
    left: -140,
  },
  orbTwo: {
    width: 360,
    height: 360,
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    bottom: -140,
    right: -120,
  },
  track: {
    position: 'absolute',
    height: 2,
    width: '140%',
    opacity: 0.3,
  },
  trackOne: {
    backgroundColor: 'rgba(30, 136, 229, 0.35)',
    top: 120,
    left: -80,
    transform: [{ rotate: '-2deg' }],
  },
  trackTwo: {
    backgroundColor: 'rgba(79, 195, 247, 0.4)',
    top: 190,
    left: -60,
    transform: [{ rotate: '1deg' }],
  },
});
