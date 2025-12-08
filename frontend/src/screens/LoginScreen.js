// Pantalla de inicio de sesión
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { TextInput, Button, Title, Text, Card, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [nombreSistema, setNombreSistema] = useState('Sistema de Préstamos');
  const [logoSistema, setLogoSistema] = useState('');
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const { login } = useContext(AuthContext);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      // Primero intentar cargar desde AsyncStorage (más rápido)
      const nombreLocal = await AsyncStorage.getItem('nombreSistema');
      const logoLocal = await AsyncStorage.getItem('logoSistema');
      if (nombreLocal) setNombreSistema(nombreLocal);
      if (logoLocal) setLogoSistema(logoLocal);

      // Luego intentar actualizar desde la API (sin autenticación)
      try {
        const [responseNombre, responseLogo] = await Promise.all([
          api.get('/configuracion/nombre_sistema'),
          api.get('/configuracion/logo_sistema')
        ]);

        if (responseNombre.data.configuracion) {
          const nuevoNombre = responseNombre.data.configuracion.valor;
          setNombreSistema(nuevoNombre);
          await AsyncStorage.setItem('nombreSistema', nuevoNombre);
        }

        if (responseLogo.data.configuracion && responseLogo.data.configuracion.valor) {
          const nuevoLogo = responseLogo.data.configuracion.valor;
          setLogoSistema(nuevoLogo);
          await AsyncStorage.setItem('logoSistema', nuevoLogo);
        }
      } catch (apiError) {
        // Si falla la API, usar el valor de AsyncStorage o el por defecto
        console.log('No se pudo cargar desde API, usando valor local');
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setCargandoConfig(false);
    }
  };

  const manejarLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setCargando(true);
    const resultado = await login(email, password);
    setCargando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.mensaje);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.logoContainer}>
              {cargandoConfig ? (
                <ActivityIndicator size="large" color="#6200ee" />
              ) : logoSistema ? (
                <Image source={{ uri: logoSistema }} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoIcon}>💰</Text>
              )}
            </View>
            {cargandoConfig ? (
              <View style={styles.nombreCargando}>
                <ActivityIndicator size="small" color="#6200ee" />
              </View>
            ) : (
              <Title style={styles.titulo}>{nombreSistema}</Title>
            )}
            <Text style={styles.subtitulo}>Iniciar Sesión</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={manejarLogin}
              loading={cargando}
              disabled={cargando}
              style={styles.boton}
            >
              Iniciar Sesión
            </Button>

            {/* <View style={styles.infoContainer}>
              <Text style={styles.infoTitulo}>Usuarios de prueba:</Text>
              <Text style={styles.infoTexto}>Admin: admin@test.com / admin123</Text>
              <Text style={styles.infoTexto}>Cobrador: cobrador@test.com / cobrador123</Text>
            </View> */}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200ee',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    height: 100,
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  logoIcon: {
    fontSize: 64,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#6200ee',
    lineHeight: 34,
  },
  nombreCargando: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6c757d',
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  boton: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  infoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  infoTitulo: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976d2',
    fontSize: 14,
  },
  infoTexto: {
    fontSize: 13,
    color: '#495057',
    marginTop: 4,
  },
});

export default LoginScreen;
