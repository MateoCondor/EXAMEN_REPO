import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';

import { Card, FieldLabel, TextField, ActionButton } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCedula, setRegCedula] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCorreo, setRegCorreo] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!username || !password) {
      setError('Usuario y contraseña son requeridos');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      // Removed router.replace('/') because _layout.tsx handles the view switch conditionally.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!regUsername || !regPassword || !regCedula || !regNombre || !regApellido) {
      setError('Los campos obligatorios son: usuario, contraseña, cédula, nombre y apellido');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: regUsername.trim(),
        password: regPassword.trim(),
        cedula: regCedula.trim(),
        nombre: regNombre.trim(),
        apellido: regApellido.trim(),
        telefono: regTelefono.trim() || undefined,
        correo: regCorreo.trim() || undefined,
      });
      // Removed router.replace('/') because _layout.tsx handles the view switch conditionally.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">TicketPremium</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Sistema de venta de entradas con SOAP y Java
          </ThemedText>
        </View>

        {!isRegister ? (
          <Card style={styles.formCard}>
            <ThemedText type="smallBold" style={styles.loginTitle}>
              Iniciar Sesión
            </ThemedText>

            <FieldLabel>Usuario</FieldLabel>
            <TextField
              value={username}
              onChangeText={setUsername}
              placeholder="Usuario"
              editable={!loading}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <FieldLabel>Contraseña</FieldLabel>
            <TextField
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              secureTextEntry
              editable={!loading}
              autoCorrect={false}
            />

            {error ? (
              <Card style={styles.errorCard}>
                <ThemedText type="small" style={{ color: '#d32f2f' }}>
                  {error}
                </ThemedText>
              </Card>
            ) : null}

            <View style={styles.buttonContainer}>
              <ActionButton
                label={loading ? 'Verificando...' : 'Ingresar'}
                onPress={handleLogin}
                disabled={loading}
              />
            </View>

            <View style={styles.switchRow}>
              <ThemedText type="small" themeColor="textSecondary">
                ¿No tienes cuenta?
              </ThemedText>
              <ActionButton
                label="Registrarse"
                variant="ghost"
                onPress={() => { setIsRegister(true); setError(null); }}
              />
            </View>

            <View style={styles.credentialsHint}>
              <ThemedText type="small" themeColor="textSecondary">
                Admin: MONSTER / MONSTER9
              </ThemedText>
            </View>
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <ThemedText type="smallBold" style={styles.loginTitle}>
              Registro de Cliente
            </ThemedText>

            <FieldLabel>Usuario *</FieldLabel>
            <TextField
              value={regUsername}
              onChangeText={setRegUsername}
              placeholder="Nombre de usuario"
              editable={!loading}
              autoCorrect={false}
            />

            <FieldLabel>Contraseña *</FieldLabel>
            <TextField
              value={regPassword}
              onChangeText={setRegPassword}
              placeholder="Contraseña"
              secureTextEntry
              editable={!loading}
              autoCorrect={false}
            />

            <FieldLabel>Cédula *</FieldLabel>
            <TextField
              value={regCedula}
              onChangeText={setRegCedula}
              placeholder="Ej: 1234567890"
              editable={!loading}
              keyboardType="numeric"
            />

            <FieldLabel>Nombre *</FieldLabel>
            <TextField
              value={regNombre}
              onChangeText={setRegNombre}
              placeholder="Nombre"
              editable={!loading}
            />

            <FieldLabel>Apellido *</FieldLabel>
            <TextField
              value={regApellido}
              onChangeText={setRegApellido}
              placeholder="Apellido"
              editable={!loading}
            />

            <FieldLabel>Teléfono</FieldLabel>
            <TextField
              value={regTelefono}
              onChangeText={setRegTelefono}
              placeholder="Teléfono (opcional)"
              editable={!loading}
              keyboardType="phone-pad"
            />

            <FieldLabel>Correo</FieldLabel>
            <TextField
              value={regCorreo}
              onChangeText={setRegCorreo}
              placeholder="correo@ejemplo.com (opcional)"
              editable={!loading}
              keyboardType="email-address"
            />

            {error ? (
              <Card style={styles.errorCard}>
                <ThemedText type="small" style={{ color: '#d32f2f' }}>
                  {error}
                </ThemedText>
              </Card>
            ) : null}

            <View style={styles.buttonContainer}>
              <ActionButton
                label={loading ? 'Registrando...' : 'Registrarse'}
                onPress={handleRegister}
                disabled={loading}
              />
            </View>

            <View style={styles.switchRow}>
              <ThemedText type="small" themeColor="textSecondary">
                ¿Ya tienes cuenta?
              </ThemedText>
              <ActionButton
                label="Iniciar Sesión"
                variant="ghost"
                onPress={() => { setIsRegister(false); setError(null); }}
              />
            </View>
          </Card>
        )}
      </View>

      {loading ? (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  content: {
    gap: Spacing.four,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  formCard: {
    gap: Spacing.two,
  },
  loginTitle: {
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.3)',
  },
  buttonContainer: {
    marginTop: Spacing.one,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  credentialsHint: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    padding: Spacing.two,
    gap: Spacing.half,
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
});
