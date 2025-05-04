import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserRouteScreen from '../screens/user/UserRouteScreen';
import UserProfileScreen from '../screens/user/UserProfilScreen';
import RideHistoryScreen from '../screens/user/RideHistoryScreen'; // New screen
import MapScreen from '../screens/user/Mapscreen'; // New screen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Accueil') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Itinéraire') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Historique') {
          iconName = focused ? 'time' : 'time-outline';
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
      headerShown: false,
    })}
  >
    <Tab.Screen name="Accueil" component={UserHomeScreen} />
    <Tab.Screen name="Itinéraire" component={UserRouteScreen} />
    <Tab.Screen name="Historique" component={RideHistoryScreen} />
    <Tab.Screen name="Profil" component={UserProfileScreen} />
  </Tab.Navigator>
);

const UserTabNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MapScreen"
      component={MapScreen}
      options={{ title: 'Carte' }}
    />
  </Stack.Navigator>
);

export default UserTabNavigator;