// Navegación principal de la aplicación
import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

// Pantallas
import LoginScreen from '../screens/LoginScreen';
import AdminNavigator from './AdminNavigator';
import CobradorNavigator from './CobradorNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!usuario ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : usuario.rol === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="Cobrador" component={CobradorNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
