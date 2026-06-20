import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  createLocalidadByEstadio,
  deleteLocalidadByEstadio,
  Estadio,
  getEstadios,
  getLocalidadesByEstadio,
  LocalidadEstadio,
  updateLocalidadByEstadio,
} from '@/lib/federacion-api';

const emptyForm: LocalidadEstadio = {
  codigoLocalidad: '',
  disponibilidad: 0,
  precio: 0,
};

export default function LocalidadesEstadioScreen() {
  const [estadios, setEstadios] = useState<Estadio[]>([]);
  const [codigoEstadio, setCodigoEstadio] = useState('');
  const [localidades, setLocalidades] = useState<LocalidadEstadio[]>([]);
  const [form, setForm] = useState<LocalidadEstadio>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEstadio = useMemo(
    () => estadios.find((e) => e.codigo === codigoEstadio),
    [estadios, codigoEstadio]
  );

  const loadEstadios = async () => {
    try {
      const data = await getEstadios();
      setEstadios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar estadios');
    }
  };

  const loadLocalidades = async (codigo = codigoEstadio) => {
    if (!codigo) {
      setError('Selecciona un estadio');
      return;
    }
    setError(null);
    try {
      const data = await getLocalidadesByEstadio(codigo);
      setLocalidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar localidades');
    }
  };

  useEffect(() => {
    loadEstadios();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item: LocalidadEstadio) => {
    setForm(item);
    setEditingId(item.id ?? null);
  };

  const handleSave = async () => {
    if (!codigoEstadio.trim()) {
      setError('Selecciona un estadio');
      return;
    }
    if (!form.codigoLocalidad.trim() || form.disponibilidad < 0 || form.precio <= 0) {
      setError('Completa código, disponibilidad y precio válidos');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        codigoLocalidad: form.codigoLocalidad.trim(),
        disponibilidad: Number(form.disponibilidad),
        precio: Number(form.precio),
      };
      if (editingId) {
        await updateLocalidadByEstadio(codigoEstadio, editingId, payload);
      } else {
        await createLocalidadByEstadio(codigoEstadio, payload);
      }
      resetForm();
      await loadLocalidades(codigoEstadio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la localidad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idLocalidad?: number) => {
    if (!idLocalidad) {
      setError('La localidad no tiene ID válido');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteLocalidadByEstadio(codigoEstadio, idLocalidad);
      await loadLocalidades(codigoEstadio);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la localidad');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      title="Localidades por estadio"
      subtitle="CRUD de localidades base del estadio, reutilizadas por los partidos que se juegan ahí."
      actions={<ActionButton label="Refrescar" onPress={() => loadLocalidades()} />}>
      <Card style={styles.formCard}>
        <FieldLabel>Estadio</FieldLabel>
        <TextField
          value={codigoEstadio}
          onChangeText={setCodigoEstadio}
          placeholder="Código de estadio"
        />
        <View style={styles.estadiosWrap}>
          {estadios.map((estadio) => (
            <ActionButton
              key={estadio.codigo}
              label={`${estadio.codigo} ${estadio.nombre}`}
              variant={codigoEstadio === estadio.codigo ? 'primary' : 'outline'}
              onPress={() => {
                setCodigoEstadio(estadio.codigo);
                loadLocalidades(estadio.codigo);
              }}
            />
          ))}
        </View>
        {selectedEstadio ? (
          <ThemedText type="small" themeColor="textSecondary">
            Seleccionado: {selectedEstadio.nombre} ({selectedEstadio.ciudad})
          </ThemedText>
        ) : null}
      </Card>

      <Card style={styles.formCard}>
        <FieldLabel>{editingId ? 'Editar localidad' : 'Nueva localidad'}</FieldLabel>
        <TextField
          value={form.codigoLocalidad}
          onChangeText={(value) => setForm((prev) => ({ ...prev, codigoLocalidad: value }))}
          placeholder="Código localidad"
        />
        <TextField
          value={String(form.disponibilidad || '')}
          onChangeText={(value) => setForm((prev) => ({ ...prev, disponibilidad: Number(value) || 0 }))}
          placeholder="Disponibilidad"
          keyboardType="numeric"
        />
        <TextField
          value={String(form.precio || '')}
          onChangeText={(value) => setForm((prev) => ({ ...prev, precio: Number(value) || 0 }))}
          placeholder="Precio"
          keyboardType="numeric"
        />
        <View style={styles.actionsRow}>
          <ActionButton label={editingId ? 'Actualizar' : 'Crear'} onPress={handleSave} disabled={saving} />
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
        {localidades.map((item, index) => (
          <FadeInView key={item.id ?? `${item.codigoLocalidad}-${index}`} delay={index * 30}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <ThemedText type="smallBold">{item.codigoLocalidad}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">ID: {item.id ?? '-'}</ThemedText>
                </View>
                <View style={styles.cardButtons}>
                  <ActionButton label="Editar" variant="outline" onPress={() => startEdit(item)} />
                  <ActionButton label="Eliminar" variant="ghost" onPress={() => handleDelete(item.id)} />
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary">Disponibilidad: {item.disponibilidad}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Precio: {item.precio}</ThemedText>
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
  estadiosWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
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