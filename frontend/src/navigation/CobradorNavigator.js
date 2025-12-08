// Navegación para cobradores
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';

// Pantallas Cobrador
import CobradorHomeScreen from '../screens/cobrador/CobradorHomeScreen';
import MisClientesScreen from '../screens/cobrador/MisClientesScreen';
import MisPrestamosScreen from '../screens/cobrador/MisPrestamosScreen';
import DetalleCuotasScreen from '../screens/cobrador/DetalleCuotasScreen';
import RegistrarPagoScreen from '../screens/cobrador/RegistrarPagoScreen';

// Pantallas compartidas de Admin (reutilizadas)
import CrearClienteScreen from '../screens/admin/CrearClienteScreen';
import EditarClienteScreen from '../screens/admin/EditarClienteScreen';
import CrearPrestamoScreen from '../screens/admin/CrearPrestamoScreen';
import PagareScreen from '../screens/admin/PagareScreen';
import DetallePrestamoScreen from '../screens/admin/DetallePrestamoScreen';
import VerPagareScreen from '../screens/admin/VerPagareScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de Clientes
const ClientesStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ListaMisClientes"
      component={MisClientesScreen}
      options={{ title: 'Mis Clientes' }}
    />
    <Stack.Screen
      name="CrearCliente"
      component={CrearClienteScreen}
      options={{ title: 'Crear Cliente' }}
    />
    <Stack.Screen
      name="EditarCliente"
      component={EditarClienteScreen}
      options={{ title: 'Editar Cliente' }}
    />
    <Stack.Screen
      name="CrearPrestamo"
      component={CrearPrestamoScreen}
      options={{ title: 'Crear Préstamo' }}
    />
    <Stack.Screen
      name="Pagare"
      component={PagareScreen}
      options={{ title: 'Pagaré' }}
    />
  </Stack.Navigator>
);

// Stack de Préstamos
const PrestamosStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ListaMisPrestamos"
      component={MisPrestamosScreen}
      options={{ title: 'Mis Préstamos' }}
    />
    <Stack.Screen
      name="DetallePrestamo"
      component={DetallePrestamoScreen}
      options={{ title: 'Detalle del Préstamo' }}
    />
    <Stack.Screen
      name="VerPagare"
      component={VerPagareScreen}
      options={{ title: 'Ver Pagaré Firmado' }}
    />
    <Stack.Screen
      name="DetalleCuotas"
      component={DetalleCuotasScreen}
      options={{ title: 'Cuotas Pendientes' }}
    />
    <Stack.Screen
      name="RegistrarPago"
      component={RegistrarPagoScreen}
      options={{ title: 'Registrar Pago' }}
    />
  </Stack.Navigator>
);

const CobradorNavigator = () => {
  const { logout } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'account-multiple' : 'account-multiple-outline';
          } else if (route.name === 'Préstamos') {
            iconName = focused ? 'cash-multiple' : 'cash-multiple';
          }

          return <Icon name={iconName} size={focused ? 28 : 24} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#9e9e9e',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerStyle: {
          backgroundColor: '#6200ee',
          elevation: 8,
          shadowColor: '#6200ee',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => (
          <IconButton 
            icon="logout" 
            iconColor="#ffffff"
            size={24}
            onPress={logout} 
          />
        ),
      })}
    >
      <Tab.Screen 
        name="Inicio" 
        component={CobradorHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="Clientes" component={ClientesStack} />
      <Tab.Screen name="Préstamos" component={PrestamosStack} />
    </Tab.Navigator>
  );
};

export default CobradorNavigator;
