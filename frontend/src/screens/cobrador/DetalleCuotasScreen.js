// Pantalla de cuotas pendientes de un cliente
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Chip,
  Button,
} from 'react-native-paper';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const DetalleCuotasScreen = ({ route, navigation }) => {
  const { clienteId } = route.params;
  const [cuotas, setCuotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarCuotas();
  }, []);

  const cargarCuotas = async () => {
    try {
      const response = await api.get(`/pagos/cuotas-pendientes/${clienteId}`);
      setCuotas(response.data.cuotas);
    } catch (error) {
      console.error('Error al cargar cuotas:', error);
      Alert.alert('Error', 'No se pudieron cargar las cuotas');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarCuotas();
  };



  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO');
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#ff9800';
      case 'vencida':
        return '#f44336';
      case 'parcial':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  const estaVencida = (fechaVencimiento) => {
    return new Date(fechaVencimiento) < new Date();
  };

  const renderCuota = ({ item }) => {
    const montoPendiente = item.monto_cuota - item.monto_pagado;
    const vencida = estaVencida(item.fecha_vencimiento);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Cuota #{item.numero_cuota}</Title>
            <Chip
              mode="flat"
              style={{
                backgroundColor: obtenerColorEstado(item.estado),
              }}
              textStyle={{ color: 'white' }}
            >
              {item.estado.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.detalle}>
            <Paragraph>Monto de la cuota:</Paragraph>
            <Paragraph style={styles.valor}>
              {formatearMoneda(item.monto_cuota)}
            </Paragraph>
          </View>

          {item.monto_pagado > 0 && (
            <View style={styles.detalle}>
              <Paragraph>Monto pagado:</Paragraph>
              <Paragraph style={styles.valorPagado}>
                {formatearMoneda(item.monto_pagado)}
              </Paragraph>
            </View>
          )}

          <View style={styles.detalle}>
            <Paragraph>Monto pendiente:</Paragraph>
            <Paragraph style={styles.valorPendiente}>
              {formatearMoneda(montoPendiente)}
            </Paragraph>
          </View>

          <View style={styles.detalle}>
            <Paragraph>Fecha de vencimiento:</Paragraph>
            <Paragraph style={vencida ? styles.fechaVencida : styles.fecha}>
              {formatearFecha(item.fecha_vencimiento)}
            </Paragraph>
          </View>

          <Button
            mode="contained"
            onPress={() =>
              navigation.navigate('RegistrarPago', {
                cuota: item,
                clienteId,
                clienteInfo: {
                  cliente_nombre: item.cliente_nombre,
                  cliente_apellido: item.cliente_apellido,
                  cliente_telefono: item.cliente_telefono,
                },
              })
            }
            style={styles.boton}
          >
            Registrar Pago
          </Button>
        </Card.Content>
      </Card>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const clienteInfo = cuotas.length > 0 ? cuotas[0] : null;

  return (
    <View style={styles.container}>
      {clienteInfo && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>
              {clienteInfo.cliente_nombre} {clienteInfo.cliente_apellido}
            </Title>
            {clienteInfo.cliente_telefono && (
              <Paragraph>Tel: {clienteInfo.cliente_telefono}</Paragraph>
            )}
            {clienteInfo.cliente_direccion && (
              <Paragraph>{clienteInfo.cliente_direccion}</Paragraph>
            )}
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={cuotas}
        renderItem={renderCuota}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centrado}>
            <Paragraph>No hay cuotas pendientes para este cliente</Paragraph>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoCard: {
    margin: 10,
    elevation: 3,
    backgroundColor: '#e3f2fd',
  },
  card: {
    margin: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  valor: {
    fontWeight: 'bold',
  },
  valorPagado: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  valorPendiente: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  fecha: {
    fontWeight: 'bold',
  },
  fechaVencida: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  boton: {
    marginTop: 10,
  },
});

export default DetalleCuotasScreen;
