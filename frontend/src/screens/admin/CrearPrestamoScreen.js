// Pantalla para crear préstamos
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Menu,
  Divider,
  Card,
  Title,
  Paragraph,
  Text,
} from 'react-native-paper';
import api from '../../config/api';
import { formatearMoneda } from '../../utils/formatearMoneda';

const CrearPrestamoScreen = ({ navigation, route }) => {
  const [clientes, setClientes] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [cobradorId, setCobradorId] = useState('');
  const [montoPrestado, setMontoPrestado] = useState('');
  const [tasaInteres, setTasaInteres] = useState('10');
  const [numeroCuotas, setNumeroCuotas] = useState('12');
  const [frecuenciaPago, setFrecuenciaPago] = useState('mensual');
  const [fechaInicio, setFechaInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);
  const [menuClienteVisible, setMenuClienteVisible] = useState(false);
  const [menuCobradorVisible, setMenuCobradorVisible] = useState(false);
  
  const clienteInputRef = useRef(null);
  const cobradorInputRef = useRef(null);

  useEffect(() => {
    cargarDatos();
    // Si viene un clienteId desde la navegación, pre-seleccionarlo
    if (route.params?.clienteId) {
      setClienteId(route.params.clienteId.toString());
    }
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesRes, cobradoresRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/usuarios/cobradores'),
      ]);
      console.log('Clientes recibidos:', clientesRes.data);
      console.log('Cobradores recibidos:', cobradoresRes.data);
      setClientes(clientesRes.data.clientes || []);
      setCobradores(cobradoresRes.data.cobradores || []);
    } catch (error) {
      console.error('Error al cargar datos:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudieron cargar los datos: ' + (error.response?.data?.error || error.message));
    }
  };

  const continuarAPagare = async () => {
    if (!clienteId || !montoPrestado || !numeroCuotas) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    // Obtener datos completos del cliente
    const cliente = clientes.find((c) => c.id === parseInt(clienteId));
    
    if (!cliente) {
      Alert.alert('Error', 'Cliente no encontrado');
      return;
    }

    // Preparar datos del préstamo para el pagaré
    const datosPrestamo = {
      cliente_id: parseInt(clienteId),
      cliente_nombre: cliente.nombre,
      cliente_apellido: cliente.apellido,
      cliente_cedula: cliente.cedula,
      cliente_telefono: cliente.telefono,
      cliente_direccion: cliente.direccion,
      cliente_foto_url: cliente.foto_url,
      cobrador_id: cobradorId ? parseInt(cobradorId) : null,
      monto_prestado: parseFloat(montoPrestado),
      tasa_interes: parseFloat(tasaInteres),
      numero_cuotas: parseInt(numeroCuotas),
      frecuencia_pago: frecuenciaPago,
      fecha_inicio: fechaInicio,
      notas,
    };

    // Navegar a la pantalla de pagaré
    navigation.navigate('Pagare', { datosPrestamo });
  };

  const clienteSeleccionado = clientes.find((c) => c.id === parseInt(clienteId));
  const cobradorSeleccionado = cobradores.find(
    (c) => c.id === parseInt(cobradorId)
  );

  // Calcular el monto de cada cuota
  const calcularCuota = () => {
    const monto = parseFloat(montoPrestado);
    const tasa = parseFloat(tasaInteres);
    const cuotas = parseInt(numeroCuotas);

    if (!monto || !cuotas || monto <= 0 || cuotas <= 0) {
      return null;
    }

    const interes = (monto * tasa) / 100;
    const montoTotal = monto + interes;
    const montoCuota = montoTotal / cuotas;

    return {
      montoPrestado: monto,
      interes: interes,
      montoTotal: montoTotal,
      montoCuota: montoCuota,
      numeroCuotas: cuotas,
    };
  };

  const calculoCuota = calcularCuota();

  const obtenerTextoFrecuencia = () => {
    switch (frecuenciaPago) {
      case 'diario':
        return 'diaria';
      case 'semanal':
        return 'semanal';
      case 'quincenal':
        return 'quincenal';
      case 'mensual':
        return 'mensual';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View ref={clienteInputRef}>
            <Menu
              visible={menuClienteVisible}
              onDismiss={() => setMenuClienteVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuClienteVisible(true)}>
                  <TextInput
                    label="Cliente *"
                    value={
                      clienteSeleccionado
                        ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`
                        : ''
                    }
                    mode="outlined"
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" />}
                    style={styles.input}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              }
            >
              {clientes.map((cliente) => (
                <Menu.Item
                  key={cliente.id}
                  onPress={() => {
                    setClienteId(cliente.id.toString());
                    setMenuClienteVisible(false);
                  }}
                  title={`${cliente.nombre} ${cliente.apellido}`}
                />
              ))}
            </Menu>
          </View>

          <View ref={cobradorInputRef}>
            <Menu
              visible={menuCobradorVisible}
              onDismiss={() => setMenuCobradorVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuCobradorVisible(true)}>
                  <TextInput
                    label="Cobrador (opcional)"
                    value={cobradorSeleccionado ? cobradorSeleccionado.nombre : ''}
                    mode="outlined"
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" />}
                    style={styles.input}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setCobradorId('');
                  setMenuCobradorVisible(false);
                }}
                title="Sin asignar"
              />
              <Divider />
              {cobradores.map((cobrador) => (
                <Menu.Item
                  key={cobrador.id}
                  onPress={() => {
                    setCobradorId(cobrador.id.toString());
                    setMenuCobradorVisible(false);
                  }}
                  title={cobrador.nombre}
                />
              ))}
            </Menu>
          </View>

          <TextInput
            label="Monto a prestar *"
            value={montoPrestado}
            onChangeText={setMontoPrestado}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Tasa de interés (%)"
            value={tasaInteres}
            onChangeText={setTasaInteres}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Número de cuotas *"
            value={numeroCuotas}
            onChangeText={setNumeroCuotas}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <SegmentedButtons
            value={frecuenciaPago}
            onValueChange={setFrecuenciaPago}
            buttons={[
              { value: 'diario', label: 'Diario' },
              { value: 'semanal', label: 'Semanal' },
              { value: 'quincenal', label: 'Quincenal' },
              { value: 'mensual', label: 'Mensual' },
            ]}
            style={styles.input}
          />

          {calculoCuota && (
            <Card style={styles.calculoCard}>
              <Card.Content>
                <View style={styles.calculoHeader}>
                  <Text style={styles.calculoIcon}>💰</Text>
                  <Title style={styles.calculoTitulo}>Resumen del Préstamo</Title>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.calculoDetalle}>
                  <Paragraph style={styles.calculoLabel}>Monto prestado:</Paragraph>
                  <Paragraph style={styles.calculoValor}>
                    {formatearMoneda(calculoCuota.montoPrestado)}
                  </Paragraph>
                </View>

                <View style={styles.calculoDetalle}>
                  <Paragraph style={styles.calculoLabel}>
                    Interés ({tasaInteres}%):
                  </Paragraph>
                  <Paragraph style={styles.calculoValorInteres}>
                    +{formatearMoneda(calculoCuota.interes)}
                  </Paragraph>
                </View>

                <View style={styles.calculoDetalle}>
                  <Paragraph style={styles.calculoLabel}>Total a pagar:</Paragraph>
                  <Paragraph style={styles.calculoValorTotal}>
                    {formatearMoneda(calculoCuota.montoTotal)}
                  </Paragraph>
                </View>

                <View style={styles.dividerDestacado} />

                <View style={styles.cuotaDestacada}>
                  <View style={styles.cuotaIconContainer}>
                    <Text style={styles.cuotaIconLarge}>📅</Text>
                  </View>
                  <View style={styles.cuotaInfo}>
                    <Paragraph style={styles.cuotaLabel}>
                      Cuota {obtenerTextoFrecuencia()}
                    </Paragraph>
                    <Text style={styles.cuotaMonto}>
                      {formatearMoneda(calculoCuota.montoCuota)}
                    </Text>
                    <Paragraph style={styles.cuotaSubtexto}>
                      {calculoCuota.numeroCuotas} pagos de {formatearMoneda(calculoCuota.montoCuota)}
                    </Paragraph>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          <TextInput
            label="Fecha de inicio"
            value={fechaInicio}
            onChangeText={setFechaInicio}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

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
            onPress={continuarAPagare}
            loading={cargando}
            disabled={cargando}
            style={styles.boton}
            icon="file-document-edit"
          >
            Continuar al Pagaré
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  boton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calculoCard: {
    marginBottom: 16,
    elevation: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6200ee',
    borderRadius: 12,
  },
  calculoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculoIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  calculoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  dividerDestacado: {
    height: 2,
    backgroundColor: '#6200ee',
    marginVertical: 16,
  },
  calculoDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  calculoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  calculoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  calculoValorInteres: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  calculoValorTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  cuotaDestacada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    padding: 16,
    borderRadius: 12,
  },
  cuotaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
  },
  cuotaIconLarge: {
    fontSize: 32,
  },
  cuotaInfo: {
    flex: 1,
  },
  cuotaLabel: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  cuotaMonto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  cuotaSubtexto: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});

export default CrearPrestamoScreen;
