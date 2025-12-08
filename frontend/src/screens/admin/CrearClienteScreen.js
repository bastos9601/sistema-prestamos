// Pantalla para crear clientes
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';

const CrearClienteScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const tomarFoto = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Necesitamos permiso para acceder a la cámara');
        return;
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setFoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const seleccionarFoto = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Necesitamos permiso para acceder a la galería');
        return;
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setFoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };

  const subirFoto = async () => {
    if (!foto) return null;

    setSubiendoFoto(true);
    try {
      const base64Image = `data:image/jpeg;base64,${foto.base64}`;
      const response = await api.post('/upload/imagen', {
        imagen: base64Image,
        carpeta: 'prestamos/clientes',
      });
      return response.data.url;
    } catch (error) {
      console.error('Error al subir foto:', error);
      Alert.alert('Error', 'No se pudo subir la foto');
      return null;
    } finally {
      setSubiendoFoto(false);
    }
  };

  const crearCliente = async () => {
    if (!nombre || !apellido || !cedula) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    setCargando(true);
    try {
      // Subir foto si existe
      let fotoUrl = null;
      if (foto) {
        fotoUrl = await subirFoto();
      }

      await api.post('/clientes', {
        nombre,
        apellido,
        cedula,
        telefono,
        direccion,
        email,
        foto_url: fotoUrl,
      });

      Alert.alert('✅ Éxito', 'Cliente creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo crear el cliente'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.fotoContainer}>
            <Text style={styles.fotoTitulo}>📸 Foto del Cliente</Text>
            {foto ? (
              <View style={styles.fotoPreview}>
                <Image source={{ uri: foto.uri }} style={styles.fotoImagen} />
                <IconButton
                  icon="close-circle"
                  iconColor="#d32f2f"
                  size={30}
                  style={styles.fotoEliminar}
                  onPress={() => setFoto(null)}
                />
              </View>
            ) : (
              <View style={styles.fotoBotones}>
                <Button
                  mode="contained"
                  onPress={tomarFoto}
                  icon="camera"
                  style={styles.fotoBoton}
                >
                  Tomar Foto
                </Button>
                <Button
                  mode="outlined"
                  onPress={seleccionarFoto}
                  icon="image"
                  style={styles.fotoBoton}
                >
                  Galería
                </Button>
              </View>
            )}
          </View>

          <TextInput
            label="Nombre *"
            value={nombre}
            onChangeText={setNombre}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Apellido *"
            value={apellido}
            onChangeText={setApellido}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="DNI *"
            value={cedula}
            onChangeText={setCedula}
            mode="outlined"
            placeholder="001-1234567-8"
            style={styles.input}
          />

          <TextInput
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            mode="outlined"
            keyboardType="phone-pad"
            placeholder="809-555-0000"
            style={styles.input}
          />

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
            label="Dirección"
            value={direccion}
            onChangeText={setDireccion}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={crearCliente}
            loading={cargando}
            disabled={cargando}
            style={styles.boton}
          >
            Crear Cliente
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  fotoContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
  },
  fotoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  fotoPreview: {
    alignItems: 'center',
    position: 'relative',
  },
  fotoImagen: {
    width: 200,
    height: 250,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  fotoEliminar: {
    position: 'absolute',
    top: -10,
    right: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  fotoBotones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  fotoBoton: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  boton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default CrearClienteScreen;
