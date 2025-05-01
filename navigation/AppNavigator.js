import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen'; // Utilisez l'écran de connexion unique
import DriverTabNavigator from './DriverTabNavigator';
import { AuthContext } from '../context/AuthContext';
import UserTabNavigator from './UserTabNavigator';
import SignupScreen from '../screens/auth/SignupcScreen';
import ForgotPasswordScreen from '../screens/auth/ForgetPasswordScreen';


const Stack = createStackNavigator();

// Conteneur pour l'écran de connexion unique
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      {/* Vous pouvez ajouter d'autres écrans d'inscription ici */}
    </Stack.Navigator>
  );
};




// Gestion générale de la navigation
const AppNavigator = () => {
  const { user, userType } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.safeArea}>
        {user ? (
          userType === 'driver' ? (
            <DriverTabNavigator />
          ) : (
            <UserTabNavigator/>
          )
        ) : (
          <AuthNavigator />
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AppNavigator;