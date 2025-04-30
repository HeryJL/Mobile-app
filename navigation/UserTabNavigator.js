import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserRouteScreen from '../screens/user/UserRouteScreen';
import UserProfileScreen from '../screens/user/UserProfilScreen';
import MapScreen from '../screens/user/Mapscreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Onglets visibles
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Accueil') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Itinéraire') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Profil') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#9CA3AF',
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
      headerShown: false, // Masquer l’en-tête dans les tabs
    })}
  >
    <Tab.Screen name="Accueil" component={UserHomeScreen} />
    <Tab.Screen name="Itinéraire" component={UserRouteScreen} />
    <Tab.Screen name="Profil" component={UserProfileScreen} />
  </Tab.Navigator>
);

// Stack principal (englobe les tabs + écrans externes)
const UserTabNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={TabNavigator}
      options={{ headerShown: false }} // Masque uniquement le header du screen tab
    />
    <Stack.Screen
      name="MapScreen"
      component={MapScreen}
      options={{ title: 'Carte' }} // Affiche un header ici si besoin
    />
  </Stack.Navigator>
);

export default UserTabNavigator;
