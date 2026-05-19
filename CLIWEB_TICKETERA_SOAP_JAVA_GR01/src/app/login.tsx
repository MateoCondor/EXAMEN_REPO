import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import { Card, FieldLabel, TextField, ActionButton } from '@/components/ticketera-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    // Simulamos un pequeño delay para dar feedback visual
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!username || !password) {
      setError('Usuario y contraseña son requeridos');
      setLoading(false);
      return;
    }

    if (login(username, password)) {
      // Navega a la pantalla principal
      router.replace('/');
    } else {
      setError('Usuario o contraseña incorrectos');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">TicketPremium</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Sistema de venta de entradas con SOAP y Java
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          <ThemedText type="smallBold" style={styles.loginTitle}>
            Ingresa tus credenciales
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

          <View style={styles.credentialsHint}>
            <ThemedText type="small" themeColor="textSecondary">
              Credenciales de prueba:
            </ThemedText>
            <ThemedText type="small">Usuario: MONSTER</ThemedText>
            <ThemedText type="small">Contraseña: MONSTER9</ThemedText>
          </View>
        </Card>
      </View>

      {loading ? (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  content: {
    gap: Spacing.four,
    width: '100%',
    maxWidth: 400,
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
  credentialsHint: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 8,
    padding: Spacing.two,
    gap: Spacing.half,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
});
