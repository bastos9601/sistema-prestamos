// Pantalla de inicio para administradores
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, Text, ProgressBar, IconButton } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const { width } = Dimensions.get('window');

const AdminHomeScreen = ({ navigation }) => {
  const { usuario } = useContext(AuthContext);
  const [reportes, setReportes] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const response = await api.get('/prestamos/reportes');
      setReportes(response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = () => {
    setRefrescando(true);
    cargarReportes();
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" />
      </View>
    );
  }



  const calcularPorcentaje = (valor, total) => {
    if (!total || total === 0) return 0;
    return (valor / total);
  };

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
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>👋 Hola, {usuario?.nombre}</Text>
              <Text style={styles.headerSubtitle}>Panel de Administración</Text>
            </View>
            <IconButton
              icon="cog"
              iconColor="#ffffff"
              size={28}
              onPress={() => navigation.navigate('Configuracion')}
              style={styles.configButton}
            />
          </View>
        </View>
      </View>

      {reportes && (
        <>
          {/* Tarjetas de resumen principal */}
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <Card style={[styles.statCard, styles.cardPrimary]}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📊</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {reportes.estadisticas.total_prestamos}
                  </Text>
                  <Text style={styles.statLabel}>Total Préstamos</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, styles.cardSuccess]}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>✅</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {reportes.estadisticas.activos}
                  </Text>
                  <Text style={styles.statLabel}>Activos</Text>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.gridRow}>
              <Card style={[styles.statCard, styles.cardInfo]}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>💰</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {reportes.estadisticas.pagados}
                  </Text>
                  <Text style={styles.statLabel}>Pagados</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCard, styles.cardDanger]}>
                <Card.Content style={styles.statCardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>⚠️</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {reportes.estadisticas.vencidos}
                  </Text>
                  <Text style={styles.statLabel}>Vencidos</Text>
                </Card.Content>
              </Card>
            </View>
          </View>

          {/* Distribución de préstamos */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitulo}>📈 Distribución de Préstamos</Title>
              
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Activos</Text>
                  <Text style={styles.progressValue}>
                    {reportes.estadisticas.activos} ({Math.round(calcularPorcentaje(reportes.estadisticas.activos, reportes.estadisticas.total_prestamos) * 100)}%)
                  </Text>
                </View>
                <ProgressBar 
                  progress={calcularPorcentaje(reportes.estadisticas.activos, reportes.estadisticas.total_prestamos)} 
                  color="#4CAF50" 
                  style={styles.progressBar}
                />
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Pagados</Text>
                  <Text style={styles.progressValue}>
                    {reportes.estadisticas.pagados} ({Math.round(calcularPorcentaje(reportes.estadisticas.pagados, reportes.estadisticas.total_prestamos) * 100)}%)
                  </Text>
                </View>
                <ProgressBar 
                  progress={calcularPorcentaje(reportes.estadisticas.pagados, reportes.estadisticas.total_prestamos)} 
                  color="#2196F3" 
                  style={styles.progressBar}
                />
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Vencidos</Text>
                  <Text style={styles.progressValue}>
                    {reportes.estadisticas.vencidos} ({Math.round(calcularPorcentaje(reportes.estadisticas.vencidos, reportes.estadisticas.total_prestamos) * 100)}%)
                  </Text>
                </View>
                <ProgressBar 
                  progress={calcularPorcentaje(reportes.estadisticas.vencidos, reportes.estadisticas.total_prestamos)} 
                  color="#F44336" 
                  style={styles.progressBar}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Montos financieros */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitulo}>💵 Resumen Financiero</Title>
              
              <View style={styles.montoCard}>
                <View style={styles.montoIconContainer}>
                  <Text style={styles.montoIcon}>💸</Text>
                </View>
                <View style={styles.montoInfo}>
                  <Text style={styles.montoLabel}>Total Prestado</Text>
                  <Text style={styles.montoValor}>
                    {formatearMoneda(reportes.estadisticas.total_prestado)}
                  </Text>
                </View>
              </View>

              <View style={styles.montoCard}>
                <View style={styles.montoIconContainer}>
                  <Text style={styles.montoIcon}>📈</Text>
                </View>
                <View style={styles.montoInfo}>
                  <Text style={styles.montoLabel}>Total con Interés</Text>
                  <Text style={styles.montoValor}>
                    {formatearMoneda(reportes.estadisticas.total_con_interes)}
                  </Text>
                </View>
              </View>

              <View style={[styles.montoCard, styles.montoCardHighlight]}>
                <View style={styles.montoIconContainer}>
                  <Text style={styles.montoIcon}>💰</Text>
                </View>
                <View style={styles.montoInfo}>
                  <Text style={styles.montoLabel}>Ganancia Estimada</Text>
                  <Text style={[styles.montoValor, styles.montoGanancia]}>
                    {formatearMoneda(reportes.estadisticas.total_con_interes - reportes.estadisticas.total_prestado)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Cuotas y pagos */}
          <View style={styles.gridContainer}>
            <Card style={[styles.infoCard, { marginRight: 8 }]}>
              <Card.Content>
                <Text style={styles.infoIcon}>📋</Text>
                <Title style={styles.infoTitulo}>Cuotas Pendientes</Title>
                <Text style={styles.infoValorPrincipal}>
                  {reportes.cuotas_pendientes.total}
                </Text>
                <Text style={styles.infoLabel}>cuotas</Text>
                <View style={styles.divider} />
                <Text style={styles.infoMonto}>
                  {formatearMoneda(reportes.cuotas_pendientes.monto_pendiente)}
                </Text>
                <Text style={styles.infoSubLabel}>monto pendiente</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.infoCard, { marginLeft: 8 }]}>
              <Card.Content>
                <Text style={styles.infoIcon}>📅</Text>
                <Title style={styles.infoTitulo}>Mes Actual</Title>
                <Text style={styles.infoValorPrincipal}>
                  {reportes.pagos_mes_actual.total_pagos || 0}
                </Text>
                <Text style={styles.infoLabel}>pagos</Text>
                <View style={styles.divider} />
                <Text style={styles.infoMonto}>
                  {formatearMoneda(reportes.pagos_mes_actual.monto_recaudado)}
                </Text>
                <Text style={styles.infoSubLabel}>recaudado</Text>
              </Card.Content>
            </Card>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
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
  configButton: {
    margin: 0,
  },
  gridContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardPrimary: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  cardSuccess: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardInfo: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cardDanger: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconText: {
    fontSize: 32,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
  },
  card: {
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
  cardTitulo: {
    fontSize: 18,
    marginBottom: 20,
    color: '#212529',
    fontWeight: '700',
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e9ecef',
  },
  montoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  montoCardHighlight: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  montoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
  },
  montoIcon: {
    fontSize: 24,
  },
  montoInfo: {
    flex: 1,
  },
  montoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  montoValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  montoGanancia: {
    color: '#2e7d32',
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  infoIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  infoTitulo: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 12,
  },
  infoValorPrincipal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 12,
  },
  infoMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  infoSubLabel: {
    fontSize: 13,
    color: '#6c757d',
  },
});

export default AdminHomeScreen;
