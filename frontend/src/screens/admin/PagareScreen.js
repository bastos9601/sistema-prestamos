// Pantalla de pagaré con firma digital
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  Text,
} from 'react-native-paper';
import FirmaDigital from '../../components/FirmaDigital';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PagareScreen = ({ route, navigation }) => {
  const { datosPrestamo } = route.params;
  const [mostrarFirma, setMostrarFirma] = useState(false);
  const [firmando, setFirmando] = useState(false);
  const [nombreSistema, setNombreSistema] = useState('Sistema de Préstamos');
  const [logoSistema, setLogoSistema] = useState('');

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const [responseNombre, responseLogo] = await Promise.all([
        api.get('/configuracion/nombre_sistema'),
        api.get('/configuracion/logo_sistema')
      ]);

      if (responseNombre.data.configuracion) {
        setNombreSistema(responseNombre.data.configuracion.valor);
        await AsyncStorage.setItem('nombreSistema', responseNombre.data.configuracion.valor);
      }

      if (responseLogo.data.configuracion && responseLogo.data.configuracion.valor) {
        setLogoSistema(responseLogo.data.configuracion.valor);
        await AsyncStorage.setItem('logoSistema', responseLogo.data.configuracion.valor);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      // Fallback a AsyncStorage
      try {
        const nombre = await AsyncStorage.getItem('nombreSistema');
        const logo = await AsyncStorage.getItem('logoSistema');
        if (nombre) setNombreSistema(nombre);
        if (logo) setLogoSistema(logo);
      } catch (storageError) {
        console.error('Error al cargar desde AsyncStorage:', storageError);
      }
    }
  };



  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const calcularMontoTotal = () => {
    const monto = parseFloat(datosPrestamo.monto_prestado);
    const tasa = parseFloat(datosPrestamo.tasa_interes);
    return monto + (monto * tasa / 100);
  };

  const calcularMontoCuota = () => {
    return calcularMontoTotal() / parseInt(datosPrestamo.numero_cuotas);
  };

  const generarCronogramaPagos = () => {
    const numeroCuotas = parseInt(datosPrestamo.numero_cuotas);
    const fechaInicio = new Date(datosPrestamo.fecha_inicio);
    const montoCuota = calcularMontoCuota();
    const cronograma = [];

    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      
      switch (datosPrestamo.frecuencia_pago) {
        case 'diario':
          fechaVencimiento.setDate(fechaInicio.getDate() + (i - 1));
          break;
        case 'semanal':
          fechaVencimiento.setDate(fechaInicio.getDate() + ((i - 1) * 7));
          break;
        case 'quincenal':
          fechaVencimiento.setDate(fechaInicio.getDate() + ((i - 1) * 15));
          break;
        case 'mensual':
          fechaVencimiento.setMonth(fechaInicio.getMonth() + (i - 1));
          break;
      }

      cronograma.push({
        numero: i,
        fecha: fechaVencimiento,
        monto: montoCuota,
      });
    }

    return cronograma;
  };

  const cronogramaPagos = generarCronogramaPagos();

  const handleFirmaGuardada = async (firma) => {
    setFirmando(true);
    try {
      // Crear el préstamo con la firma
      const response = await api.post('/prestamos', {
        ...datosPrestamo,
        firma_cliente: firma,
      });

      Alert.alert(
        '✅ Préstamo Creado',
        'El préstamo ha sido creado exitosamente con el pagaré firmado.',
        [
          {
            text: 'Ver Préstamo',
            onPress: () => {
              // Navegar al detalle del préstamo
              navigation.navigate('DetallePrestamo', { id: response.data.prestamo.id });
            },
          },
          {
            text: 'Volver a Clientes',
            onPress: () => {
              // Navegar de vuelta a la lista de clientes
              // Esto funciona tanto para admin como para cobrador
              navigation.popToTop();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo crear el préstamo'
      );
    } finally {
      setFirmando(false);
    }
  };

  if (mostrarFirma) {
    return (
      <FirmaDigital
        onFirmaGuardada={handleFirmaGuardada}
        onCancelar={() => setMostrarFirma(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ paddingVertical: 20 }}>
          {logoSistema && (
            <View style={styles.logoContainer}>
              <Image source={{ uri: logoSistema }} style={styles.logoImage} />
            </View>
          )}
          <Title style={styles.titulo}>📄 PAGARÉ</Title>
          <Text style={styles.nombreSistema}>{nombreSistema}</Text>
          <Divider style={{ marginVertical: 16 }} />

          <Text style={styles.seccion}>DATOS DEL DEUDOR</Text>
          
          {datosPrestamo.cliente_foto_url && (
            <View style={styles.fotoClienteContainer}>
              <Image
                source={{ uri: datosPrestamo.cliente_foto_url }}
                style={styles.fotoCliente}
              />
            </View>
          )}

          <View style={styles.campo}>
            <Text style={styles.label}>Nombre completo:</Text>
            <Text style={styles.valor}>
              {datosPrestamo.cliente_nombre} {datosPrestamo.cliente_apellido}
            </Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>DNI:</Text>
            <Text style={styles.valor}>{datosPrestamo.cliente_cedula}</Text>
          </View>
          {datosPrestamo.cliente_telefono && (
            <View style={styles.campo}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.valor}>{datosPrestamo.cliente_telefono}</Text>
            </View>
          )}
          {datosPrestamo.cliente_direccion && (
            <View style={styles.campo}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.valor}>{datosPrestamo.cliente_direccion}</Text>
            </View>
          )}

          <Divider style={{ marginVertical: 16 }} />

          <Text style={styles.seccion}>TÉRMINOS DEL PRÉSTAMO</Text>
          <View style={styles.campo}>
            <Text style={styles.label}>Monto prestado:</Text>
            <Text style={[styles.valor, styles.montoDestacado]}>
              {formatearMoneda(datosPrestamo.monto_prestado)}
            </Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Tasa de interés:</Text>
            <Text style={styles.valor}>{datosPrestamo.tasa_interes}%</Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Monto total a pagar:</Text>
            <Text style={[styles.valor, styles.montoTotal]}>
              {formatearMoneda(calcularMontoTotal())}
            </Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Número de cuotas:</Text>
            <Text style={styles.valor}>{datosPrestamo.numero_cuotas}</Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Monto por cuota:</Text>
            <Text style={[styles.valor, styles.montoCuota]}>
              {formatearMoneda(calcularMontoCuota())}
            </Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Frecuencia de pago:</Text>
            <Text style={styles.valor}>{datosPrestamo.frecuencia_pago}</Text>
          </View>
          <View style={styles.campo}>
            <Text style={styles.label}>Fecha de inicio:</Text>
            <Text style={styles.valor}>{formatearFecha(datosPrestamo.fecha_inicio)}</Text>
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text style={styles.seccion}>📅 CRONOGRAMA DE PAGOS</Text>
          <View style={styles.cronogramaContainer}>
            {cronogramaPagos.map((cuota, index) => (
              <View 
                key={index} 
                style={[
                  styles.cuotaItem,
                  index === 0 && styles.cuotaItemPrimera,
                  index === cronogramaPagos.length - 1 && styles.cuotaItemUltima,
                ]}
              >
                <View style={styles.cuotaNumero}>
                  <Text style={styles.cuotaNumeroTexto}>{cuota.numero}</Text>
                </View>
                <View style={styles.cuotaInfo}>
                  <Text style={styles.cuotaFecha}>
                    {cuota.fecha.toLocaleDateString('es-DO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.cuotaMonto}>{formatearMoneda(cuota.monto)}</Text>
                </View>
              </View>
            ))}
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text style={styles.seccion}>DECLARACIÓN</Text>
          <Paragraph style={styles.declaracion}>
            Por medio del presente pagaré, yo{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {datosPrestamo.cliente_nombre} {datosPrestamo.cliente_apellido}
            </Text>
            , identificado(a) con DNI número{' '}
            <Text style={{ fontWeight: 'bold' }}>{datosPrestamo.cliente_cedula}</Text>,
            me comprometo a pagar la suma de{' '}
            <Text style={{ fontWeight: 'bold', color: '#2e7d32' }}>
              {formatearMoneda(calcularMontoTotal())}
            </Text>{' '}
            ({calcularMontoTotal().toFixed(2)} soles peruanos) en{' '}
            <Text style={{ fontWeight: 'bold' }}>{datosPrestamo.numero_cuotas}</Text> cuotas
            de {formatearMoneda(calcularMontoCuota())} cada una, con frecuencia{' '}
            <Text style={{ fontWeight: 'bold' }}>{datosPrestamo.frecuencia_pago}</Text>,
            iniciando el {formatearFecha(datosPrestamo.fecha_inicio)}.
          </Paragraph>

          <Paragraph style={styles.declaracion}>
            Reconozco que este préstamo incluye una tasa de interés del{' '}
            <Text style={{ fontWeight: 'bold' }}>{datosPrestamo.tasa_interes}%</Text> sobre
            el monto prestado de {formatearMoneda(datosPrestamo.monto_prestado)}.
          </Paragraph>

          <Paragraph style={styles.declaracion}>
            Me comprometo a realizar los pagos en las fechas acordadas. En caso de
            incumplimiento, acepto que se tomen las medidas legales correspondientes para
            el cobro de la deuda.
          </Paragraph>

          <Divider style={{ marginVertical: 16 }} />

          <Text style={styles.seccion}>FIRMA DEL DEUDOR</Text>
          <Paragraph style={styles.instruccion}>
            Al firmar este documento, usted acepta todos los términos y condiciones
            establecidos en este pagaré.
          </Paragraph>

          <Button
            mode="contained"
            onPress={() => setMostrarFirma(true)}
            style={styles.botonFirmar}
            icon="draw"
            loading={firmando}
            disabled={firmando}
          >
            Firmar Pagaré
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 8 }}
          >
            Cancelar
          </Button>
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
  card: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6200ee',
  },
  nombreSistema: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  seccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  campo: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  valor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  montoDestacado: {
    fontSize: 18,
    color: '#1976d2',
  },
  montoTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  montoCuota: {
    fontSize: 17,
    color: '#d32f2f',
  },
  declaracion: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
    color: '#495057',
    marginBottom: 12,
  },
  instruccion: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  botonFirmar: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fotoClienteContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  fotoCliente: {
    width: 120,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  cronogramaContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cuotaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cuotaItemPrimera: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cuotaItemUltima: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  cuotaNumero: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cuotaNumeroTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cuotaInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuotaFecha: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  cuotaMonto: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});

export default PagareScreen;
