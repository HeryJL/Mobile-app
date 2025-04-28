import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Ou 'react-native-vector-icons/Ionicons' si sans Expo
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import RideRequestsScreen from '../screens/driver/RideRequestsScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

const Tab = createBottomTabNavigator();

const DriverTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Demandes') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',   // Bleu moderne
        tabBarInactiveTintColor: '#9CA3AF', // Gris clair
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Accueil" component={DriverHomeScreen} />
      <Tab.Screen name="Demandes" component={RideRequestsScreen} />
      <Tab.Screen name="Profil" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
