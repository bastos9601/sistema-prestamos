// Pantalla de préstamos del cobrador
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  Searchbar,
  Button,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const MisPrestamosScreen = ({ navigation }) => {
  const [prestamos, setPrestamos] = useState([]);
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarPrestamos();
    }, [])
  );

  useEffect(() => {
    filtrarPrestamos();
  }, [busqueda, prestamos]);

  const cargarPrestamos = async () => {
    try {
      const response = await api.get('/prestamos');
      setPrestamos(response.data.prestamos);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      Alert.alert('Error', 'No se pudieron cargar los préstamos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const filtrarPrestamos = () => {
    if (!busqueda) {
      setPrestamosFiltrados(prestamos);
      return;
    }

    const filtrados = prestamos.filter(
      (prestamo) =>
        prestamo.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prestamo.cliente_apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        prestamo.cliente_cedula.includes(busqueda)
    );
    setPrestamosFiltrados(filtrados);
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarPrestamos();
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE');
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activo':
        return '#4caf50';
      case 'pagado':
        return '#2196f3';
      case 'vencido':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const renderPrestamo = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('DetallePrestamo', { id: item.id })}
      >
        <Card.Content style={{ paddingVertical: 16 }}>
          <View style={styles.cardHeader}>
            {item.cliente_foto_url ? (
              <Image
                source={{ uri: item.cliente_foto_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={40} color="#6200ee" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Title style={{ fontSize: 18, fontWeight: '600', color: '#212529' }}>
                {item.cliente_nombre} {item.cliente_apellido}
              </Title>
              <Paragraph style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>
                📋 DNI: {item.cliente_cedula}
              </Paragraph>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: obtenerColorEstado(item.estado),
                    borderRadius: 6,
                  }}
                  textStyle={{ color: 'white', fontSize: 11, fontWeight: '600' }}
                >
                  {item.estado.toUpperCase()}
                </Chip>
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: 6,
                  }}
                  textStyle={{ color: '#1976d2', fontSize: 11, fontWeight: '600' }}
                >
                  {item.numero_cuotas} CUOTAS
                </Chip>
              </View>
            </View>
          </View>
          <View style={styles.montoContainer}>
            <View style={styles.montoItem}>
              <Paragraph style={styles.montoLabel}>Prestado:</Paragraph>
              <Paragraph style={styles.montoPrestado}>
                {formatearMoneda(item.monto_prestado)}
              </Paragraph>
            </View>
            <View style={styles.montoItem}>
              <Paragraph style={styles.montoLabel}>Total:</Paragraph>
              <Paragraph style={styles.montoTotal}>
                {formatearMoneda(item.monto_total)}
              </Paragraph>
            </View>
          </View>
          <View style={styles.fechaContainer}>
            <Paragraph style={styles.fechaTexto}>
              📅 Inicio: {formatearFecha(item.fecha_inicio)}
            </Paragraph>
            <Paragraph style={styles.fechaTexto}>
              📅 Fin: {formatearFecha(item.fecha_fin)}
            </Paragraph>
          </View>
        </Card.Content>
      </TouchableOpacity>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('DetalleCuotas', { clienteId: item.cliente_id })}
          icon={item.estado === 'completado' ? 'check-circle' : 'cash-multiple'}
          style={[
            styles.botonPago,
            item.estado === 'completado' && styles.botonPagado
          ]}
          labelStyle={{ fontSize: 13, fontWeight: '600' }}
          disabled={item.estado === 'completado'}
        >
          {item.estado === 'completado' ? 'Pagado' : 'Registrar Pago'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('DetallePrestamo', { id: item.id })}
          icon="eye"
          style={styles.botonDetalle}
          labelStyle={{ fontSize: 13 }}
        >
          Ver Detalle
        </Button>
      </Card.Actions>
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
        placeholder="Buscar por cliente o DNI"
        onChangeText={setBusqueda}
        value={busqueda}
        style={styles.searchbar}
      />
      <FlatList
        data={prestamosFiltrados}
        renderItem={renderPrestamo}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centrado}>
            <Paragraph>No hay préstamos asignados</Paragraph>
          </View>
        }
      />
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
    marginBottom: 12,
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
  montoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  montoItem: {
    flex: 1,
  },
  montoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  montoPrestado: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  montoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  fechaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fechaTexto: {
    fontSize: 12,
    color: '#6c757d',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  botonPago: {
    flex: 1,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
  },
  botonPagado: {
    backgroundColor: '#9e9e9e',
    opacity: 0.6,
  },
  botonDetalle: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#1976d2',
  },
});

export default MisPrestamosScreen;
