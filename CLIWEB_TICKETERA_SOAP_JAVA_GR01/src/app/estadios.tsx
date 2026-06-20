import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  createEstadio,
  deleteEstadio,
  getEstadios,
  Estadio,
  updateEstadio,
} from '@/lib/federacion-api';

const emptyForm: Estadio = {
  codigo: '',
  nombre: '',
  ciudad: '',
  capacidad: 0,
};

export default function EstadiosScreen() {
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [form, setForm] = useState<Estadio>(emptyForm);
  const [editingCodigo, setEditingCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEstadios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstadios();
      setEstadios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar estadios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstadios();
  }, []);

  const startEdit = (estadio: Estadio) => {
    setEditingCodigo(estadio.codigo);
    setForm(estadio);
    setError(null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCodigo(null);
  };

  const handleSave = async () => {
    if (!form.codigo.trim() || !form.nombre.trim() || !form.ciudad.trim() || Number(form.capacidad) <= 0) {
      setError('Completa código, nombre, ciudad y capacidad');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        capacidad: Number(form.capacidad),
      };
      if (editingCodigo) {
        await updateEstadio(editingCodigo, payload);
      } else {
        await createEstadio(payload);
      }
      resetForm();
      await loadEstadios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el estadio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (codigo: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteEstadio(codigo);
      if (editingCodigo === codigo) {
        resetForm();
      }
      await loadEstadios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el estadio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      title="Estadios"
      subtitle="Administra los estadios disponibles para programar partidos."
      actions={<ActionButton label="Refrescar" onPress={loadEstadios} />}>
      <Card style={styles.formCard}>
        <FieldLabel>{editingCodigo ? 'Editar estadio' : 'Nuevo estadio'}</FieldLabel>
        <TextField
          value={form.codigo}
          onChangeText={(value) => setForm((prev) => ({ ...prev, codigo: value }))}
          placeholder="Código"
          editable={!editingCodigo}
        />
        <TextField
          value={form.nombre}
          onChangeText={(value) => setForm((prev) => ({ ...prev, nombre: value }))}
          placeholder="Nombre"
        />
        <TextField
          value={form.ciudad}
          onChangeText={(value) => setForm((prev) => ({ ...prev, ciudad: value }))}
          placeholder="Ciudad"
        />
        <TextField
          value={String(form.capacidad || '')}
          onChangeText={(value) => setForm((prev) => ({ ...prev, capacidad: Number(value) || 0 }))}
          placeholder="Capacidad"
          keyboardType="numeric"
        />
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
        {estadios.map((estadio, index) => (
          <FadeInView key={estadio.codigo} delay={index * 40}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <ThemedText type="smallBold">{estadio.nombre}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{estadio.codigo}</ThemedText>
                </View>
                <View style={styles.cardButtons}>
                  <ActionButton label="Editar" variant="outline" onPress={() => startEdit(estadio)} />
                  <ActionButton label="Eliminar" variant="ghost" onPress={() => handleDelete(estadio.codigo)} />
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary">Ciudad: {estadio.ciudad}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Capacidad: {estadio.capacidad}</ThemedText>
            </Card>
          </FadeInView>
        ))}
      </View>

      {!loading && estadios.length === 0 ? (
        <Card>
          <ThemedText type="small">No hay estadios registrados.</ThemedText>
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