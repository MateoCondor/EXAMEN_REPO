import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, PillButton, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate, formatMoney } from '@/lib/format';
import { getLocalidades, getPartidos, Localidad, Partido } from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';

export default function LocalidadesScreen() {
  const theme = useTheme();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [codigoPartido, setCodigoPartido] = useState('');
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar partidos');
    } finally {
      setLoadingPartidos(false);
    }
  };

  const loadLocalidades = async (codigo = codigoPartido) => {
    if (!codigo) {
      setError('Ingresa un codigo de partido para consultar localidades');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getLocalidades(codigo);
      setLocalidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar localidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartidos();
  }, []);

  return (
    <ScreenShell
      title="Localidades por partido"
      subtitle="Selecciona un partido para ver disponibilidad y precio por localidad."
      actions={<ActionButton label="Refrescar partidos" onPress={loadPartidos} />}>
      <Card style={styles.formCard}>
        <FieldLabel>Codigo del partido</FieldLabel>
        <TextField
          value={codigoPartido}
          onChangeText={setCodigoPartido}
          placeholder="Ejemplo: P001"
        />
        <View style={styles.formActions}>
          <ActionButton label="Cargar localidades" onPress={() => loadLocalidades()} />
          <ActionButton
            label="Limpiar"
            variant="ghost"
            onPress={() => {
              setCodigoPartido('');
              setLocalidades([]);
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
                  loadLocalidades(partido.codigo);
                }}
              />
            ))}
          </View>
        )}
      </Card>

      {selectedPartido ? (
        <FadeInView>
          <Card>
            <ThemedText type="smallBold">Partido seleccionado</ThemedText>
            <ThemedText type="small">{`${selectedPartido.equipoLocal} vs ${selectedPartido.equipoVisita}`}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatDate(selectedPartido.fecha)} | {selectedPartido.lugar}
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
          <ThemedText type="small">Cargando localidades...</ThemedText>
        </View>
      ) : null}

      <View style={styles.grid}>
        {localidades.map((localidad, index) => (
          <FadeInView key={localidad.codigoLocalidad} delay={index * 60}>
            <Card style={styles.localidadCard}>
              <ThemedText type="smallBold">Localidad {localidad.codigoLocalidad}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Disponibles: {localidad.disponibilidad}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Precio: {formatMoney(localidad.precio)}
              </ThemedText>
            </Card>
          </FadeInView>
        ))}
      </View>
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
  grid: {
    gap: Spacing.two,
  },
  localidadCard: {
    gap: Spacing.one,
  },
});
