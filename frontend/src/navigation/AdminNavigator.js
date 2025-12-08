// Navegación para administradores
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';

// Pantallas Admin
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UsuariosScreen from '../screens/admin/UsuariosScreen';
import CrearUsuarioScreen from '../screens/admin/CrearUsuarioScreen';
import EditarUsuarioScreen from '../screens/admin/EditarUsuarioScreen';
import ClientesScreen from '../screens/admin/ClientesScreen';
import CrearClienteScreen from '../screens/admin/CrearClienteScreen';
import EditarClienteScreen from '../screens/admin/EditarClienteScreen';
import PrestamosScreen from '../screens/admin/PrestamosScreen';
import CrearPrestamoScreen from '../screens/admin/CrearPrestamoScreen';
import PagareScreen from '../screens/admin/PagareScreen';
import VerPagareScreen from '../screens/admin/VerPagareScreen';
import DetallePrestamoScreen from '../screens/admin/DetallePrestamoScreen';
import ConfiguracionScreen from '../screens/admin/ConfiguracionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack de Inicio con Configuración
const InicioStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="InicioHome"
      component={AdminHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Configuracion"
      component={ConfiguracionScreen}
      options={{ title: 'Configuración' }}
    />
  </Stack.Navigator>
);

// Stack de Usuarios
const UsuariosStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ListaUsuarios"
      component={UsuariosScreen}
      options={{ title: 'Usuarios' }}
    />
    <Stack.Screen
      name="CrearUsuario"
      component={CrearUsuarioScreen}
      options={{ title: 'Crear Usuario' }}
    />
    <Stack.Screen
      name="EditarUsuario"
      component={EditarUsuarioScreen}
      options={{ title: 'Editar Usuario' }}
    />
  </Stack.Navigator>
);

// Stack de Clientes
const ClientesStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ListaClientes"
      component={ClientesScreen}
      options={{ title: 'Clientes' }}
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
  </Stack.Navigator>
);

// Stack de Préstamos
const PrestamosStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ListaPrestamos"
      component={PrestamosScreen}
      options={{ title: 'Préstamos' }}
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
    <Stack.Screen
      name="VerPagare"
      component={VerPagareScreen}
      options={{ title: 'Ver Pagaré Firmado' }}
    />
    <Stack.Screen
      name="DetallePrestamo"
      component={DetallePrestamoScreen}
      options={{ title: 'Detalle del Préstamo' }}
    />
  </Stack.Navigator>
);

const AdminNavigator = () => {
  const { logout } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Usuarios') {
            iconName = focused ? 'account-group' : 'account-group-outline';
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
        component={InicioStack}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="Usuarios" component={UsuariosStack} />
      <Tab.Screen name="Clientes" component={ClientesStack} />
      <Tab.Screen name="Préstamos" component={PrestamosStack} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
