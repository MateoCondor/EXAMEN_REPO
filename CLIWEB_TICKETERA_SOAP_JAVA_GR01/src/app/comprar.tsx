import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View, useWindowDimensions, ScrollView } from 'react-native';

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
  simularAmortizacion,
  CompraResponse,
  Partido,
  LineaCompra,
  AmortizacionRow,
  AsientoCompra,
} from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { SeatMap } from '@/components/ticketera-ui/seat-map';
import { StadiumMap } from '@/components/ticketera-ui/stadium-map';

// Definición para elementos en el carrito
interface CartItem {
  codigoPartido: string;
  partidoInfo: string;
  codigoLocalidad: string;
  asientos: AsientoCompra[];
  precioUnitario: number;
}

export default function ComprarScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const isCliente = user?.rol === 'cliente';
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  
  // Estado global
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loadingPartidos, setLoadingPartidos] = useState(false);
  const [cedula, setCedula] = useState('');
  
  // Estado de selección actual
  const [codigoPartido, setCodigoPartido] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Localidades del partido seleccionado
  const [localidadesSeleccion, setLocalidadesSeleccion] = useState<{
    codigoLocalidad: string;
    capacidad: number;
    disponibilidad: number;
    precio: number;
    // Asientos temporales en UI antes de confirmar carrito
    asientos: AsientoCompra[];
  }[]>([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  // Estado del SeatMap
  const [seatMapLoc, setSeatMapLoc] = useState<typeof localidadesSeleccion[0] | null>(null);
  const [seatMapInitialSection, setSeatMapInitialSection] = useState(0);

  // Estado del Carrito
  const [carrito, setCarrito] = useState<CartItem[]>([]);

  // Estado del Checkout
  const [formaPago, setFormaPago] = useState<'EFECTIVO' | 'CREDITO'>('EFECTIVO');
  const [plazo, setPlazo] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compra, setCompra] = useState<CompraResponse | null>(null);

  // Estado del Modal de Simulación
  const [showSimulacion, setShowSimulacion] = useState(false);
  const [amortizacionRows, setAmortizacionRows] = useState<AmortizacionRow[]>([]);
  const [loadingAmort, setLoadingAmort] = useState(false);
  const [amortError, setAmortError] = useState<string | null>(null);

  // Derivados
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

  // Cálculos de carrito
  const totalCompra = useMemo(() => {
    const subtotal = carrito.reduce(
      (sum, item) => sum + (item.precioUnitario * item.asientos.length),
      0
    );
    const descuento = formaPago === 'EFECTIVO' ? subtotal * 0.12 : 0;
    const subtotalConDescuento = subtotal - descuento;
    const iva = subtotalConDescuento * 0.15;
    return { subtotal, descuento, subtotalConDescuento, iva, total: subtotalConDescuento + iva };
  }, [carrito, formaPago]);

  // Acciones API
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
    if (!codigo) return;
    setLoadingLocalidades(true);
    setError(null);
    try {
      const data = await getLocalidades(codigo);
      // Combinar con lo que ya esté en el carrito para mostrar la cantidad seleccionada
      setLocalidadesSeleccion(data.map((loc) => {
        const inCart = carrito.find(c => c.codigoPartido === codigo && c.codigoLocalidad === loc.codigoLocalidad);
        return {
          ...loc,
          asientos: inCart ? inCart.asientos : []
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar localidades');
    } finally {
      setLoadingLocalidades(false);
    }
  };

  // Manejo de Carrito
  const handleSaveSeats = (loc: typeof localidadesSeleccion[0], asientosSeleccionados: AsientoCompra[]) => {
    setSeatMapLoc(null);

    if (asientosSeleccionados.length === 0) {
      // Remover si deseleccionó todos
      handleEliminarDelCarrito(selectedPartido!.codigo, loc.codigoLocalidad);
      return;
    }

    if (asientosSeleccionados.length > loc.disponibilidad) {
       setError(`Stock insuficiente para ${loc.codigoLocalidad}. Solo hay ${loc.disponibilidad}.`);
       return;
    }

    if (!selectedPartido) return;

    setCarrito(prev => {
      const existingIdx = prev.findIndex(c => c.codigoPartido === selectedPartido.codigo && c.codigoLocalidad === loc.codigoLocalidad);
      if (existingIdx >= 0) {
        // Actualizar
        const newCart = [...prev];
        newCart[existingIdx] = { ...newCart[existingIdx], asientos: asientosSeleccionados };
        return newCart;
      } else {
        // Añadir nuevo
        return [...prev, {
          codigoPartido: selectedPartido.codigo,
          partidoInfo: `${selectedPartido.equipoLocal} vs ${selectedPartido.equipoVisita}`,
          codigoLocalidad: loc.codigoLocalidad,
          asientos: asientosSeleccionados,
          precioUnitario: loc.precio
        }];
      }
    });
    
    // Actualizar vista local
    setLocalidadesSeleccion(prev => prev.map(l => 
      l.codigoLocalidad === loc.codigoLocalidad ? { ...l, asientos: asientosSeleccionados } : l
    ));

    setError(null);
  };

  const handleEliminarDelCarrito = (codigoPartido: string, codigoLocalidad: string) => {
    setCarrito(prev => prev.filter(c => !(c.codigoPartido === codigoPartido && c.codigoLocalidad === codigoLocalidad)));
    
    // Si la localidad eliminada es del partido que estoy viendo, actualizar a []
    if (codigoPartido === selectedPartido?.codigo) {
      setLocalidadesSeleccion(prev => prev.map(loc => 
        loc.codigoLocalidad === codigoLocalidad ? { ...loc, asientos: [] } : loc
      ));
    }
  };

  const handleSimularAmortizacion = async () => {
    if (carrito.length === 0) return;
    setLoadingAmort(true);
    setAmortError(null);
    setAmortizacionRows([]);
    setShowSimulacion(true);
    try {
      const rows = await simularAmortizacion(totalCompra.total, plazo);
      setAmortizacionRows(rows);
    } catch (err) {
      setAmortError(err instanceof Error ? err.message : 'No se pudo simular la tabla');
    } finally {
      setLoadingAmort(false);
    }
  };

  const handleCompra = async () => {
    if (!cedula || cedula.trim().length === 0) {
      setError('La cédula es requerida');
      return;
    }
    if (carrito.length === 0) {
      setError('Agrega al menos una localidad al carrito');
      return;
    }

    const lineas: LineaCompra[] = carrito.map((item) => ({
      codigoPartido: item.codigoPartido,
      codigoLocalidad: item.codigoLocalidad,
      asientos: item.asientos,
    }));

    setLoading(true);
    setError(null);
    setCompra(null);
    try {
      const response = await comprarBoletos({
        cedula: cedula.trim(),
        lineas,
        formaPago,
        plazo: formaPago === 'CREDITO' ? plazo : undefined,
      });
      setCompra(response);
      
      // Limpiar selección después de compra exitosa
      setCedula('');
      setCarrito([]);
      setCodigoPartido('');
      setSearchQuery('');
      setLocalidadesSeleccion([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la compra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartidos();
    if (isCliente && user?.cedula) {
      setCedula(user.cedula);
    }
  }, []);

  return (
    <ScreenShell
      title="Comprar boletos"
      subtitle="Arma tu carrito con localidades de diferentes partidos y paga en una sola factura."
      actions={<ActionButton label="Refrescar partidos" onPress={loadPartidos} />}>
      
      {/* Modal de Simulación de Amortización */}
      {seatMapLoc && selectedPartido && (
        <SeatMap 
          visible={!!seatMapLoc}
          codigoPartido={selectedPartido.codigo}
          codigoLocalidad={seatMapLoc.codigoLocalidad}
          capacidad={seatMapLoc.capacidad || 1000}
          initialSelectedSeats={seatMapLoc.asientos}
          initialSectionIndex={seatMapInitialSection}
          onClose={() => setSeatMapLoc(null)}
          onSave={(asientos) => handleSaveSeats(seatMapLoc, asientos)}
          isAdmin={user?.rol === 'admin'}
        />
      )}

      <Modal
        visible={showSimulacion}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSimulacion(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold">Vista Previa de Amortización</ThemedText>
              <Pressable onPress={() => setShowSimulacion(false)} style={styles.closeBtn}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>✕ Cerrar</ThemedText>
              </Pressable>
            </View>

            {loadingAmort ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.accent} />
                <ThemedText type="small">Simulando tabla...</ThemedText>
              </View>
            ) : amortError ? (
              <ThemedText type="small" style={{ color: '#e53e3e' }}>{amortError}</ThemedText>
            ) : amortizacionRows.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">No hay datos.</ThemedText>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  {/* Header */}
                  <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: theme.accent + '22', borderColor: theme.stroke }]}>
                    <ThemedText type="smallBold" style={[styles.col, styles.colNarrow]}>N°</ThemedText>
                    <ThemedText type="smallBold" style={styles.col}>Cuota</ThemedText>
                    <ThemedText type="smallBold" style={styles.col}>Interés</ThemedText>
                    <ThemedText type="smallBold" style={styles.col}>Capital</ThemedText>
                    <ThemedText type="smallBold" style={styles.col}>Saldo</ThemedText>
                  </View>
                  {/* Rows */}
                  {amortizacionRows.map((row, idx) => (
                    <View
                      key={row.numeroCuota}
                      style={[
                        styles.tableRow,
                        {
                          borderColor: theme.stroke,
                          backgroundColor: idx % 2 === 0 ? theme.background : theme.backgroundElement,
                        },
                      ]}>
                      <ThemedText type="small" style={[styles.col, styles.colNarrow]}>{row.numeroCuota}</ThemedText>
                      <ThemedText type="small" style={styles.col}>{formatMoney(row.valorCuota)}</ThemedText>
                      <ThemedText type="small" style={[styles.col, { color: '#e53e3e' }]}>{formatMoney(row.interes)}</ThemedText>
                      <ThemedText type="small" style={[styles.col, { color: theme.accent }]}>{formatMoney(row.capital)}</ThemedText>
                      <ThemedText type="small" style={styles.col}>{formatMoney(row.saldo)}</ThemedText>
                    </View>
                  ))}
                  {/* Totals footer */}
                  <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: theme.accent + '22', borderColor: theme.stroke }]}>
                    <ThemedText type="smallBold" style={[styles.col, styles.colNarrow]}>—</ThemedText>
                    <ThemedText type="smallBold" style={styles.col}>
                      {formatMoney(amortizacionRows.reduce((s, r) => s + r.valorCuota, 0))}
                    </ThemedText>
                    <ThemedText type="smallBold" style={[styles.col, { color: '#e53e3e' }]}>
                      {formatMoney(amortizacionRows.reduce((s, r) => s + r.interes, 0))}
                    </ThemedText>
                    <ThemedText type="smallBold" style={[styles.col, { color: theme.accent }]}>
                      {formatMoney(amortizacionRows.reduce((s, r) => s + r.capital, 0))}
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.col}>—</ThemedText>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 1. SELECCION DE PARTIDO Y LOCALIDADES */}
      <Card style={styles.formCard}>
        <FieldLabel>1. Busca y Selecciona Partidos</FieldLabel>
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

        {selectedPartido && (
          <FadeInView style={{ marginTop: Spacing.one }}>
            <FieldLabel>Selecciona localidad y sección — {selectedPartido.equipoLocal} vs {selectedPartido.equipoVisita}</FieldLabel>
            {loadingLocalidades ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.text} />
                <ThemedText type="small">Cargando localidades...</ThemedText>
              </View>
            ) : localidadesSeleccion.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No hay localidades disponibles
              </ThemedText>
            ) : (
              <StadiumMap
                localidades={localidadesSeleccion}
                onSelectSection={(localidad, sectionIndex) => {
                  setSeatMapInitialSection(sectionIndex);
                  setSeatMapLoc(localidad);
                }}
              />
            )}
          </FadeInView>
        )}
      </Card>

      {/* 2. CARRITO Y CHECKOUT */}
      <Card style={[styles.formCard, { marginTop: Spacing.two }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <FieldLabel>2. Tu Carrito y Checkout</FieldLabel>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {carrito.length} ítems
          </ThemedText>
        </View>
        
        {carrito.length === 0 ? (
           <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', padding: Spacing.two }}>
             El carrito está vacío. Agrega localidades arriba.
           </ThemedText>
        ) : (
          <FadeInView>
            <View style={styles.cartContainer}>
              {carrito.map((item) => (
                <View key={`${item.codigoPartido}-${item.codigoLocalidad}`} style={[styles.cartItem, { borderColor: theme.stroke, flexDirection: !isWide ? 'column' : 'row', alignItems: !isWide ? 'flex-start' : 'center' }]}>
                  <View style={{ flex: 1, width: '100%' }}>
                    <ThemedText type="smallBold">{item.partidoInfo}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.codigoLocalidad} • Asientos: {item.asientos.length}
                    </ThemedText>
                    {item.asientos.length > 0 && (
                      <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11, marginTop: 4 }}>
                        {item.asientos.map(a => `${a.seccion}-${a.numeroAsiento}`).join(', ')}
                      </ThemedText>
                    )}
                  </View>
                  <View style={{ alignItems: !isWide ? 'flex-start' : 'flex-end', marginTop: !isWide ? Spacing.one : 0, flexDirection: !isWide ? 'row' : 'column', justifyContent: !isWide ? 'space-between' : 'flex-start', width: !isWide ? '100%' : 'auto' }}>
                    <ThemedText type="smallBold">
                      {formatMoney(item.precioUnitario * item.asientos.length)}
                    </ThemedText>
                    <Pressable onPress={() => handleEliminarDelCarrito(item.codigoPartido, item.codigoLocalidad)}>
                      <ThemedText type="small" style={{ color: '#e53e3e', marginTop: !isWide ? 0 : 4 }}>Remover</ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.divider, { marginVertical: Spacing.two }]} />
            
            <View style={{ gap: Spacing.one, marginBottom: Spacing.two }}>
              <View style={styles.lineaResumen}>
                <ThemedText type="small">Subtotal:</ThemedText>
                <ThemedText type="small">{formatMoney(totalCompra.subtotal)}</ThemedText>
              </View>
              {formaPago === 'EFECTIVO' && (
                <View style={styles.lineaResumen}>
                  <ThemedText type="small" style={{ color: theme.accent }}>Descuento (12%):</ThemedText>
                  <ThemedText type="small" style={{ color: theme.accent }}>-{formatMoney(totalCompra.descuento)}</ThemedText>
                </View>
              )}
              <View style={styles.lineaResumen}>
                <ThemedText type="small">IVA (15%):</ThemedText>
                <ThemedText type="small">{formatMoney(totalCompra.iva)}</ThemedText>
              </View>
              <View style={styles.lineaResumen}>
                <ThemedText type="smallBold" style={{ fontSize: 16 }}>Total a Pagar:</ThemedText>
                <ThemedText type="smallBold" style={{ fontSize: 16, color: theme.accent }}>{formatMoney(totalCompra.total)}</ThemedText>
              </View>
            </View>

            <FieldLabel>Cédula / DNI</FieldLabel>
            <TextField
              value={cedula}
              onChangeText={setCedula}
              placeholder="Ej: 1234567890"
              keyboardType="default"
              editable={!isCliente}
            />
            <View style={{ height: Spacing.one }} />

            <FieldLabel>Forma de Pago</FieldLabel>
            <View style={styles.formActions}>
              <Pressable
                style={[
                  styles.selectOption,
                  styles.gridItem,
                  { minHeight: 60, borderColor: theme.stroke, backgroundColor: formaPago === 'EFECTIVO' ? theme.accentSoft : theme.background },
                ]}
                onPress={() => setFormaPago('EFECTIVO')}>
                <ThemedText type="smallBold" style={{ color: formaPago === 'EFECTIVO' ? theme.accent : theme.text }}>
                  Efectivo (12% dto)
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.selectOption,
                  styles.gridItem,
                  { minHeight: 60, borderColor: theme.stroke, backgroundColor: formaPago === 'CREDITO' ? theme.accentSoft : theme.background },
                ]}
                onPress={() => setFormaPago('CREDITO')}>
                <ThemedText type="smallBold" style={{ color: formaPago === 'CREDITO' ? theme.accent : theme.text }}>
                  Crédito Directo
                </ThemedText>
              </Pressable>
            </View>

            {formaPago === 'CREDITO' && (
              <View style={{ gap: Spacing.one, marginTop: Spacing.one }}>
                <FieldLabel>Plazo del crédito (meses: 3 - 18)</FieldLabel>
                <View style={styles.formActions}>
                  {[3, 6, 9, 12, 18].map((m) => (
                    <Pressable
                      key={m}
                      style={[
                        styles.selectOption,
                        {
                          paddingVertical: Spacing.one,
                          minHeight: 40,
                          borderColor: theme.stroke,
                          backgroundColor: plazo === m ? theme.accentSoft : theme.background,
                        },
                      ]}
                      onPress={() => setPlazo(m)}>
                      <ThemedText type="smallBold" style={{ color: plazo === m ? theme.accent : theme.text }}>
                        {m}m
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
                {carrito.length > 0 && (
                  <Pressable
                    onPress={handleSimularAmortizacion}
                    style={{ marginTop: Spacing.one, alignSelf: 'flex-start' }}>
                    <ThemedText type="smallBold" style={{ color: theme.accent, textDecorationLine: 'underline' }}>
                      Vista previa de tabla de amortización
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            )}

            <View style={{ marginTop: Spacing.two }}>
              <ActionButton label="Pagar Carrito" onPress={handleCompra} disabled={loading} />
            </View>
          </FadeInView>
        )}
      </Card>

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
            {compra.formaPago === 'EFECTIVO' && compra.descuento > 0 && (
              <ThemedText type="small" style={{ color: theme.accent }}>
                Descuento: -{formatMoney(compra.descuento)}
              </ThemedText>
            )}
            <ThemedText type="small" themeColor="textSecondary">
              IVA: {formatMoney(compra.iva)}
            </ThemedText>
            <ThemedText type="smallBold">Total pagado ({compra.formaPago}): {formatMoney(compra.total)}</ThemedText>
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
    width: 60,
  },
  cartContainer: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.one,
    borderBottomWidth: 1,
    paddingBottom: Spacing.two,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  tableHeaderRow: {
    borderTopWidth: 1,
  },
  col: {
    width: 100,
    textAlign: 'right',
  },
  colNarrow: {
    width: 40,
    textAlign: 'center',
  },
});
