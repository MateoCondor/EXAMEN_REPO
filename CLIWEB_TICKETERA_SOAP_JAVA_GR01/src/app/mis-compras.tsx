import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate, formatMoney } from '@/lib/format';
import {
  getFacturasCliente,
  getAmortizacion,
  Factura,
  AmortizacionRow,
} from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { SeatMap } from '@/components/ticketera-ui/seat-map';

export default function MisComprasScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Amortization modal state
  const [showAmortizacion, setShowAmortizacion] = useState(false);
  const [amortizacionRows, setAmortizacionRows] = useState<AmortizacionRow[]>([]);
  const [loadingAmort, setLoadingAmort] = useState(false);
  const [amortError, setAmortError] = useState<string | null>(null);

  // SeatMap modal state
  const [viewSeatsData, setViewSeatsData] = useState<{
    codigoPartido: string;
    codigoLocalidad: string;
    facturaId: number;
  } | null>(null);

  const loadFacturas = async () => {
    if (!user?.cedula) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFacturasCliente(user.cedula);
      setFacturas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar tus compras');
    } finally {
      setLoading(false);
    }
  };

  const handleVerAmortizacion = async () => {
    if (!user?.cedula) return;
    setLoadingAmort(true);
    setAmortError(null);
    setAmortizacionRows([]);
    setShowAmortizacion(true);
    try {
      const rows = await getAmortizacion(user.cedula);
      setAmortizacionRows(rows);
    } catch (err) {
      setAmortError(err instanceof Error ? err.message : 'No se pudo cargar la tabla de amortización');
    } finally {
      setLoadingAmort(false);
    }
  };

  const totalGastado = facturas.reduce((acc, f) => acc + f.total, 0);
  const hasCredito = facturas.some((f) => (f as any).formaPago === 'CREDITO');

  useEffect(() => {
    loadFacturas();
  }, [user?.cedula]);

  return (
    <ScreenShell
      title="Mis Compras"
      subtitle={`Historial de compras de ${user?.username ?? ''}`}
      actions={<ActionButton label="Refrescar" onPress={loadFacturas} />}>

      {/* Amortization Modal */}
      <Modal
        visible={showAmortizacion}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAmortizacion(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="smallBold">Tabla de Amortización</ThemedText>
              <Pressable onPress={() => setShowAmortizacion(false)} style={styles.closeBtn}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>✕ Cerrar</ThemedText>
              </Pressable>
            </View>

            {loadingAmort ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.accent} />
                <ThemedText type="small">Cargando tabla...</ThemedText>
              </View>
            ) : amortError ? (
              <ThemedText type="small" style={{ color: '#e53e3e' }}>{amortError}</ThemedText>
            ) : amortizacionRows.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">No hay datos de amortización.</ThemedText>
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

      {/* Ver Asientos Modal */}
      {viewSeatsData && (
        <SeatMap 
          visible={!!viewSeatsData}
          codigoPartido={viewSeatsData.codigoPartido}
          codigoLocalidad={viewSeatsData.codigoLocalidad}
          capacidad={10000} // Valor alto de fallback para permitir ver todas las páginas en modo lectura
          initialSelectedSeats={[]}
          onClose={() => setViewSeatsData(null)}
          highlightFacturaId={viewSeatsData.facturaId}
          readOnly={true}
        />
      )}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.text} />
          <ThemedText type="small">Cargando compras...</ThemedText>
        </View>
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <ThemedText type="smallBold">Error</ThemedText>
          <ThemedText type="small">{error}</ThemedText>
        </Card>
      ) : null}

      {!loading && facturas.length > 0 ? (
        <FadeInView>
          <Card>
            <View style={styles.summaryRow}>
              <ThemedText type="smallBold">Total de compras:</ThemedText>
              <ThemedText type="smallBold">{facturas.length}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="smallBold">Total gastado:</ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {formatMoney(totalGastado)}
              </ThemedText>
            </View>
          </Card>
        </FadeInView>
      ) : null}

      {!loading && facturas.length > 0 ? (
        <FadeInView delay={80}>
          <Card>
            <FieldLabel>Detalle de compras</FieldLabel>
            <View style={styles.facturasList}>
              {facturas.map((factura) => {
                const f = factura as any;
                const isCredito = f.formaPago === 'CREDITO';
                return (
                  <View key={factura.idFactura} style={[styles.facturaCard, { borderColor: isCredito ? theme.accent + '66' : theme.stroke }]}>
                    <View style={styles.facturaHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                        <ThemedText type="smallBold">Factura #{factura.idFactura}</ThemedText>
                        {isCredito && (
                          <View style={[styles.badge, { backgroundColor: theme.accent + '22' }]}>
                            <ThemedText type="small" style={{ color: theme.accent, fontSize: 10 }}>CRÉDITO</ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">{formatDate(factura.fecha)}</ThemedText>
                    </View>
                    <View style={styles.facturaLineas}>
                      {factura.lineas.map((linea, idx) => (
                        <View key={idx} style={styles.lineaResumenContainer}>
                          <View style={styles.lineaResumen}>
                            <ThemedText type="small" themeColor="textSecondary">
                              {linea.cantidad}x {linea.codigoLocalidad}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                              {formatMoney(linea.total)}
                            </ThemedText>
                          </View>
                          {linea.codigoPartido && (
                            <Pressable
                              onPress={() => setViewSeatsData({
                                codigoPartido: linea.codigoPartido,
                                codigoLocalidad: linea.codigoLocalidad,
                                facturaId: factura.idFactura
                              })}
                              style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                              <ThemedText type="smallBold" style={{ color: theme.accent, fontSize: 11 }}>
                                🔍 Ver mis asientos en el mapa
                              </ThemedText>
                            </Pressable>
                          )}
                        </View>
                      ))}
                    </View>
                    <View style={styles.facturaFooter}>
                      <ThemedText type="smallBold" style={{ color: theme.accent }}>
                        Total: {formatMoney(factura.total)}
                      </ThemedText>
                      {isCredito && (
                        <Pressable
                          onPress={handleVerAmortizacion}
                          style={[styles.amortBtnSmall, { borderColor: theme.accent }]}>
                          <ThemedText type="small" style={{ color: theme.accent }}>
                            📋 Ver Amortización
                          </ThemedText>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </FadeInView>
      ) : null}

      {!loading && facturas.length === 0 && !error ? (
        <Card>
          <ThemedText type="small">No tienes compras registradas aún.</ThemedText>
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
  errorCard: {
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 24, 0.35)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amortBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
  amortBtnSmall: {
    marginTop: Spacing.one,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  facturasList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  facturaCard: {
    padding: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.one,
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  facturaLineas: {
    marginTop: Spacing.one,
    gap: Spacing.one,
  },
  lineaResumenContainer: {
    gap: 2,
    paddingBottom: Spacing.half,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  lineaResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facturaFooter: {
    marginTop: Spacing.one,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
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
