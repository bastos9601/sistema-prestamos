// Pantalla de configuración del sistema
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Divider,
  Text,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';

const ConfiguracionScreen = () => {
  const [nombreSistema, setNombreSistema] = useState('');
  const [logoSistema, setLogoSistema] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      // Cargar nombre del sistema
      const responseNombre = await api.get('/configuracion/nombre_sistema');
      if (responseNombre.data.configuracion) {
        setNombreSistema(responseNombre.data.configuracion.valor);
      }

      // Cargar logo del sistema
      const responseLogo = await api.get('/configuracion/logo_sistema');
      if (responseLogo.data.configuracion) {
        setLogoSistema(responseLogo.data.configuracion.valor);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      // Si hay error, intentar cargar desde AsyncStorage como fallback
      try {
        const nombre = await AsyncStorage.getItem('nombreSistema');
        const logo = await AsyncStorage.getItem('logoSistema');
        if (nombre) setNombreSistema(nombre);
        else setNombreSistema('Sistema de Préstamos');
        if (logo) setLogoSistema(logo);
      } catch (storageError) {
        setNombreSistema('Sistema de Préstamos');
      }
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracion = async () => {
    if (!nombreSistema.trim()) {
      Alert.alert('Error', 'El nombre del sistema no puede estar vacío');
      return;
    }

    setGuardando(true);
    try {
      // Guardar en la base de datos
      await api.put('/configuracion/nombre_sistema', {
        valor: nombreSistema.trim()
      });

      // También guardar en AsyncStorage para acceso rápido
      await AsyncStorage.setItem('nombreSistema', nombreSistema.trim());

      Alert.alert(
        '✅ Éxito',
        'La configuración se guardó correctamente.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const seleccionarLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a las fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        subirLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const subirLogo = async (uri) => {
    setSubiendoLogo(true);
    try {
      // Leer la imagen como base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Subir imagen a Cloudinary
      const uploadResponse = await api.post('/upload/imagen', {
        imagen: base64,
        carpeta: 'prestamos/logos'
      });

      const logoUrl = uploadResponse.data.url;

      // Guardar URL en la base de datos
      await api.put('/configuracion/logo_sistema', {
        valor: logoUrl
      });

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('logoSistema', logoUrl);

      setLogoSistema(logoUrl);
      Alert.alert('✅ Éxito', 'Logo actualizado correctamente');
    } catch (error) {
      console.error('Error al subir logo:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo subir el logo');
    } finally {
      setSubiendoLogo(false);
    }
  };

  const eliminarLogo = () => {
    Alert.alert(
      'Eliminar Logo',
      '¿Está seguro de eliminar el logo del sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put('/configuracion/logo_sistema', { valor: '' });
              await AsyncStorage.setItem('logoSistema', '');
              setLogoSistema('');
              Alert.alert('✅ Éxito', 'Logo eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el logo');
            }
          },
        },
      ]
    );
  };

  const restaurarDefecto = () => {
    Alert.alert(
      'Restaurar Configuración',
      '¿Está seguro de restaurar el nombre por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            setNombreSistema('Sistema de Préstamos');
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.titulo}>⚙️ Configuración del Sistema</Title>
          <Divider style={{ marginVertical: 16 }} />

          <Paragraph style={styles.descripcion}>
            Personalice el nombre y logo de su sistema de préstamos.
          </Paragraph>

          <Text style={styles.seccionTitulo}>Logo del Sistema</Text>
          <View style={styles.logoContainer}>
            {logoSistema ? (
              <TouchableOpacity onPress={seleccionarLogo} style={styles.logoPreview}>
                <Image source={{ uri: logoSistema }} style={styles.logoImage} />
                <View style={styles.logoOverlay}>
                  <Text style={styles.logoOverlayText}>Cambiar</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={seleccionarLogo} style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderIcon}>📷</Text>
                <Text style={styles.logoPlaceholderText}>Subir Logo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.logoBotones}>
            <Button
              mode="outlined"
              onPress={seleccionarLogo}
              loading={subiendoLogo}
              disabled={subiendoLogo || guardando}
              style={styles.botonLogo}
              icon="image"
            >
              {logoSistema ? 'Cambiar Logo' : 'Subir Logo'}
            </Button>
            {logoSistema && (
              <Button
                mode="text"
                onPress={eliminarLogo}
                disabled={subiendoLogo || guardando}
                style={styles.botonLogo}
                icon="delete"
                textColor="#d32f2f"
              >
                Eliminar
              </Button>
            )}
          </View>

          <Divider style={{ marginVertical: 20 }} />

          <Text style={styles.seccionTitulo}>Nombre del Sistema</Text>
          <TextInput
            label="Nombre del Sistema *"
            value={nombreSistema}
            onChangeText={setNombreSistema}
            mode="outlined"
            style={styles.input}
            placeholder="Ej: Mi Empresa de Préstamos"
            maxLength={50}
          />

          <Paragraph style={styles.contador}>
            {nombreSistema.length}/50 caracteres
          </Paragraph>

          <Button
            mode="contained"
            onPress={guardarConfiguracion}
            loading={guardando}
            disabled={guardando}
            style={styles.botonGuardar}
            icon="content-save"
          >
            Guardar Cambios
          </Button>

          <Button
            mode="outlined"
            onPress={restaurarDefecto}
            disabled={guardando}
            style={styles.botonRestaurar}
            icon="restore"
          >
            Restaurar Nombre por Defecto
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.infoTitulo}>ℹ️ Información</Title>
          <Paragraph style={styles.infoTexto}>
            • El nombre del sistema se mostrará en los pagarés
          </Paragraph>
          <Paragraph style={styles.infoTexto}>
            • Los cambios se guardan en la base de datos
          </Paragraph>
          <Paragraph style={styles.infoTexto}>
            • Se aplican inmediatamente en nuevos pagarés
          </Paragraph>
          <Paragraph style={styles.infoTexto}>
            • Puede usar hasta 50 caracteres
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  card: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  contador: {
    fontSize: 12,
    color: '#9e9e9e',
    textAlign: 'right',
    marginBottom: 20,
  },
  botonGuardar: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonRestaurar: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  infoTexto: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoPreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(98, 0, 238, 0.8)',
    padding: 8,
    alignItems: 'center',
  },
  logoOverlayText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  logoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoPlaceholderText: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  logoBotones: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  botonLogo: {
    flex: 1,
  },
});

export default ConfiguracionScreen;
