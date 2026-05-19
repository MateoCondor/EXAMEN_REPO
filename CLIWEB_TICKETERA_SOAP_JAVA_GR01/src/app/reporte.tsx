import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, PillButton, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate, formatMoney, formatNumber } from '@/lib/format';
import { getPartidos, getReporte, Partido, ReporteItem } from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';

export default function ReporteScreen() {
  const theme = useTheme();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [codigoPartido, setCodigoPartido] = useState('');
  const [reporte, setReporte] = useState<ReporteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPartido = useMemo(
    () => partidos.find((partido) => partido.codigo === codigoPartido),
    [codigoPartido, partidos]
  );

  const loadPartidos = async () => {
    setLoadingPartidos(true);
    try {
      const data = await getPartidos();
      setPartidos(data);
    } catch {
      setError('No se pudo cargar partidos');
    } finally {
      setLoadingPartidos(false);
    }
  };

  const loadReporte = async (codigo = codigoPartido) => {
    if (!codigo) {
      setError('Ingresa un codigo de partido para generar el reporte');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getReporte(codigo);
      setReporte(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const totalRecaudado = useMemo(
    () => reporte.reduce((acc, item) => acc + item.totalRecaudado, 0),
    [reporte]
  );

  useEffect(() => {
    loadPartidos();
  }, []);

  return (
    <ScreenShell
      title="Resumen de ventas"
      subtitle="Genera un reporte por partido con ventas y recaudacion total."
      actions={<ActionButton label="Refrescar partidos" onPress={loadPartidos} />}>
      <Card style={styles.formCard}>
        <FieldLabel>Codigo del partido</FieldLabel>
        <TextField
          value={codigoPartido}
          onChangeText={setCodigoPartido}
          placeholder="Ejemplo: P001"
        />
        <View style={styles.formActions}>
          <ActionButton label="Generar reporte" onPress={() => loadReporte()} />
          <ActionButton
            label="Limpiar"
            variant="ghost"
            onPress={() => {
              setCodigoPartido('');
              setReporte([]);
              setError(null);
            }}
          />
        </View>
      </Card>

      <Card>
        <FieldLabel>Partidos disponibles</FieldLabel>
        {loadingPartidos ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small">Cargando partidos...</ThemedText>
          </View>
        ) : (
          <View style={styles.pillWrap}>
            {partidos.map((partido) => (
              <PillButton
                key={partido.codigo}
                label={`${partido.equipoLocal} vs ${partido.equipoVisita}`}
                selected={partido.codigo === codigoPartido}
                onPress={() => {
                  setCodigoPartido(partido.codigo);
                  loadReporte(partido.codigo);
                }}
              />
            ))}
          </View>
        )}
      </Card>

      {selectedPartido ? (
        <FadeInView>
          <Card>
            <ThemedText type="smallBold">Partido</ThemedText>
            <ThemedText type="small">{`${selectedPartido.equipoLocal} vs ${selectedPartido.equipoVisita}`}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Fecha: {formatDate(selectedPartido.fecha)}
            </ThemedText>
          </Card>
        </FadeInView>
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <ThemedText type="smallBold">Error</ThemedText>
          <ThemedText type="small">{error}</ThemedText>
        </Card>
      ) : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.text} />
          <ThemedText type="small">Generando reporte...</ThemedText>
        </View>
      ) : null}

      {reporte.length > 0 ? (
        <FadeInView>
          <Card>
            <FieldLabel>Resumen de ventas</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <ThemedText type="smallBold" style={styles.tableCell}>
                    Localidad
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.tableCell}>
                    Vendidos
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.tableCell}>
                    Total recaudado
                  </ThemedText>
                </View>
                {reporte.map((item) => (
                  <View key={item.codigoLocalidad} style={styles.tableRow}>
                    <ThemedText type="small" style={styles.tableCell}>
                      {item.codigoLocalidad}
                    </ThemedText>
                    <ThemedText type="small" style={styles.tableCell}>
                      {formatNumber(item.cantidadVendida)}
                    </ThemedText>
                    <ThemedText type="small" style={styles.tableCell}>
                      {formatMoney(item.totalRecaudado)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.totalRow}>
              <ThemedText type="smallBold">Total recaudado:</ThemedText>
              <ThemedText type="smallBold">{formatMoney(totalRecaudado)}</ThemedText>
            </View>
          </Card>
        </FadeInView>
      ) : null}

      {reporte.length === 0 && !loading && codigoPartido ? (
        <Card>
          <ThemedText type="small">No hay ventas registradas para este partido.</ThemedText>
        </Card>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: Spacing.two,
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 24, 0.35)',
  },
  tableScroll: {
    paddingVertical: Spacing.two,
  },
  table: {
    minWidth: 520,
    gap: Spacing.one,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  tableHeader: {
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
  },
  totalRow: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
