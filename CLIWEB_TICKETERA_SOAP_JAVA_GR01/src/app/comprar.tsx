import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate, formatMoney } from '@/lib/format';
import {
  comprarBoletos,
  getLocalidades,
  getPartidos,
  CompraResponse,
  Localidad,
  Partido,
} from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';

export default function ComprarScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [codigoPartido, setCodigoPartido] = useState('');
  const [codigoLocalidad, setCodigoLocalidad] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [loading, setLoading] = useState(false);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compra, setCompra] = useState<CompraResponse | null>(null);

  const selectedPartido = useMemo(
    () => partidos.find((partido) => partido.codigo === codigoPartido),
    [codigoPartido, partidos]
  );

  const selectedLocalidad = useMemo(
    () => localidades.find((localidad) => localidad.codigoLocalidad === codigoLocalidad),
    [codigoLocalidad, localidades]
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

  const loadLocalidades = async (codigo = codigoPartido) => {
    if (!codigo) {
      setError('Ingresa un codigo de partido para cargar localidades');
      return;
    }
    setLoadingLocalidades(true);
    setError(null);
    try {
      const data = await getLocalidades(codigo);
      setLocalidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar localidades');
    } finally {
      setLoadingLocalidades(false);
    }
  };

  const handleCompra = async () => {
    if (!codigoPartido || !codigoLocalidad) {
      setError('Completa partido y localidad');
      return;
    }
    const cantidadNumero = Number(cantidad);
    if (!Number.isFinite(cantidadNumero) || cantidadNumero <= 0) {
      setError('Cantidad debe ser mayor a cero');
      return;
    }

    setLoading(true);
    setError(null);
    setCompra(null);
    try {
      const response = await comprarBoletos({
        codigoPartido,
        codigoLocalidad,
        cantidad: cantidadNumero,
      });
      setCompra(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la compra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartidos();
  }, []);

  return (
    <ScreenShell
      title="Comprar boletos"
      subtitle="Ingresa los datos del partido y localidad para registrar la venta."
      actions={<ActionButton label="Refrescar partidos" onPress={loadPartidos} />}>
      <Card style={styles.formCard}>
        <FieldLabel>Partido</FieldLabel>
        {loadingPartidos ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small">Cargando partidos...</ThemedText>
          </View>
        ) : (
          <View style={styles.selectList}>
            {partidos.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No hay partidos disponibles
              </ThemedText>
            ) : (
              partidos.map((partido) => {
                const selected = partido.codigo === codigoPartido;
                return (
                  <Pressable
                    key={partido.codigo}
                    onPress={() => {
                      setCodigoPartido(partido.codigo);
                      setCodigoLocalidad('');
                      setLocalidades([]);
                      loadLocalidades(partido.codigo);
                    }}>
                    <View
                      style={[
                        styles.selectOption,
                        isWide ? styles.gridItem : styles.gridItemFull,
                        {
                          borderColor: theme.stroke,
                          backgroundColor: selected ? theme.accentSoft : theme.background,
                        },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={[styles.optionTitle, selected && { color: theme.accent }]}
                      >
                        {partido.equipoLocal} vs {partido.equipoVisita}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {partido.codigo} | {formatDate(partido.fecha)}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}

        <FieldLabel>Localidad</FieldLabel>
        {loadingLocalidades ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small">Cargando localidades...</ThemedText>
          </View>
        ) : (
          <View style={styles.selectList}>
            {localidades.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Selecciona un partido para ver localidades
              </ThemedText>
            ) : (
              localidades.map((localidad) => {
                const selected = localidad.codigoLocalidad === codigoLocalidad;
                return (
                  <Pressable
                    key={localidad.codigoLocalidad}
                    onPress={() => setCodigoLocalidad(localidad.codigoLocalidad)}>
                    <View
                      style={[
                        styles.selectOption,
                        isWide ? styles.gridItem : styles.gridItemFull,
                        {
                          borderColor: theme.stroke,
                          backgroundColor: selected ? theme.accentSoft : theme.background,
                        },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={[styles.optionTitle, selected && { color: theme.accent }]}
                      >
                        {localidad.codigoLocalidad}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {formatMoney(localidad.precio)} | {localidad.disponibilidad} disponibles
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}

        <FieldLabel>Cantidad</FieldLabel>
        <TextField
          value={cantidad}
          onChangeText={setCantidad}
          placeholder="1"
          keyboardType="numeric"
        />

        <View style={styles.formActions}>
          <ActionButton label="Comprar" onPress={handleCompra} />
          <ActionButton
            label="Recargar localidades"
            variant="ghost"
            onPress={() => loadLocalidades()}
            disabled={!codigoPartido}
          />
        </View>
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


      {selectedLocalidad ? (
        <FadeInView>
          <Card>
            <ThemedText type="smallBold">Localidad seleccionada</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Precio unitario: {formatMoney(selectedLocalidad.precio)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Disponibles: {selectedLocalidad.disponibilidad}
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
          <ThemedText type="small">Procesando compra...</ThemedText>
        </View>
      ) : null}

      {compra ? (
        <FadeInView>
          <Card style={styles.compraCard}>
            <ThemedText type="smallBold">Compra registrada</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Factura: #{compra.idFactura}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Fecha: {formatDate(compra.fecha)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Subtotal: {formatMoney(compra.subtotal)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              IVA: {formatMoney(compra.iva)}
            </ThemedText>
            <ThemedText type="smallBold">Total: {formatMoney(compra.total)}</ThemedText>
          </Card>
        </FadeInView>
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
  selectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.half,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  selectOption: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    minHeight: 86,
  },
  gridItem: {
    flexBasis: '49%',
    flexGrow: 1,
  },
  gridItemFull: {
    flexBasis: '100%',
  },
  optionTitle: {
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  compraCard: {
    gap: Spacing.one,
  },
});
