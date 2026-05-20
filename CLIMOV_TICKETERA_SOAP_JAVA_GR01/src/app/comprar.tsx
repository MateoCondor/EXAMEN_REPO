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
  LineaCompra,
} from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';

interface LocalidadConCantidad extends Localidad {
  cantidadSeleccionada?: number;
}

export default function ComprarScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [localidades, setLocalidades] = useState<LocalidadConCantidad[]>([]);
  const [codigoPartido, setCodigoPartido] = useState('');
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compra, setCompra] = useState<CompraResponse | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const selectedPartido = useMemo(
    () => partidos.find((partido) => partido.codigo === codigoPartido),
    [codigoPartido, partidos]
  );

  const filteredPartidos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (codigoPartido) {
         return partidos.filter((p) => p.codigo === codigoPartido);
      }
      return []; 
    }
    return partidos.filter(
      (p) =>
        p.equipoLocal.toLowerCase().includes(q) ||
        p.equipoVisita.toLowerCase().includes(q) ||
        formatDate(p.fecha).toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q)
    );
  }, [partidos, searchQuery, codigoPartido]);

  const localidadesSeleccionadas = useMemo(
    () => localidades.filter((loc) => (loc.cantidadSeleccionada ?? 0) > 0),
    [localidades]
  );

  const totalCompra = useMemo(() => {
    const subtotal = localidadesSeleccionadas.reduce(
      (sum, loc) => sum + (loc.precio * (loc.cantidadSeleccionada ?? 0)),
      0
    );
    const iva = subtotal * 0.15;
    return { subtotal, iva, total: subtotal + iva };
  }, [localidadesSeleccionadas]);

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
      setLocalidades(data.map((loc) => ({ ...loc, cantidadSeleccionada: 0 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar localidades');
    } finally {
      setLoadingLocalidades(false);
    }
  };

  const handleCantidadChange = (codigoLocalidad: string, cantidad: string) => {
    const num = Number(cantidad);
    setLocalidades((prev) =>
      prev.map((loc) =>
        loc.codigoLocalidad === codigoLocalidad
          ? { ...loc, cantidadSeleccionada: isNaN(num) ? 0 : Math.max(0, num) }
          : loc
      )
    );
  };

  const handleCompra = async () => {
    if (!codigoPartido) {
      setError('Selecciona un partido');
      return;
    }
    if (!cedula || cedula.trim().length === 0) {
      setError('La cédula es requerida');
      return;
    }
    if (localidadesSeleccionadas.length === 0) {
      setError('Selecciona al menos una localidad');
      return;
    }

    const lineas: LineaCompra[] = localidadesSeleccionadas.map((loc) => ({
      codigoLocalidad: loc.codigoLocalidad,
      cantidad: loc.cantidadSeleccionada ?? 0,
    }));

    setLoading(true);
    setError(null);
    setCompra(null);
    try {
      const response = await comprarBoletos({
        codigoPartido,
        cedula: cedula.trim(),
        lineas,
      });
      setCompra(response);
      // Limpiar selección después de compra exitosa
      setCedula('');
      setLocalidades((prev) => prev.map((loc) => ({ ...loc, cantidadSeleccionada: 0 })));
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
      subtitle="Selecciona múltiples localidades y cantidades para una compra."
      actions={<ActionButton label="Refrescar partidos" onPress={loadPartidos} />}>
      <Card style={styles.formCard}>
        <FieldLabel>Partido</FieldLabel>
        {loadingPartidos ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small">Cargando partidos...</ThemedText>
          </View>
        ) : (
          <View style={styles.selectListContainer}>
            <TextField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por equipo, fecha o código..."
            />
            <View style={styles.selectList}>
              {filteredPartidos.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {partidos.length === 0 
                    ? 'No hay partidos disponibles' 
                    : searchQuery.trim() === '' 
                      ? 'Escribe para buscar un partido...' 
                      : 'No hay coincidencias'}
                </ThemedText>
              ) : (
                filteredPartidos.map((partido) => {
                  const selected = partido.codigo === codigoPartido;
                return (
                  <Pressable
                    key={partido.codigo}
                    onPress={() => {
                      setCodigoPartido(partido.codigo);
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
          </View>
        )}

        <FieldLabel>Localidades (selecciona y especifica cantidad)</FieldLabel>
        {loadingLocalidades ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.text} />
            <ThemedText type="small">Cargando localidades...</ThemedText>
          </View>
        ) : (
          <View style={styles.localidadesContainer}>
            {localidades.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Selecciona un partido para ver localidades
              </ThemedText>
            ) : (
              localidades.map((localidad) => {
                const precioBase = localidad.precio;
                const iva = precioBase * 0.15;
                const total = precioBase + iva;
                
                return (
                  <View
                    key={localidad.codigoLocalidad}
                    style={[
                      styles.localidadRow,
                      {
                        backgroundColor:
                          (localidad.cantidadSeleccionada ?? 0) > 0
                            ? theme.accentSoft
                            : theme.background,
                        borderColor: theme.stroke,
                      },
                    ]}>
                    <View style={styles.localidadInfo}>
                      <ThemedText
                        type="smallBold"
                        style={{
                          color:
                            (localidad.cantidadSeleccionada ?? 0) > 0
                              ? theme.accent
                              : theme.text,
                        }}>
                        {localidad.codigoLocalidad}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Disponibles: {localidad.disponibilidad}
                      </ThemedText>
                      <View style={styles.priceBreakdown}>
                        <ThemedText type="small" themeColor="textSecondary">Base: {formatMoney(precioBase)}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">IVA: {formatMoney(iva)}</ThemedText>
                        <ThemedText type="smallBold">Total: {formatMoney(total)} c/u</ThemedText>
                      </View>
                    </View>
                    <View style={styles.cantidadInput}>
                      <TextField
                        value={String(localidad.cantidadSeleccionada ?? 0)}
                        onChangeText={(value) =>
                          handleCantidadChange(localidad.codigoLocalidad, value)
                        }
                        placeholder="0"
                        keyboardType="numeric"
                      />
                    </View>
                    {(localidad.cantidadSeleccionada ?? 0) > 0 ? (
                      <View style={styles.subtotalCol}>
                        <ThemedText type="smallBold" style={{ color: theme.accent }}>
                          {formatMoney(
                            total * (localidad.cantidadSeleccionada ?? 0)
                          )}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}

        <FieldLabel>Cédula / DNI</FieldLabel>
        <TextField
          value={cedula}
          onChangeText={setCedula}
          placeholder="Ej: 1234567890"
          keyboardType="default"
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

      {localidadesSeleccionadas.length > 0 ? (
        <FadeInView>
          <Card style={styles.resumenCard}>
            <ThemedText type="smallBold">Resumen de compra</ThemedText>
            {localidadesSeleccionadas.map((loc) => (
              <View key={loc.codigoLocalidad} style={styles.lineaResumen}>
                <ThemedText type="small">
                  {loc.codigoLocalidad}: {loc.cantidadSeleccionada} x{' '}
                  {formatMoney(loc.precio)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatMoney(loc.precio * (loc.cantidadSeleccionada ?? 0))}
                </ThemedText>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.lineaResumen}>
              <ThemedText type="small">Subtotal:</ThemedText>
              <ThemedText type="small">{formatMoney(totalCompra.subtotal)}</ThemedText>
            </View>
            <View style={styles.lineaResumen}>
              <ThemedText type="small">IVA (15%):</ThemedText>
              <ThemedText type="small">{formatMoney(totalCompra.iva)}</ThemedText>
            </View>
            <View style={styles.lineaResumen}>
              <ThemedText type="smallBold">Total:</ThemedText>
              <ThemedText type="smallBold">{formatMoney(totalCompra.total)}</ThemedText>
            </View>
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
            <ThemedText type="smallBold">✓ Compra registrada exitosamente</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Factura: #{compra.idFactura}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Cédula: {compra.cedula}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Fecha: {formatDate(compra.fecha)}
            </ThemedText>
            <View style={styles.divider} />
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
  selectListContainer: {
    gap: Spacing.two,
  },
  selectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
  localidadesContainer: {
    gap: Spacing.one,
  },
  localidadRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  localidadInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  cantidadInput: {
    width: 70,
  },
  subtotalCol: {
    width: 80,
    alignItems: 'flex-end',
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
  resumenCard: {
    gap: Spacing.one,
  },
  lineaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginVertical: Spacing.one,
  },
  priceBreakdown: {
    marginTop: Spacing.half,
    gap: 2,
  },
});
