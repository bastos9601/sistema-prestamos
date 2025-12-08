// Pantalla de detalle de préstamo
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  DataTable,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const DetallePrestamoScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [prestamo, setPrestamo] = useState(null);
  const [cuotas, setCuotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarDetalle();
  }, []);

  const cargarDetalle = async () => {
    try {
      const response = await api.get(`/prestamos/${id}`);
      setPrestamo(response.data.prestamo);
      setCuotas(response.data.cuotas);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      Alert.alert('Error', 'No se pudo cargar el detalle del préstamo');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarDetalle();
  };



  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO');
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#ff9800';
      case 'pagada':
        return '#4caf50';
      case 'vencida':
        return '#f44336';
      case 'parcial':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!prestamo) {
    return (
      <View style={styles.centrado}>
        <Paragraph>No se encontró el préstamo</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content style={{ paddingVertical: 16 }}>
          <Title style={{ fontSize: 20, fontWeight: '600', color: '#6200ee', marginBottom: 12 }}>
            👤 Información del Cliente
          </Title>
          <View style={styles.clienteInfoContainer}>
            {prestamo.cliente_foto_url ? (
              <Image
                source={{ uri: prestamo.cliente_foto_url }}
                style={styles.fotoCliente}
              />
            ) : (
              <View style={styles.fotoPlaceholder}>
                <Icon name="account" size={50} color="#6200ee" />
              </View>
            )}
            <View style={{ flex: 1, gap: 8 }}>
              <Paragraph style={{ fontSize: 16, color: '#212529', fontWeight: '500' }}>
                {prestamo.cliente_nombre} {prestamo.cliente_apellido}
              </Paragraph>
              <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
                📋 DNI: {prestamo.cliente_cedula}
              </Paragraph>
              {prestamo.cliente_telefono && (
                <Paragraph style={{ fontSize: 14, color: '#6c757d' }}>
                  📞 Teléfono: {prestamo.cliente_telefono}
                </Paragraph>
              )}
            </View>
          </View>
          {prestamo.firma_cliente && (
            <TouchableOpacity
              onPress={() => navigation.navigate('VerPagare', { id: prestamo.id })}
              activeOpacity={0.7}
            >
              <View style={{ marginTop: 16, padding: 16, backgroundColor: '#e3f2fd', borderRadius: 12, borderWidth: 2, borderColor: '#1976d2' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Paragraph style={{ fontSize: 14, color: '#1976d2', fontWeight: '600', marginBottom: 4 }}>
                      ✅ Pagaré Firmado Digitalmente
                    </Paragraph>
                    <Paragraph style={{ fontSize: 12, color: '#6c757d' }}>
                      Toca para ver el pagaré completo
                    </Paragraph>
                  </View>
                  <Icon name="chevron-right" size={24} color="#1976d2" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={{ paddingVertical: 16 }}>
          <Title style={{ fontSize: 20, fontWeight: '600', color: '#6200ee', marginBottom: 16 }}>
            💰 Detalles del Préstamo
          </Title>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Monto prestado:</Paragraph>
            <Paragraph style={styles.valorMoneda}>
              {formatearMoneda(prestamo.monto_prestado)}
            </Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Tasa de interés:</Paragraph>
            <Paragraph style={styles.valor}>{prestamo.tasa_interes}%</Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Monto total:</Paragraph>
            <Paragraph style={[styles.valorMoneda, { fontSize: 18, fontWeight: 'bold' }]}>
              {formatearMoneda(prestamo.monto_total)}
            </Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Número de cuotas:</Paragraph>
            <Paragraph style={styles.valor}>{prestamo.numero_cuotas}</Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Monto por cuota:</Paragraph>
            <Paragraph style={styles.valorMoneda}>
              {formatearMoneda(prestamo.monto_cuota)}
            </Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Frecuencia:</Paragraph>
            <Paragraph style={styles.valor}>{prestamo.frecuencia_pago}</Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Fecha inicio:</Paragraph>
            <Paragraph style={styles.valor}>{formatearFecha(prestamo.fecha_inicio)}</Paragraph>
          </View>
          <View style={styles.detalle}>
            <Paragraph style={styles.label}>Fecha fin:</Paragraph>
            <Paragraph style={styles.valor}>{formatearFecha(prestamo.fecha_fin)}</Paragraph>
          </View>
          {prestamo.cobrador_nombre && (
            <View style={styles.detalle}>
              <Paragraph style={styles.label}>Cobrador:</Paragraph>
              <Paragraph style={styles.valor}>{prestamo.cobrador_nombre}</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={{ paddingVertical: 16 }}>
          <Title style={{ fontSize: 20, fontWeight: '600', color: '#6200ee', marginBottom: 16 }}>
            📅 Cuotas
          </Title>
          <DataTable>
            <DataTable.Header style={{ backgroundColor: '#f8f9fa' }}>
              <DataTable.Title style={{ flex: 0.5 }}>#</DataTable.Title>
              <DataTable.Title style={{ flex: 1.5 }}>Vencimiento</DataTable.Title>
              <DataTable.Title numeric style={{ flex: 1.2 }}>Monto</DataTable.Title>
              <DataTable.Title style={{ flex: 1 }}>Estado</DataTable.Title>
            </DataTable.Header>

            {cuotas.map((cuota) => (
              <DataTable.Row key={cuota.id}>
                <DataTable.Cell style={{ flex: 0.5 }}>
                  <Paragraph style={{ fontWeight: '600' }}>{cuota.numero_cuota}</Paragraph>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 1.5 }}>
                  <Paragraph style={{ fontSize: 13 }}>
                    {formatearFecha(cuota.fecha_vencimiento)}
                  </Paragraph>
                </DataTable.Cell>
                <DataTable.Cell numeric style={{ flex: 1.2 }}>
                  <Paragraph style={{ fontSize: 13, fontWeight: '500' }}>
                    {formatearMoneda(cuota.monto_cuota)}
                  </Paragraph>
                </DataTable.Cell>
                <DataTable.Cell style={{ flex: 1 }}>
                  <Chip
                    mode="flat"
                    style={{
                      backgroundColor: obtenerColorEstado(cuota.estado),
                      borderRadius: 6,
                    }}
                    textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
                  >
                    {cuota.estado.toUpperCase()}
                  </Chip>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
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
  },
  card: {
    margin: 12,
    marginHorizontal: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  detalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  label: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  valor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  valorMoneda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  clienteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fotoCliente: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  fotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DetallePrestamoScreen;
