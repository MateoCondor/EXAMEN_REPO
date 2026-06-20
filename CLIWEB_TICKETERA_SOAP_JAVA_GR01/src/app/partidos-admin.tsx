import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import {
  createPartido,
  deletePartido,
  Estadio,
  getEstadios,
  getPartidos,
  PartidoAdmin,
  updatePartido,
} from '@/lib/federacion-api';

type PartidoForm = PartidoAdmin;

const emptyForm: PartidoForm = {
  codigo: '',
  equipoLocal: '',
  equipoVisita: '',
  fecha: null,
  lugar: '',
  estadio: { codigo: '' },
};

export default function PartidosAdminScreen() {
  const [partidos, setPartidos] = useState<PartidoAdmin[]>([]);
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [form, setForm] = useState<PartidoForm>(emptyForm);
  const [editingCodigo, setEditingCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const loadEstadios = async () => {
    try {
      const data = await getEstadios();
      setEstadios(data);
    } catch {
      // se refleja al guardar si el estadio no existe
    }
  };

  useEffect(() => {
    loadPartidos();
    loadEstadios();
  }, []);

  const startEdit = (partido: PartidoAdmin) => {
    setEditingCodigo(partido.codigo);
    setForm({
      ...partido,
      fecha: partido.fecha,
      estadio: { codigo: partido.estadio?.codigo ?? '' },
    });
    setError(null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCodigo(null);
  };

  const handleSave = async () => {
    if (!form.codigo.trim() || !form.equipoLocal.trim() || !form.equipoVisita.trim()) {
      setError('Completa código y equipos');
      return;
    }
    if (!form.estadio?.codigo?.trim()) {
      setError('Selecciona o escribe el código del estadio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        codigo: form.codigo.trim(),
        equipoLocal: form.equipoLocal.trim(),
        equipoVisita: form.equipoVisita.trim(),
        lugar: form.lugar?.trim() || '',
        estadio: { codigo: form.estadio.codigo.trim() },
      };
      if (editingCodigo) {
        await updatePartido(editingCodigo, payload);
      } else {
        await createPartido(payload);
      }
      resetForm();
      await loadPartidos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el partido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    setSaving(true);
    setError(null);
    try {
      await deletePartido(codigo);
      if (editingCodigo === codigo) {
        resetForm();
      }
      await loadPartidos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el partido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      title="Partidos"
      subtitle="Mantenimiento de partidos disponibles en la federación."
      actions={<ActionButton label="Refrescar" onPress={loadPartidos} />}>
      <Card style={styles.formCard}>
        <FieldLabel>{editingCodigo ? 'Editar partido' : 'Nuevo partido'}</FieldLabel>
        <TextField
          value={form.codigo}
          onChangeText={(value) => setForm((prev) => ({ ...prev, codigo: value }))}
          placeholder="Código"
          editable={!editingCodigo}
        />
        <TextField
          value={form.equipoLocal}
          onChangeText={(value) => setForm((prev) => ({ ...prev, equipoLocal: value }))}
          placeholder="Equipo local"
        />
        <TextField
          value={form.equipoVisita}
          onChangeText={(value) => setForm((prev) => ({ ...prev, equipoVisita: value }))}
          placeholder="Equipo visita"
        />
        <TextField
          value={form.estadio?.codigo ?? ''}
          onChangeText={(value) =>
            setForm((prev) => ({
              ...prev,
              estadio: { codigo: value },
            }))
          }
          placeholder="Código de estadio (ej: ES001)"
        />
        <TextField
          value={form.lugar}
          onChangeText={(value) => setForm((prev) => ({ ...prev, lugar: value }))}
          placeholder="Lugar (opcional)"
        />
        <View style={styles.estadiosWrap}>
          {estadios.map((estadio) => (
            <ActionButton
              key={estadio.codigo}
              label={`${estadio.codigo} ${estadio.nombre}`}
              variant={form.estadio?.codigo === estadio.codigo ? 'primary' : 'outline'}
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  estadio: { codigo: estadio.codigo },
                  lugar: prev.lugar || estadio.nombre,
                }))
              }
            />
          ))}
        </View>
        <View style={styles.actionsRow}>
          <ActionButton
            label={saving ? 'Guardando...' : editingCodigo ? 'Actualizar' : 'Crear'}
            onPress={handleSave}
            disabled={saving}
          />
          <ActionButton label="Limpiar" variant="ghost" onPress={resetForm} disabled={saving} />
        </View>
      </Card>

      {error ? (
        <Card style={styles.errorCard}>
          <ThemedText type="smallBold">Error</ThemedText>
          <ThemedText type="small">{error}</ThemedText>
        </Card>
      ) : null}

      <View style={styles.list}>
        {partidos.map((partido, index) => (
          <FadeInView key={partido.codigo} delay={index * 40}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <ThemedText type="smallBold">{partido.equipoLocal} vs {partido.equipoVisita}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{partido.codigo}</ThemedText>
                </View>
                <View style={styles.cardButtons}>
                  <ActionButton label="Editar" variant="outline" onPress={() => startEdit(partido)} />
                  <ActionButton label="Eliminar" variant="ghost" onPress={() => handleDelete(partido.codigo)} />
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary">Fecha: {formatDate(partido.fecha ?? null)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Estadio: {partido.estadio?.codigo || '-'}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Lugar: {partido.lugar}</ThemedText>
            </Card>
          </FadeInView>
        ))}
      </View>

      {!loading && partidos.length === 0 ? (
        <Card>
          <ThemedText type="small">No hay partidos registrados.</ThemedText>
        </Card>
      ) : null}
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
  estadiosWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
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