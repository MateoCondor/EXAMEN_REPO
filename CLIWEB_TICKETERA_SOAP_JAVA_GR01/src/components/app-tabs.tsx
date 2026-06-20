import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  if (isAdmin) {
    return (
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        labelStyle={{ selected: { color: colors.text } }}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Partidos</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            symbol="house.fill"
            src={require('@/assets/images/tabIcons/home.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="estadios">
          <NativeTabs.Trigger.Label>Estadios</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            symbol="building.2.fill"
            src={require('@/assets/images/tabIcons/explore.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="clientes">
          <NativeTabs.Trigger.Label>Clientes</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            symbol="person.2.fill"
            src={require('@/assets/images/tabIcons/explore.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="localidades-estadio">
          <NativeTabs.Trigger.Label>Localidades</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            symbol="mappin.and.ellipse"
            src={require('@/assets/images/tabIcons/explore.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="fechas-partidos">
          <NativeTabs.Trigger.Label>Fechas</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            symbol="calendar"
            src={require('@/assets/images/tabIcons/explore.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="reporte">
          <NativeTabs.Trigger.Label>Reporte</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            symbol="chart.bar.fill"
            src={require('@/assets/images/tabIcons/explore.png')}
            renderingMode="template"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Partidos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          symbol="house.fill"
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="localidades">
        <NativeTabs.Trigger.Label>Localidades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          symbol="mappin.and.ellipse"
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="comprar">
        <NativeTabs.Trigger.Label>Comprar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          symbol="cart.fill"
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="mis-compras">
        <NativeTabs.Trigger.Label>Mis Compras</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          symbol="list.clipboard.fill"
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
