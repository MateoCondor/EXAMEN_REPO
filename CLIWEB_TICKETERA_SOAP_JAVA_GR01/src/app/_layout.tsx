import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import LoginScreen from './login';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = Colors[scheme];
  const navigationTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.backgroundElement,
      text: palette.text,
      border: palette.stroke,
    },
  };

  const basePaperTheme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const paperTheme = {
    ...basePaperTheme,
    colors: {
      ...basePaperTheme.colors,
      primary: palette.accent,
      primaryContainer: palette.accentSoft,
      secondary: palette.accent,
      secondaryContainer: palette.accentSoft,
      background: palette.background,
      surface: palette.backgroundElement,
      surfaceVariant: palette.backgroundSelected,
      onSurface: palette.text,
      onSurfaceVariant: palette.textSecondary,
      onBackground: palette.text,
      outline: palette.stroke,
    },
  };

  const { isAuthenticated } = useAuth();

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <AnimatedSplashOverlay />
        {isAuthenticated ? <AppTabs /> : <LoginScreen />}
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function TabLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
