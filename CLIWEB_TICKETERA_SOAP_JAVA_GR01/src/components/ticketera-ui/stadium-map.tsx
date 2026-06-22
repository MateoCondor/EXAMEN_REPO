/**
 * StadiumMap — Fallback para React Native (iOS/Android)
 * Sin SVG: muestra una cuadrícula de localidades y secciones.
 * La versión web completa con SVG está en stadium-map.web.tsx
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ticketera-ui';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { AsientoCompra } from '@/lib/ticketera-api';
import { formatMoney } from '@/lib/format';

export interface LocalidadUI {
  codigoLocalidad: string;
  capacidad: number;
  disponibilidad: number;
  precio: number;
  asientos: AsientoCompra[];
}

export interface StadiumMapProps {
  localidades: LocalidadUI[];
  onSelectSection: (localidad: LocalidadUI, sectionIndex: number) => void;
}

const ZONE_COLORS = [
  { fill: '#FFD700', stroke: '#B8860B', text: '#5c4000' },
  { fill: '#64B5F6', stroke: '#1565C0', text: '#0a2a5e' },
  { fill: '#81C784', stroke: '#2E7D32', text: '#0d3b15' },
  { fill: '#CE93D8', stroke: '#7B1FA2', text: '#3b0a5e' },
  { fill: '#FFAB91', stroke: '#E64A19', text: '#5e1a00' },
];

const SEATS_PER_SECTION = 100;
const SECTIONS_PER_PAGE = 20;

export function StadiumMap({ localidades, onSelectSection }: StadiumMapProps) {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'overview' | 'zoom'>('overview');
  const [selectedLocalidadIdx, setSelectedLocalidadIdx] = useState<number | null>(null);
  const [sectionPage, setSectionPage] = useState(0);

  const sortedByPrice = [...localidades].sort((a, b) => b.precio - a.precio);

  const handleLocalidadSelect = useCallback((idx: number) => {
    setSelectedLocalidadIdx(idx);
    setSectionPage(0);
    setViewMode('zoom');
  }, []);

  const handleBack = useCallback(() => {
    setViewMode('overview');
    setSelectedLocalidadIdx(null);
  }, []);

  const selectedLocalidad = selectedLocalidadIdx !== null ? localidades[selectedLocalidadIdx] : null;
  const selectedColorIdx = selectedLocalidad
    ? sortedByPrice.findIndex((l) => l.codigoLocalidad === selectedLocalidad.codigoLocalidad)
    : 0;
  const selectedColor = ZONE_COLORS[Math.min(selectedColorIdx, ZONE_COLORS.length - 1)];

  const totalSections = selectedLocalidad ? Math.ceil((selectedLocalidad.capacidad || 1000) / SEATS_PER_SECTION) : 0;
  const totalPages = Math.ceil(totalSections / SECTIONS_PER_PAGE);
  const visibleSections = Array.from(
    { length: Math.min(SECTIONS_PER_PAGE, totalSections - sectionPage * SECTIONS_PER_PAGE) },
    (_, i) => sectionPage * SECTIONS_PER_PAGE + i
  );

  const selectedSectionNames = new Set(selectedLocalidad?.asientos.map((a) => a.seccion) ?? []);

  return (
    <View style={[styles.container, { borderColor: theme.stroke, backgroundColor: theme.backgroundElement }]}>
      {/* Cabecera */}
      <View style={styles.header}>
        {viewMode === 'zoom' && (
          <Pressable onPress={handleBack}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>← Volver</ThemedText>
          </Pressable>
        )}
        <ThemedText type="smallBold">
          {viewMode === 'overview' ? '🏟️ Selecciona una localidad' : `📍 ${selectedLocalidad?.codigoLocalidad}`}
        </ThemedText>
      </View>

      {viewMode === 'overview' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.localidadesGrid}>
            {sortedByPrice.map((loc, i) => {
              const col = ZONE_COLORS[Math.min(i, ZONE_COLORS.length - 1)];
              const realIdx = localidades.indexOf(loc);
              return (
                <Pressable
                  key={loc.codigoLocalidad}
                  onPress={() => handleLocalidadSelect(realIdx)}
                  style={[styles.localidadCard, { borderColor: col.stroke, backgroundColor: col.fill + '33' }]}
                >
                  <View style={[styles.colorBadge, { backgroundColor: col.fill, borderColor: col.stroke }]} />
                  <View style={{ flex: 1 }}>
                    <ThemedText type="smallBold">{loc.codigoLocalidad}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {formatMoney(loc.precio)} · {loc.disponibilidad} disponibles
                    </ThemedText>
                    {loc.asientos.length > 0 && (
                      <ThemedText type="small" style={{ color: theme.accent }}>
                        ✓ {loc.asientos.length} asientos seleccionados
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText type="small" style={{ color: col.stroke }}>›</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : selectedLocalidad ? (
        <View style={{ flex: 1, gap: Spacing.two }}>
          {/* Info */}
          <View style={[styles.infoBand, { backgroundColor: selectedColor.fill + '22', borderColor: selectedColor.stroke + '44' }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {totalSections} secciones · {selectedLocalidad.disponibilidad} asientos libres
            </ThemedText>
          </View>

          {/* Grid de secciones */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sectionsGrid}>
              {visibleSections.map((sectionIdx) => {
                const secName = `Sección ${sectionIdx + 1}`;
                const isSelected = selectedSectionNames.has(secName);
                return (
                  <Pressable
                    key={sectionIdx}
                    onPress={() => onSelectSection(selectedLocalidad, sectionIdx)}
                    style={[
                      styles.sectionCell,
                      {
                        backgroundColor: isSelected ? selectedColor.stroke : selectedColor.fill + '55',
                        borderColor: selectedColor.stroke,
                      },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ fontSize: 11, color: isSelected ? '#fff' : selectedColor.text }}
                    >
                      S{sectionIdx + 1}
                    </ThemedText>
                    {isSelected && (
                      <ThemedText style={{ fontSize: 8, color: '#fff' }}>✓</ThemedText>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Paginación */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <ActionButton
                label="< Ant"
                variant="outline"
                onPress={() => setSectionPage((p) => Math.max(0, p - 1))}
                disabled={sectionPage === 0}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Página {sectionPage + 1} / {totalPages}
              </ThemedText>
              <ActionButton
                label="Sig >"
                variant="outline"
                onPress={() => setSectionPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={sectionPage === totalPages - 1}
              />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  localidadesGrid: {
    gap: Spacing.two,
  },
  localidadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: Spacing.two,
  },
  colorBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  infoBand: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    alignItems: 'center',
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  sectionCell: {
    width: 52,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
});
