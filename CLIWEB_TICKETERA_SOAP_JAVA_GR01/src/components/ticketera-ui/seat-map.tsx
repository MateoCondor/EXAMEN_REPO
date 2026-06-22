import React, { useEffect, useState, useMemo } from 'react';
import { Modal, StyleSheet, View, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ActionButton, TextField, FieldLabel } from '@/components/ticketera-ui';
import { getBoletosOcupados, BoletoOcupado, AsientoCompra } from '@/lib/ticketera-api';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface SeatMapProps {
  visible: boolean;
  codigoPartido: string;
  codigoLocalidad: string;
  capacidad: number;
  initialSelectedSeats: AsientoCompra[];
  onClose: () => void;
  onSave?: (asientos: AsientoCompra[]) => void;
  isAdmin?: boolean;
  highlightFacturaId?: number;
  readOnly?: boolean;
  /** Índice de sección a mostrar al abrir (viene del mapa del estadio) */
  initialSectionIndex?: number;
}

const SEATS_PER_SECTION = 100;
const SEATS_PER_ROW = 10;

export function SeatMap({
  visible,
  codigoPartido,
  codigoLocalidad,
  capacidad,
  initialSelectedSeats,
  onClose,
  onSave,
  isAdmin,
  highlightFacturaId,
  readOnly,
  initialSectionIndex,
}: SeatMapProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [loading, setLoading] = useState(false);
  const [ocupados, setOcupados] = useState<BoletoOcupado[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Asientos que el usuario está seleccionando ahora mismo
  const [selectedSeats, setSelectedSeats] = useState<AsientoCompra[]>([]);
  
  // Info del asiento ocupado si admin pasa el mouse
  const [hoveredOcupado, setHoveredOcupado] = useState<BoletoOcupado | null>(null);

  useEffect(() => {
    if (visible && codigoPartido && codigoLocalidad) {
      loadOcupados();
      setSelectedSeats([...initialSelectedSeats]);
      // Si viene del mapa del estadio, abrir en la sección elegida
      setCurrentSectionIndex(initialSectionIndex ?? 0);
    }
  }, [visible, codigoPartido, codigoLocalidad]);

  const loadOcupados = async () => {
    setLoading(true);
    try {
      const data = await getBoletosOcupados(codigoPartido, codigoLocalidad);
      setOcupados(data);
      
      if (highlightFacturaId) {
        const highlightedSeat = data.find(o => o.facturaId === highlightFacturaId);
        if (highlightedSeat && highlightedSeat.seccion) {
          const match = highlightedSeat.seccion.match(/Sección (\d+)/i);
          if (match && match[1]) {
            const index = parseInt(match[1], 10) - 1;
            if (index >= 0) {
              setCurrentSectionIndex(index);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asientos');
    } finally {
      setLoading(false);
    }
  };

  const totalSections = Math.ceil(capacidad / SEATS_PER_SECTION);
  const currentSectionName = `Sección ${currentSectionIndex + 1}`;
  
  const handleToggleSeat = (numeroAsiento: string) => {
    if (readOnly) return;
    const isOcupado = ocupados.some(o => o.seccion === currentSectionName && o.numeroAsiento === numeroAsiento);
    if (isOcupado) return;
    
    const existingIdx = selectedSeats.findIndex(s => s.seccion === currentSectionName && s.numeroAsiento === numeroAsiento);
    if (existingIdx >= 0) {
      // Remover
      const newSeats = [...selectedSeats];
      newSeats.splice(existingIdx, 1);
      setSelectedSeats(newSeats);
    } else {
      // Agregar (sin nombre al principio)
      setSelectedSeats([...selectedSeats, { seccion: currentSectionName, numeroAsiento, nombreAsistente: '' }]);
    }
  };

  const handleUpdateName = (seccion: string, numeroAsiento: string, nombre: string) => {
    const newSeats = selectedSeats.map(s => {
      if (s.seccion === seccion && s.numeroAsiento === numeroAsiento) {
        return { ...s, nombreAsistente: nombre };
      }
      return s;
    });
    setSelectedSeats(newSeats);
  };

  const renderGrid = () => {
    const seatsInThisSection = Math.min(SEATS_PER_SECTION, capacidad - currentSectionIndex * SEATS_PER_SECTION);
    const rows = Math.ceil(seatsInThisSection / SEATS_PER_ROW);
    
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const rowSeats = [];
      for (let c = 0; c < SEATS_PER_ROW; c++) {
        const seatNumber = r * SEATS_PER_ROW + c + 1;
        if (seatNumber > seatsInThisSection) break;
        
        const numeroAsientoStr = `A-${seatNumber}`;
        const ocupado = ocupados.find(o => o.seccion === currentSectionName && o.numeroAsiento === numeroAsientoStr);
        const selected = selectedSeats.find(s => s.seccion === currentSectionName && s.numeroAsiento === numeroAsientoStr);
        
        let bgColor: string = theme.backgroundElement; // Libre
        let borderColor: string = theme.stroke;
        let textColor: string = theme.text;
        
        if (ocupado) {
          if (highlightFacturaId && ocupado.facturaId === highlightFacturaId) {
            bgColor = '#38a169'; // Verde
            borderColor = '#2f855a';
            textColor = '#fff';
          } else {
            bgColor = '#e53e3e'; // Rojo
            borderColor = '#c53030';
            textColor = '#fff';
          }
        } else if (selected) {
          bgColor = theme.accent; // Azul
          borderColor = theme.accent;
          textColor = '#fff';
        }
        
        rowSeats.push(
          <Pressable
            key={numeroAsientoStr}
            onPress={() => handleToggleSeat(numeroAsientoStr)}
            onHoverIn={() => {
              if (isAdmin && ocupado) setHoveredOcupado(ocupado);
            }}
            onHoverOut={() => {
              if (isAdmin && ocupado) setHoveredOcupado(null);
            }}
            style={[
              styles.seat,
              { backgroundColor: bgColor, borderColor }
            ]}
          >
            <ThemedText type="smallBold" style={{ color: textColor, fontSize: 10 }}>{seatNumber}</ThemedText>
          </Pressable>
        );
      }
      grid.push(
        <View key={`row-${r}`} style={styles.seatRow}>
          {rowSeats}
        </View>
      );
    }
    return grid;
  };

  const allNamesFilled = selectedSeats.every(s => s.nombreAsistente.trim().length > 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <View>
              <ThemedText type="subtitle">Seleccionar Asientos</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{codigoLocalidad} (Capacidad: {capacidad})</ThemedText>
            </View>
            <Pressable onPress={onClose} style={{ padding: Spacing.one }}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {isMobile ? "✕" : "✕ Cerrar"}
              </ThemedText>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: Spacing.three }} color={theme.accent} />
          ) : error ? (
            <ThemedText type="small" style={{ color: '#e53e3e', padding: Spacing.two }}>{error}</ThemedText>
          ) : (
            <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row', gap: Spacing.two }}>
              
              {/* Columna Izquierda: Mapa */}
              <View style={{ flex: isMobile ? 1 : 2, borderWidth: 1, borderColor: theme.stroke, borderRadius: 12, padding: Spacing.two }}>
                {/* Paginación de secciones */}
                <View style={styles.sectionPagination}>
                  <ActionButton 
                    label="< Ant" 
                    variant="outline" 
                    onPress={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentSectionIndex === 0}
                  />
                  <ThemedText type="smallBold">{currentSectionName}</ThemedText>
                  <ActionButton 
                    label="Sig >" 
                    variant="outline" 
                    onPress={() => setCurrentSectionIndex(prev => Math.min(totalSections - 1, prev + 1))}
                    disabled={currentSectionIndex === totalSections - 1}
                  />
                </View>
                
                {/* Leyenda */}
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: theme.backgroundElement, borderColor: theme.stroke }]} />
                    <ThemedText type="small">Libre</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: theme.accent }]} />
                    <ThemedText type="small">Seleccionado</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: '#e53e3e' }]} />
                    <ThemedText type="small">Ocupado</ThemedText>
                  </View>
                  {highlightFacturaId && (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: '#38a169' }]} />
                      <ThemedText type="small">Tus Asientos (Factura #{highlightFacturaId})</ThemedText>
                    </View>
                  )}
                </View>

                {/* Grid */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                  {isMobile ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                      <View style={[styles.gridContainer, { alignItems: 'flex-start' }]}>
                        {renderGrid()}
                      </View>
                    </ScrollView>
                  ) : (
                    <View style={styles.gridContainer}>
                      {renderGrid()}
                    </View>
                  )}
                </ScrollView>
                
                {/* Info para admin */}
                {isAdmin && hoveredOcupado && (
                  <View style={[styles.adminInfo, { backgroundColor: theme.backgroundElement, borderColor: theme.stroke }]}>
                    <ThemedText type="smallBold">Info de Asiento Ocupado</ThemedText>
                    <ThemedText type="small">Asiento: {hoveredOcupado.numeroAsiento}</ThemedText>
                    <ThemedText type="small">Asistente: {hoveredOcupado.nombreAsistente}</ThemedText>
                    <ThemedText type="small">Factura ID: {hoveredOcupado.facturaId}</ThemedText>
                    <ThemedText type="small">Cédula Comprador: {hoveredOcupado.cedulaCliente}</ThemedText>
                  </View>
                )}
              </View>

              {/* Columna Derecha: Asistentes (solo si no es readOnly) */}
              {!readOnly && (
                <View style={{ flex: 1, borderWidth: 1, borderColor: theme.stroke, borderRadius: 12, padding: Spacing.two }}>
                  <ThemedText type="smallBold" style={{ marginBottom: Spacing.one }}>
                    Asientos Seleccionados ({selectedSeats.length})
                  </ThemedText>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {selectedSeats.length === 0 ? (
                      <ThemedText type="small" themeColor="textSecondary">Haz clic en asientos libres del mapa para agregarlos.</ThemedText>
                    ) : (
                      <View style={{ gap: Spacing.two }}>
                        {selectedSeats.map((seat, idx) => (
                          <View key={`${seat.seccion}-${seat.numeroAsiento}`} style={{ gap: 4 }}>
                            <ThemedText type="smallBold">{seat.seccion} - {seat.numeroAsiento}</ThemedText>
                            <TextField 
                              placeholder="Nombre del Asistente..."
                              value={seat.nombreAsistente}
                              onChangeText={(val) => handleUpdateName(seat.seccion, seat.numeroAsiento, val)}
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </ScrollView>
                  <View style={{ marginTop: Spacing.two }}>
                    <ActionButton 
                      label="Confirmar Asientos" 
                      onPress={() => onSave && onSave(selectedSeats)}
                      disabled={selectedSeats.length === 0 || !allNamesFilled}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 1000,
    height: '90%',
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionPagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.two,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gridContainer: {
    gap: Spacing.one,
    alignItems: 'center',
    paddingBottom: Spacing.two,
  },
  seatRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  seat: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    marginTop: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: 8,
  }
});
