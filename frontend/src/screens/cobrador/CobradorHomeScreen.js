// Pantalla de inicio para cobradores
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Text } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const CobradorHomeScreen = ({ navigation }) => {
  const { usuario } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarEstadisticas();
    }, [])
  );

  const cargarEstadisticas = async () => {
    try {
      // Obtener estadísticas del cobrador (total de clientes creados)
      const estadisticasRes = await api.get('/clientes/estadisticas');
      const totalClientesCreados = estadisticasRes.data.total_clientes;

      // Obtener clientes con cuotas pendientes
      const clientesRes = await api.get('/pagos/clientes-pendientes');
      const clientes = clientesRes.data.clientes;

      // Calcular estadísticas
      const totalCuotasPendientes = clientes.reduce(
        (sum, c) => sum + parseInt(c.cuotas_pendientes),
        0
      );
      const totalMontoPendiente = clientes.reduce(
        (sum, c) => sum + parseFloat(c.monto_pendiente),
        0
      );

      setEstadisticas({
        totalClientes: totalClientesCreados,
        totalCuotasPendientes,
        totalMontoPendiente,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarEstadisticas();
  };



  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
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
      {/* Header con gradiente */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>👋 Hola, {usuario?.nombre}</Text>
          <Text style={styles.headerSubtitle}>Panel de Cobrador</Text>
        </View>
      </View>

      {estadisticas && (
        <>
          {/* Tarjetas de estadísticas principales */}
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, styles.statCardPrimary]}>
              <Card.Content style={styles.statCardContent}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>👥</Text>
                </View>
                <Text style={styles.statValue}>{estadisticas.totalClientes}</Text>
                <Text style={styles.statLabel}>Mis Clientes</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, styles.statCardWarning]}>
              <Card.Content style={styles.statCardContent}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>📋</Text>
                </View>
                <Text style={styles.statValue}>{estadisticas.totalCuotasPendientes}</Text>
                <Text style={styles.statLabel}>Cuotas Pendientes</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Tarjeta de monto pendiente destacada */}
          <Card style={styles.montoCard}>
            <Card.Content>
              <View style={styles.montoHeader}>
                <View style={styles.montoIconBg}>
                  <Text style={styles.montoIconLarge}>💰</Text>
                </View>
                <View style={styles.montoInfo}>
                  <Text style={styles.montoLabel}>Total por Cobrar</Text>
                  <Text style={styles.montoValor}>
                    {formatearMoneda(estadisticas.totalMontoPendiente)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Acciones rápidas con diseño moderno */}
          <Card style={styles.accionesCard}>
            <Card.Content>
              <Title style={styles.accionesTitulo}>🚀 Acciones Rápidas</Title>
              
              <TouchableOpacity 
                style={styles.accionItem}
                onPress={() => navigation.navigate('Clientes')}
                activeOpacity={0.7}
              >
                <View style={styles.accionIconContainer}>
                  <Text style={styles.accionIcon}>📱</Text>
                </View>
                <View style={styles.accionTexto}>
                  <Text style={styles.accionTitulo}>Ver Clientes</Text>
                  <Text style={styles.accionDescripcion}>
                    Accede a tu lista completa de clientes
                  </Text>
                </View>
                <Text style={styles.accionFlecha}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.accionItem}
                onPress={() => navigation.navigate('Préstamos')}
                activeOpacity={0.7}
              >
                <View style={styles.accionIconContainer}>
                  <Text style={styles.accionIcon}>💳</Text>
                </View>
                <View style={styles.accionTexto}>
                  <Text style={styles.accionTitulo}>Registrar Pagos</Text>
                  <Text style={styles.accionDescripcion}>
                    Selecciona un préstamo y registra sus pagos
                  </Text>
                </View>
                <Text style={styles.accionFlecha}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.accionItem}
                onPress={() => navigation.navigate('Préstamos')}
                activeOpacity={0.7}
              >
                <View style={styles.accionIconContainer}>
                  <Text style={styles.accionIcon}>📊</Text>
                </View>
                <View style={styles.accionTexto}>
                  <Text style={styles.accionTitulo}>Ver Cuotas</Text>
                  <Text style={styles.accionDescripcion}>
                    Consulta todas las cuotas pendientes
                  </Text>
                </View>
                <Text style={styles.accionFlecha}>›</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Tarjeta informativa */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoTitulo}>Consejo del día</Text>
              </View>
              <Text style={styles.infoTexto}>
                Mantén un seguimiento constante de tus clientes para mejorar la tasa de cobro. 
                Usa la pestaña "Clientes" para ver el estado de cada uno.
              </Text>
            </Card.Content>
          </Card>
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e1bee7',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardPrimary: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  statCardWarning: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 36,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
  },
  montoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  montoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  montoIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  montoIconLarge: {
    fontSize: 36,
  },
  montoInfo: {
    flex: 1,
  },
  montoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    fontWeight: '600',
  },
  montoValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  accionesCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  accionesTitulo: {
    fontSize: 18,
    color: '#212529',
    fontWeight: '700',
    marginBottom: 16,
  },
  accionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  accionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
  },
  accionIcon: {
    fontSize: 24,
  },
  accionTexto: {
    flex: 1,
  },
  accionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  accionDescripcion: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  accionFlecha: {
    fontSize: 32,
    color: '#6200ee',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  infoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
  },
  infoTexto: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20,
  },
});

export default CobradorHomeScreen;
