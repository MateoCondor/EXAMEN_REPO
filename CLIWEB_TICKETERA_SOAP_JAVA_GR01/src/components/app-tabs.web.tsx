import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import React from 'react';
import { Pressable, useWindowDimensions, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const isCompact = width < 860;

  return (
    <Tabs>
      <TabSlot
        style={[
          styles.tabSlot,
          isCompact ? styles.tabSlotCompact : styles.tabSlotWide,
        ]}
      />
      <TabList asChild>
        <CustomTabList isCompact={isCompact}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Partidos</TabButton>
          </TabTrigger>
          <TabTrigger name="localidades" href="/localidades" asChild>
            <TabButton>Localidades</TabButton>
          </TabTrigger>
          <TabTrigger name="comprar" href="/comprar" asChild>
            <TabButton>Comprar</TabButton>
          </TabTrigger>
          <TabTrigger name="reporte" href="/reporte" asChild>
            <TabButton>Reporte</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'accentSoft' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText
          type="small"
          themeColor={isFocused ? 'accent' : 'textSecondary'}
          style={styles.tabButtonLabel}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps & { isCompact: boolean }) {
  const { isCompact } = props;
  const theme = useTheme();

  return (
    <View
      {...props}
      style={[styles.tabListContainer, isCompact ? styles.tabListCompact : styles.tabListWide]}>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.innerContainer,
          isCompact ? styles.innerCompact : styles.innerWide,
          {
            borderColor: theme.stroke,
            shadowColor: theme.accent,
            shadowOpacity: 0.12,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 4,
          },
        ]}>
        {!isCompact ? (
          <View style={styles.brandBlock}>
            <ThemedText type="smallBold">TicketPremium</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Ventas y reportes
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.tabItems, isCompact && styles.tabItemsCompact]}>
          {props.children}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    padding: Spacing.three,
  },
  tabListWide: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  tabListCompact: {
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
  },
  innerWide: {
    height: '100%',
    width: 240,
    justifyContent: 'space-between',
  },
  innerCompact: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBlock: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonLabel: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tabItems: {
    gap: Spacing.two,
  },
  tabItemsCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  tabSlot: {
    height: '100%',
  },
  tabSlotWide: {
    paddingLeft: 280,
  },
  tabSlotCompact: {
    paddingBottom: 96,
  },
});
