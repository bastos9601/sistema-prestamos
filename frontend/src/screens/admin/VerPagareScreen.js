// Pantalla para ver el pagaré firmado
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VerPagareScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [prestamo, setPrestamo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [nombreSistema, setNombreSistema] = useState('Sistema de Préstamos');
  const [logoSistema, setLogoSistema] = useState('');
  const viewRef = useRef();

  useEffect(() => {
    cargarPrestamo();
    cargarConfiguracion();
  }, []);

  const cargarPrestamo = async () => {
    try {
      const response = await api.get(`/prestamos/${id}`);
      setPrestamo(response.data.prestamo);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el préstamo');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

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
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const generarCronogramaPagos = (prestamo) => {
    const numeroCuotas = parseInt(prestamo.numero_cuotas);
    const fechaInicio = new Date(prestamo.fecha_inicio);
    const montoCuota = parseFloat(prestamo.monto_cuota);
    const cronograma = [];

    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      
      switch (prestamo.frecuencia_pago) {
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

  const descargarPDF = async () => {
    try {
      setGenerandoPDF(true);
      
      // Esperar un momento para asegurar que todo esté renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capturar la vista como imagen
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      console.log('Imagen capturada:', uri);

      // Verificar si se puede compartir
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'La función de compartir no está disponible');
        return;
      }

      // Compartir/Descargar
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Guardar Pagaré',
        UTI: 'public.png',
      });
      
      Alert.alert('✅ Éxito', 'Pagaré compartido correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el documento: ' + error.message);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const enviarPorWhatsApp = async () => {
    if (!prestamo.cliente_telefono) {
      Alert.alert('Error', 'El cliente no tiene un número de teléfono registrado');
      return;
    }

    Alert.alert(
      '📱 Enviar Pagaré por WhatsApp',
      'Se generará el pagaré y se abrirá WhatsApp con el chat del cliente. Luego podrá adjuntar y enviar el documento.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          onPress: async () => {
            try {
              setEnviandoWhatsApp(true);
              
              // Esperar un momento para asegurar que todo esté renderizado
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Capturar la vista como imagen
              const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile',
              });

              console.log('Imagen capturada para WhatsApp:', uri);

              // Crear mensaje para WhatsApp
              const mensaje = `Hola ${prestamo.cliente_nombre} ${prestamo.cliente_apellido},\n\n` +
                `Le envío su pagaré firmado del préstamo:\n\n` +
                `💰 Monto prestado: ${formatearMoneda(prestamo.monto_prestado)}\n` +
                `📊 Total a pagar: ${formatearMoneda(prestamo.monto_total)}\n` +
                `📅 ${prestamo.numero_cuotas} cuotas de ${formatearMoneda(prestamo.monto_cuota)}\n` +
                `🔄 Frecuencia: ${prestamo.frecuencia_pago}\n` +
                `📆 Inicio: ${formatearFecha(prestamo.fecha_inicio)}\n\n` +
                `Gracias por su confianza.`;

              const telefono = prestamo.cliente_telefono.replace(/[^0-9]/g, '');
              
              // Primero abrir WhatsApp con el mensaje
              const whatsappUrl = `whatsapp://send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;
              
              const supported = await Linking.canOpenURL(whatsappUrl);
              if (!supported) {
                Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
                setEnviandoWhatsApp(false);
                return;
              }

              // Abrir WhatsApp
              await Linking.openURL(whatsappUrl);

              // Esperar un momento y luego compartir el archivo
              setTimeout(async () => {
                try {
                  const isAvailable = await Sharing.isAvailableAsync();
                  if (isAvailable) {
                    await Sharing.shareAsync(uri, {
                      mimeType: 'image/png',
                      dialogTitle: 'Compartir Pagaré',
                      UTI: 'public.png',
                    });
                  }
                } catch (shareError) {
                  console.error('Error al compartir:', shareError);
                }
                setEnviandoWhatsApp(false);
              }, 2000);

            } catch (error) {
              console.error('Error al enviar por WhatsApp:', error);
              Alert.alert('Error', 'No se pudo abrir WhatsApp: ' + error.message);
              setEnviandoWhatsApp(false);
            }
          },
        },
      ]
    );
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.pagareWrapper}>
          <View ref={viewRef} collapsable={false} style={styles.pagareContainer}>
            <Card style={styles.card}>
            <Card.Content style={{ paddingVertical: 24, paddingHorizontal: 20 }}>
              {logoSistema && (
                <View style={styles.logoContainer}>
                  <Image source={{ uri: logoSistema }} style={styles.logoImage} />
                </View>
              )}
              <Title style={styles.titulo}>📄 PAGARÉ</Title>
              <Text style={styles.nombreSistema}>{nombreSistema}</Text>
              <Divider style={{ marginVertical: 16 }} />

              <Text style={styles.seccion}>DATOS DEL DEUDOR</Text>
              
              {prestamo.cliente_foto_url && (
                <View style={styles.fotoClienteContainer}>
                  <Image
                    source={{ uri: prestamo.cliente_foto_url }}
                    style={styles.fotoCliente}
                  />
                </View>
              )}

              <View style={styles.campo}>
                <Text style={styles.label}>Nombre completo:</Text>
                <Text style={styles.valor}>
                  {prestamo.cliente_nombre} {prestamo.cliente_apellido}
                </Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>DNI:</Text>
                <Text style={styles.valor}>{prestamo.cliente_cedula}</Text>
              </View>
              {prestamo.cliente_telefono && (
                <View style={styles.campo}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.valor}>{prestamo.cliente_telefono}</Text>
                </View>
              )}

              <Divider style={{ marginVertical: 16 }} />

              <Text style={styles.seccion}>TÉRMINOS DEL PRÉSTAMO</Text>
              <View style={styles.campo}>
                <Text style={styles.label}>Monto prestado:</Text>
                <Text style={[styles.valor, styles.montoDestacado]}>
                  {formatearMoneda(prestamo.monto_prestado)}
                </Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>Tasa de interés:</Text>
                <Text style={styles.valor}>{prestamo.tasa_interes}%</Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>Monto total a pagar:</Text>
                <Text style={[styles.valor, styles.montoTotal]}>
                  {formatearMoneda(prestamo.monto_total)}
                </Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>Número de cuotas:</Text>
                <Text style={styles.valor}>{prestamo.numero_cuotas}</Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>Monto por cuota:</Text>
                <Text style={[styles.valor, styles.montoCuota]}>
                  {formatearMoneda(prestamo.monto_cuota)}
                </Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>Frecuencia de pago:</Text>
                <Text style={styles.valor}>{prestamo.frecuencia_pago}</Text>
              </View>
              <View style={styles.campo}>
                <Text style={styles.label}>Fecha de inicio:</Text>
                <Text style={styles.valor}>{formatearFecha(prestamo.fecha_inicio)}</Text>
              </View>

              <Divider style={{ marginVertical: 16 }} />

              <Text style={styles.seccion}>📅 CRONOGRAMA DE PAGOS</Text>
              <View style={styles.cronogramaContainer}>
                {generarCronogramaPagos(prestamo).map((cuota, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.cuotaItem,
                      index === 0 && styles.cuotaItemPrimera,
                      index === prestamo.numero_cuotas - 1 && styles.cuotaItemUltima,
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
                  {prestamo.cliente_nombre} {prestamo.cliente_apellido}
                </Text>
                , identificado(a) con DNI número{' '}
                <Text style={{ fontWeight: 'bold' }}>{prestamo.cliente_cedula}</Text>,
                me comprometo a pagar la suma de{' '}
                <Text style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {formatearMoneda(prestamo.monto_total)}
                </Text>{' '}
                ({prestamo.monto_total} soles peruanos) en{' '}
                <Text style={{ fontWeight: 'bold' }}>{prestamo.numero_cuotas}</Text> cuotas
                de {formatearMoneda(prestamo.monto_cuota)} cada una, con frecuencia{' '}
                <Text style={{ fontWeight: 'bold' }}>{prestamo.frecuencia_pago}</Text>,
                iniciando el {formatearFecha(prestamo.fecha_inicio)}.
              </Paragraph>

              <Paragraph style={styles.declaracion}>
                Reconozco que este préstamo incluye una tasa de interés del{' '}
                <Text style={{ fontWeight: 'bold' }}>{prestamo.tasa_interes}%</Text> sobre
                el monto prestado de {formatearMoneda(prestamo.monto_prestado)}.
              </Paragraph>

              <Paragraph style={styles.declaracion}>
                Me comprometo a realizar los pagos en las fechas acordadas. En caso de
                incumplimiento, acepto que se tomen las medidas legales correspondientes para
                el cobro de la deuda.
              </Paragraph>

              <Divider style={{ marginVertical: 16 }} />

              <Text style={styles.seccion}>FIRMA DEL DEUDOR</Text>
              {prestamo.firma_cliente && (
                <View style={styles.firmaContainer}>
                  <Image
                    source={{ uri: prestamo.firma_cliente }}
                    style={styles.firma}
                    resizeMode="contain"
                  />
                  <Text style={styles.lineaFirma}>_______________________________</Text>
                  <Text style={styles.nombreFirma}>
                    {prestamo.cliente_nombre} {prestamo.cliente_apellido}
                  </Text>
                  <Text style={styles.cedulaFirma}>DNI: {prestamo.cliente_cedula}</Text>
                  <Text style={styles.fechaFirma}>
                    Fecha: {formatearFecha(prestamo.creado_en)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
          </View>
        </View>

        <View style={styles.botonesContainer}>
          {prestamo.cliente_telefono && (
            <Button
              mode="contained"
              onPress={enviarPorWhatsApp}
              loading={enviandoWhatsApp}
              disabled={enviandoWhatsApp || generandoPDF}
              style={styles.botonWhatsApp}
              icon="whatsapp"
              buttonColor="#25D366"
            >
              Enviar por WhatsApp
            </Button>
          )}

          <Button
            mode="contained"
            onPress={descargarPDF}
            loading={generandoPDF}
            disabled={generandoPDF || enviandoWhatsApp}
            style={styles.botonDescargar}
            icon="download"
          >
            Descargar/Compartir Pagaré
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={generandoPDF || enviandoWhatsApp}
            style={styles.botonVolver}
          >
            Volver
          </Button>
        </View>
      </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  pagareWrapper: {
    backgroundColor: '#f0f4f8',
  },
  pagareContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
  },
  card: {
    elevation: 0,
    borderRadius: 0,
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
  firmaContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  firma: {
    width: 250,
    height: 120,
    marginBottom: 10,
  },
  lineaFirma: {
    fontSize: 16,
    color: '#212529',
    marginTop: 10,
  },
  nombreFirma: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 8,
  },
  cedulaFirma: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
  },
  fechaFirma: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 4,
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
  botonesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  botonWhatsApp: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 4,
  },
  botonDescargar: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botonVolver: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
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

export default VerPagareScreen;
