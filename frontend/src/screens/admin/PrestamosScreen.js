// Pantalla de gestión de préstamos
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
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
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const PrestamosScreen = ({ navigation }) => {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarPrestamos();
    }, [])
  );

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

  const onRefresh = () => {
    setRefrescando(true);
    cargarPrestamos();
  };

  const eliminarPrestamo = (id, clienteNombre) => {
    Alert.alert(
      '⚠️ Confirmar Eliminación',
      `¿Está seguro de eliminar el préstamo de ${clienteNombre}?\n\nEsta acción no se puede deshacer y eliminará:\n• El préstamo\n• Todas las cuotas\n• Todos los pagos asociados`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/prestamos/${id}`);
              Alert.alert('✅ Éxito', 'Préstamo eliminado correctamente');
              cargarPrestamos();
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.error || 'No se pudo eliminar el préstamo'
              );
            }
          },
        },
      ]
    );
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activo':
        return '#1976d2';
      case 'pagado':
        return '#2e7d32';
      case 'vencido':
        return '#d32f2f';
      case 'cancelado':
        return '#757575';
      default:
        return '#666';
    }
  };

  const renderPrestamo = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={{ paddingVertical: 16 }}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            onPress={() => navigation.navigate('DetallePrestamo', { id: item.id })}
            activeOpacity={0.7}
            style={{ flex: 1 }}
          >
            <Title style={{ fontSize: 18, fontWeight: '600' }}>
              {item.cliente_nombre} {item.cliente_apellido}
            </Title>
          </TouchableOpacity>
          <Chip
            mode="flat"
            style={{ 
              backgroundColor: obtenerColorEstado(item.estado),
              borderRadius: 8,
              marginRight: 8,
            }}
            textStyle={{ color: 'white', fontWeight: '600', fontSize: 11 }}
          >
            {item.estado.toUpperCase()}
          </Chip>
          <IconButton
            icon="delete"
            iconColor="#d32f2f"
            size={20}
            onPress={() =>
              eliminarPrestamo(
                item.id,
                `${item.cliente_nombre} ${item.cliente_apellido}`
              )
            }
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('DetallePrestamo', { id: item.id })}
          activeOpacity={0.7}
        >
          <View style={{ marginTop: 8, gap: 6 }}>
            <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
              📋 DNI: {item.cliente_cedula}
            </Paragraph>
            <Paragraph style={{ fontSize: 15, color: '#212529', fontWeight: '500' }}>
              💰 Monto: {formatearMoneda(item.monto_prestado)}
            </Paragraph>
            <Paragraph style={{ fontSize: 15, color: '#2e7d32', fontWeight: '600' }}>
              💵 Total: {formatearMoneda(item.monto_total)}
            </Paragraph>
            <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
              📅 Cuotas: {item.numero_cuotas} ({item.frecuencia_pago})
            </Paragraph>
            {item.cobrador_nombre && (
              <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
                👤 Cobrador: {item.cobrador_nombre}
              </Paragraph>
            )}
          </View>
        </TouchableOpacity>
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
        data={prestamos}
        renderItem={renderPrestamo}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centrado}>
            <Paragraph>No hay préstamos registrados</Paragraph>
          </View>
        }
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CrearPrestamo')}
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
  card: {
    margin: 12,
    marginHorizontal: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
    borderRadius: 16,
  },
});

export default PrestamosScreen;
