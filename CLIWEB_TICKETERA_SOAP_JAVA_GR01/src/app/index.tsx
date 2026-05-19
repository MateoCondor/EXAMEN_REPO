import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, Tag } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import { getPartidos, Partido } from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';

export default function PartidosScreen() {
  const theme = useTheme();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPartidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPartidos();
      setPartidos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar partidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartidos();
  }, []);

  return (
    <ScreenShell
      title="Partidos disponibles"
      subtitle="Revisa los partidos activos y usa el codigo para consultar localidades, comprar o generar reporte."
      actions={<ActionButton label="Refrescar" onPress={loadPartidos} />}>
      {error ? (
        <Card style={styles.errorCard}>
          <ThemedText type="smallBold">Error</ThemedText>
          <ThemedText type="small">{error}</ThemedText>
        </Card>
      ) : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.text} />
          <ThemedText type="small">Cargando partidos...</ThemedText>
        </View>
      ) : null}

      <View style={styles.grid}>
        {partidos.map((partido, index) => (
          <FadeInView key={partido.codigo} delay={index * 60}>
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="smallBold" style={styles.cardTitle}>
                  {partido.equipoLocal} vs {partido.equipoVisita}
                </ThemedText>
                <Tag label={`#${partido.codigo}`} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {formatDate(partido.fecha)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {partido.lugar}
              </ThemedText>
            </Card>
          </FadeInView>
        ))}
      </View>

      {!loading && partidos.length === 0 && !error ? (
        <Card>
          <ThemedText type="small">No hay partidos disponibles por ahora.</ThemedText>
        </Card>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grid: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.one,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardTitle: {
    flex: 1,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 24, 0.35)',
  },
});
