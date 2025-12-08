// Pantalla de gestión de usuarios
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  ActivityIndicator,
  Chip,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../config/api';

const { width, height } = Dimensions.get('window');

const UsuariosScreen = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [fotoModalVisible, setFotoModalVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data.usuarios);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarUsuarios();
  };

  const eliminarUsuario = (id, nombre) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro de eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/usuarios/${id}`);
              Alert.alert('Éxito', 'Usuario eliminado correctamente');
              cargarUsuarios();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  const abrirFotoModal = (fotoUrl) => {
    if (fotoUrl) {
      setFotoSeleccionada(fotoUrl);
      setFotoModalVisible(true);
    }
  };

  const renderUsuario = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={{ paddingVertical: 16 }}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => abrirFotoModal(item.foto_url)}
            activeOpacity={0.7}
          >
            {item.foto_url ? (
              <Image
                source={{ uri: item.foto_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={40} color="#6200ee" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.cardInfo}>
            <Title style={{ fontSize: 18, fontWeight: '600', color: '#212529' }}>
              {item.nombre}
            </Title>
            <Paragraph style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>
              📧 {item.email}
            </Paragraph>
            <Chip
              mode="flat"
              style={[
                styles.chip,
                item.rol === 'admin' ? styles.chipAdmin : styles.chipCobrador,
              ]}
              textStyle={{ fontWeight: '600', fontSize: 12 }}
            >
              {item.rol === 'admin' ? '👑 Administrador' : '💼 Cobrador'}
            </Chip>
          </View>
          <View style={styles.botonesAccion}>
            <IconButton
              icon="pencil"
              iconColor="#1976d2"
              size={24}
              onPress={() => navigation.navigate('EditarUsuario', { id: item.id })}
            />
            <IconButton
              icon="delete"
              iconColor="#d32f2f"
              size={24}
              onPress={() => eliminarUsuario(item.id, item.nombre)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centrado}>
            <Paragraph>No hay usuarios registrados</Paragraph>
          </View>
        }
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CrearUsuario')}
      />

      <Modal
        visible={fotoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFotoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setFotoModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <IconButton
              icon="close"
              iconColor="#ffffff"
              size={30}
              style={styles.modalCloseButton}
              onPress={() => setFotoModalVisible(false)}
            />
            {fotoSeleccionada && (
              <Image
                source={{ uri: fotoSeleccionada }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
    padding: 20,
  },
  card: {
    margin: 12,
    marginHorizontal: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarContainer: {
    marginRight: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  botonesAccion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  chipAdmin: {
    backgroundColor: '#e3f2fd',
  },
  chipCobrador: {
    backgroundColor: '#f3e5f5',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
    borderRadius: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.8,
  },
});

export default UsuariosScreen;
