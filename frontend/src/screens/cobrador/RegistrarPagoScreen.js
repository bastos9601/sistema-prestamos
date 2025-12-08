// Pantalla para registrar pagos
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Card,
  Title,
  Paragraph,
  IconButton,
} from 'react-native-paper';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const RegistrarPagoScreen = ({ route, navigation }) => {
  const { cuota, clienteId, clienteInfo } = route.params;
  const montoPendiente = cuota.monto_cuota - cuota.monto_pagado;

  const [monto, setMonto] = useState(montoPendiente.toString());
  const [tipoPago, setTipoPago] = useState('efectivo');
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);



  const enviarRecordatorioWhatsApp = () => {
    if (!clienteInfo?.cliente_telefono) {
      Alert.alert('Error', 'El cliente no tiene un número de teléfono registrado');
      return;
    }

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-DO');
    };

    const mensaje = `Hola ${clienteInfo.cliente_nombre} ${clienteInfo.cliente_apellido},\n\n` +
      `Le recordamos que tiene una cuota pendiente:\n\n` +
      `📋 Cuota #${cuota.numero_cuota}\n` +
      `💰 Monto: ${formatearMoneda(montoPendiente)}\n` +
      `📅 Vencimiento: ${formatearFecha(cuota.fecha_vencimiento)}\n\n` +
      `Por favor, realice su pago a la brevedad posible.\n\n` +
      `Gracias por su atención.`;

    const telefono = clienteInfo.cliente_telefono.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${telefono}&text=${encodeURIComponent(mensaje)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
        }
      })
      .catch((err) => {
        console.error('Error al abrir WhatsApp:', err);
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
  };

  const registrarPago = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingrese un monto válido');
      return;
    }

    if (parseFloat(monto) > montoPendiente) {
      Alert.alert(
        'Error',
        `El monto no puede ser mayor al pendiente: ${formatearMoneda(
          montoPendiente
        )}`
      );
      return;
    }

    setCargando(true);
    try {
      await api.post('/pagos', {
        cuota_id: cuota.id,
        prestamo_id: cuota.prestamo_id,
        monto: parseFloat(monto),
        fecha_pago: new Date().toISOString().split('T')[0],
        tipo_pago: tipoPago,
        referencia: referencia || null,
        notas: notas || null,
      });

      Alert.alert('Éxito', 'Pago registrado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudo registrar el pago'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.headerCard}>
              <Title>Información de la Cuota</Title>
              {clienteInfo?.cliente_telefono && (
                <IconButton
                  icon="whatsapp"
                  iconColor="#25D366"
                  size={32}
                  onPress={enviarRecordatorioWhatsApp}
                  style={styles.whatsappButton}
                />
              )}
            </View>
            {clienteInfo && (
              <View style={styles.clienteInfo}>
                <Paragraph style={styles.clienteNombre}>
                  {clienteInfo.cliente_nombre} {clienteInfo.cliente_apellido}
                </Paragraph>
                {clienteInfo.cliente_telefono && (
                  <Paragraph style={styles.clienteTelefono}>
                    📱 {clienteInfo.cliente_telefono}
                  </Paragraph>
                )}
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.detalle}>
              <Paragraph>Cuota #:</Paragraph>
              <Paragraph style={styles.valor}>{cuota.numero_cuota}</Paragraph>
            </View>
            <View style={styles.detalle}>
              <Paragraph>Monto total:</Paragraph>
              <Paragraph style={styles.valor}>
                {formatearMoneda(cuota.monto_cuota)}
              </Paragraph>
            </View>
            {cuota.monto_pagado > 0 && (
              <View style={styles.detalle}>
                <Paragraph>Ya pagado:</Paragraph>
                <Paragraph style={styles.valorPagado}>
                  {formatearMoneda(cuota.monto_pagado)}
                </Paragraph>
              </View>
            )}
            <View style={styles.detalle}>
              <Paragraph>Pendiente:</Paragraph>
              <Paragraph style={styles.valorPendiente}>
                {formatearMoneda(montoPendiente)}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {clienteInfo?.cliente_telefono && (
          <Card style={styles.whatsappCard}>
            <Card.Content>
              <View style={styles.whatsappCardContent}>
                <View style={styles.whatsappInfo}>
                  <Paragraph style={styles.whatsappTitle}>💬 Recordatorio por WhatsApp</Paragraph>
                  <Paragraph style={styles.whatsappSubtitle}>
                    Envía un recordatorio de pago al cliente
                  </Paragraph>
                </View>
                <Button
                  mode="contained"
                  icon="whatsapp"
                  onPress={enviarRecordatorioWhatsApp}
                  buttonColor="#25D366"
                  style={styles.whatsappButtonLarge}
                >
                  Enviar
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={styles.form}>
          <TextInput
            label="Monto a pagar *"
            value={monto}
            onChangeText={setMonto}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <SegmentedButtons
            value={tipoPago}
            onValueChange={setTipoPago}
            buttons={[
              { value: 'efectivo', label: 'Efectivo' },
              { value: 'transferencia', label: 'Transferencia' },
              { value: 'cheque', label: 'Cheque' },
              { value: 'otro', label: 'Otro' },
            ]}
            style={styles.input}
          />

          {(tipoPago === 'transferencia' || tipoPago === 'cheque') && (
            <TextInput
              label="Referencia"
              value={referencia}
              onChangeText={setReferencia}
              mode="outlined"
              placeholder="Número de referencia o cheque"
              style={styles.input}
            />
          )}

          <TextInput
            label="Notas"
            value={notas}
            onChangeText={setNotas}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={registrarPago}
            loading={cargando}
            disabled={cargando}
            style={styles.boton}
          >
            Registrar Pago
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 10,
    elevation: 3,
    backgroundColor: '#e3f2fd',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  whatsappButton: {
    margin: 0,
  },
  clienteInfo: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  clienteTelefono: {
    fontSize: 14,
    color: '#6c757d',
  },
  divider: {
    height: 1,
    backgroundColor: '#90caf9',
    marginVertical: 12,
  },
  whatsappCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 3,
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#25D366',
  },
  whatsappCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whatsappInfo: {
    flex: 1,
    marginRight: 12,
  },
  whatsappTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  whatsappSubtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
  whatsappButtonLarge: {
    elevation: 2,
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
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  boton: {
    marginTop: 10,
    paddingVertical: 5,
  },
});

export default RegistrarPagoScreen;
