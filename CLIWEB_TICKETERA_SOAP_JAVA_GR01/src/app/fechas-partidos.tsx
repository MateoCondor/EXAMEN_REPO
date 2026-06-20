import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import {
  deleteFechaPartido,
  FechaPartido,
  getFechasPartidos,
  updateFechaPartido,
} from '@/lib/federacion-api';

function toInputValue(value?: string | number | Date | null) {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 16);
}

export default function FechasPartidosScreen() {
  const [items, setItems] = useState<FechaPartido[]>([]);
  const [codigoPartido, setCodigoPartido] = useState('');
  const [fechaInput, setFechaInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    setError(null);
    try {
      const data = await getFechasPartidos();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar fechas de partidos');
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSave = async () => {
    if (!codigoPartido.trim() || !fechaInput.trim()) {
      setError('Completa código de partido y fecha');
      return;
    }
    if (Number.isNaN(new Date(fechaInput).getTime())) {
      setError('Fecha inválida. Usa formato 2026-06-05T19:00');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateFechaPartido(codigoPartido.trim(), new Date(fechaInput).toISOString());
      setCodigoPartido('');
      setFechaInput('');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la fecha');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteFechaPartido(codigo);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la fecha');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      title="Fechas de partidos"
      subtitle="CRUD de fechas para los partidos existentes."
      actions={<ActionButton label="Refrescar" onPress={loadItems} />}>
      <Card style={styles.formCard}>
        <FieldLabel>Asignar/actualizar fecha</FieldLabel>
        <TextField
          value={codigoPartido}
          onChangeText={setCodigoPartido}
          placeholder="Código partido (ej: PF001)"
        />
        <TextField
          value={fechaInput}
          onChangeText={setFechaInput}
          placeholder="Fecha ISO (ej: 2026-06-05T19:00)"
        />
        <View style={styles.actionsRow}>
          <ActionButton label={saving ? 'Guardando...' : 'Guardar fecha'} onPress={handleSave} disabled={saving} />
          <ActionButton
            label="Limpiar"
            variant="ghost"
            onPress={() => {
              setCodigoPartido('');
              setFechaInput('');
              setError(null);
            }}
            disabled={saving}
          />
        </View>
      </Card>

      {error ? (
        <Card style={styles.errorCard}>
          <ThemedText type="smallBold">Error</ThemedText>
          <ThemedText type="small">{error}</ThemedText>
        </Card>
      ) : null}

      <View style={styles.list}>
        {items.map((item, index) => (
          <FadeInView key={item.codigoPartido} delay={index * 30}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <ThemedText type="smallBold">{item.codigoPartido}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Fecha: {item.fecha ? formatDate(item.fecha) : 'Sin fecha'}
                  </ThemedText>
                </View>
                <View style={styles.cardButtons}>
                  <ActionButton
                    label="Editar"
                    variant="outline"
                    onPress={() => {
                      setCodigoPartido(item.codigoPartido);
                      setFechaInput(toInputValue(item.fecha));
                    }}
                  />
                  <ActionButton label="Quitar fecha" variant="ghost" onPress={() => handleDelete(item.codigoPartido)} />
                </View>
              </View>
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 24, 0.35)',
  },
  list: {
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  cardTitleWrap: {
    flex: 1,
    gap: Spacing.half,
  },
  cardButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});