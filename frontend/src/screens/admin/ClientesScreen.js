// Pantalla de gestión de clientes
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  IconButton,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../config/api';

const { width, height } = Dimensions.get('window');

const ClientesScreen = ({ navigation }) => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [fotoModalVisible, setFotoModalVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

  useFocusEffect(
    useCallback(() => {
      cargarClientes();
    }, [])
  );

  useEffect(() => {
    filtrarClientes();
  }, [busqueda, clientes]);

  const cargarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data.clientes);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const filtrarClientes = () => {
    if (!busqueda) {
      setClientesFiltrados(clientes);
      return;
    }

    const filtrados = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente.cedula.includes(busqueda)
    );
    setClientesFiltrados(filtrados);
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarClientes();
  };

  const eliminarCliente = (id, nombre) => {
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
              await api.delete(`/clientes/${id}`);
              Alert.alert('Éxito', 'Cliente eliminado correctamente');
              cargarClientes();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el cliente');
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

  const renderCliente = ({ item }) => (
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
              {item.nombre} {item.apellido}
            </Title>
            <View style={{ marginTop: 8, gap: 4 }}>
              <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
                📋 DNI: {item.cedula}
              </Paragraph>
              {item.telefono && (
                <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
                  📞 Tel: {item.telefono}
                </Paragraph>
              )}
              {item.direccion && (
                <Paragraph numberOfLines={2} style={{ fontSize: 14, color: '#6c757d' }}>
                  📍 {item.direccion}
                </Paragraph>
              )}
            </View>
          </View>
          <View style={styles.botonesAccion}>
            <IconButton
              icon="pencil"
              iconColor="#1976d2"
              size={24}
              onPress={() => navigation.navigate('EditarCliente', { id: item.id })}
            />
            <IconButton
              icon="delete"
              iconColor="#d32f2f"
              size={24}
              onPress={() =>
                eliminarCliente(item.id, `${item.nombre} ${item.apellido}`)
              }
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
      <Searchbar
        placeholder="Buscar por nombre o DNI"
        onChangeText={setBusqueda}
        value={busqueda}
        style={styles.searchbar}
      />
      <FlatList
        data={clientesFiltrados}
        renderItem={renderCliente}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centrado}>
            <Paragraph>No hay clientes registrados</Paragraph>
          </View>
        }
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CrearCliente')}
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
  searchbar: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
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

export default ClientesScreen;
