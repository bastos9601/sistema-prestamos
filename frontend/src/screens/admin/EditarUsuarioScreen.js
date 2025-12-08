// Pantalla para editar usuarios
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  Menu,
  Divider,
  Text,
  IconButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';

const EditarUsuarioScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cobrador');
  const [fotoUrl, setFotoUrl] = useState('');
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [menuRolVisible, setMenuRolVisible] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      const usuario = response.data.usuario;
      setNombre(usuario.nombre);
      setEmail(usuario.email);
      setRol(usuario.rol);
      setFotoUrl(usuario.foto_url || '');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el usuario');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Necesitamos permiso para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setNuevaFoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const seleccionarFoto = async () => {
    try {
      const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Necesitamos permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setNuevaFoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };

  const subirFoto = async () => {
    if (!nuevaFoto) return null;

    setSubiendoFoto(true);
    try {
      const base64Image = `data:image/jpeg;base64,${nuevaFoto.base64}`;
      const response = await api.post('/upload/imagen', {
        imagen: base64Image,
        carpeta: 'prestamos/usuarios',
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

  const actualizarUsuario = async () => {
    if (!nombre || !email) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    setGuardando(true);
    try {
      // Subir nueva foto si existe
      let nuevaFotoUrl = fotoUrl;
      if (nuevaFoto) {
        const urlSubida = await subirFoto();
        if (urlSubida) {
          nuevaFotoUrl = urlSubida;
        }
      }

      const datos = {
        nombre,
        email,
        rol,
        foto_url: nuevaFotoUrl,
      };

      // Solo incluir password si se ingresó uno nuevo
      if (password) {
        datos.password = password;
      }

      await api.put(`/usuarios/${id}`, datos);

      Alert.alert('✅ Éxito', 'Usuario actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo actualizar el usuario'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.fotoContainer}>
            <Text style={styles.fotoTitulo}>📸 Foto del Usuario</Text>
            {nuevaFoto || fotoUrl ? (
              <View style={styles.fotoPreview}>
                <Image
                  source={{ uri: nuevaFoto ? nuevaFoto.uri : fotoUrl }}
                  style={styles.fotoImagen}
                />
                <IconButton
                  icon="close-circle"
                  iconColor="#d32f2f"
                  size={30}
                  style={styles.fotoEliminar}
                  onPress={() => {
                    setNuevaFoto(null);
                    setFotoUrl('');
                  }}
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
            {(nuevaFoto || fotoUrl) && (
              <Button
                mode="text"
                onPress={() => {
                  setNuevaFoto(null);
                  if (!fotoUrl) return;
                  // Mostrar opciones para cambiar
                  Alert.alert(
                    'Cambiar Foto',
                    '¿Qué deseas hacer?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Tomar Nueva', onPress: tomarFoto },
                      { text: 'Seleccionar de Galería', onPress: seleccionarFoto },
                    ]
                  );
                }}
                style={{ marginTop: 8 }}
              >
                Cambiar Foto
              </Button>
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
            label="Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Nueva Contraseña (opcional)"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            placeholder="Dejar vacío para mantener la actual"
          />

          <Menu
            visible={menuRolVisible}
            onDismiss={() => setMenuRolVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuRolVisible(true)}>
                <TextInput
                  label="Rol *"
                  value={rol === 'admin' ? 'Administrador' : 'Cobrador'}
                  mode="outlined"
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                  style={styles.input}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setRol('admin');
                setMenuRolVisible(false);
              }}
              title="Administrador"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setRol('cobrador');
                setMenuRolVisible(false);
              }}
              title="Cobrador"
            />
          </Menu>

          <Text style={styles.nota}>
            💡 Nota: Deja la contraseña vacía si no deseas cambiarla
          </Text>

          <Button
            mode="contained"
            onPress={actualizarUsuario}
            loading={guardando}
            disabled={guardando}
            style={styles.boton}
            icon="content-save"
          >
            Guardar Cambios
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={guardando}
            style={styles.botonCancelar}
          >
            Cancelar
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
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  nota: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  boton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonCancelar: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default EditarUsuarioScreen;
