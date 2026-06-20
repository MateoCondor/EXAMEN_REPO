import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/components/fade-in';
import { ScreenShell } from '@/components/screen-shell';
import { ActionButton, Card, FieldLabel, TextField } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  createCliente,
  deleteCliente,
  getClientes,
  Cliente,
  updateCliente,
} from '@/lib/ticketera-api';

type ClienteForm = Cliente;

const emptyForm: ClienteForm = {
  cedula: '',
  nombre: '',
  apellido: '',
  telefono: '',
  correo: '',
};

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [editingCedula, setEditingCedula] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const startEdit = (cliente: Cliente) => {
    setEditingCedula(cliente.cedula);
    setForm(cliente);
    setError(null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCedula(null);
  };

  const handleSave = async () => {
    if (!form.cedula.trim() || !form.nombre.trim() || !form.apellido.trim()) {
      setError('Completa cédula, nombre y apellido');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        telefono: form.telefono?.trim() || undefined,
        correo: form.correo?.trim() || undefined,
      };
      if (editingCedula) {
        await updateCliente(editingCedula, payload);
      } else {
        await createCliente(payload);
      }
      resetForm();
      await loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cedula: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteCliente(cedula);
      if (editingCedula === cedula) {
        resetForm();
      }
      await loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenShell
      title="Clientes"
      subtitle="Administra el catálogo de clientes que luego usará la compra de boletos."
      actions={<ActionButton label="Refrescar" onPress={loadClientes} />}>
      <Card style={styles.formCard}>
        <FieldLabel>{editingCedula ? 'Editar cliente' : 'Nuevo cliente'}</FieldLabel>
        <TextField
          value={form.cedula}
          onChangeText={(value) => setForm((prev) => ({ ...prev, cedula: value }))}
          placeholder="Cédula"
          editable={!editingCedula}
        />
        <TextField
          value={form.nombre}
          onChangeText={(value) => setForm((prev) => ({ ...prev, nombre: value }))}
          placeholder="Nombre"
        />
        <TextField
          value={form.apellido}
          onChangeText={(value) => setForm((prev) => ({ ...prev, apellido: value }))}
          placeholder="Apellido"
        />
        <TextField
          value={form.telefono ?? ''}
          onChangeText={(value) => setForm((prev) => ({ ...prev, telefono: value }))}
          placeholder="Teléfono"
        />
        <TextField
          value={form.correo ?? ''}
          onChangeText={(value) => setForm((prev) => ({ ...prev, correo: value }))}
          placeholder="Correo"
        />
        <View style={styles.actionsRow}>
          <ActionButton
            label={saving ? 'Guardando...' : editingCedula ? 'Actualizar' : 'Crear'}
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
        {clientes.map((cliente, index) => (
          <FadeInView key={cliente.cedula} delay={index * 40}>
            <Card>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <ThemedText type="smallBold">{cliente.nombre} {cliente.apellido}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{cliente.cedula}</ThemedText>
                </View>
                <View style={styles.cardButtons}>
                  <ActionButton label="Editar" variant="outline" onPress={() => startEdit(cliente)} />
                  <ActionButton label="Eliminar" variant="ghost" onPress={() => handleDelete(cliente.cedula)} />
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Teléfono: {cliente.telefono || '-'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Correo: {cliente.correo || '-'}
              </ThemedText>
            </Card>
          </FadeInView>
        ))}
      </View>

      {!loading && clientes.length === 0 ? (
        <Card>
          <ThemedText type="small">No hay clientes registrados.</ThemedText>
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