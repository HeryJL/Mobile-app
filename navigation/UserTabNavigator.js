import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserRouteScreen from '../screens/user/UserRouteScreen'; // Assurez-vous que ce fichier existe
import UserProfileScreen from '../screens/user/UserProfilScreen';
import MapScreen from '../screens/user/Mapscreen';
import { createStackNavigator } from '@react-navigation/stack';
// Assurez-vous que ce fichier existe

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const UserTabNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="UserTab">
                {() => (
                    <Tab.Navigator
                        screenOptions={({ route }) => ({
                            headerShown: false,
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
                        })}
                    >
                        <Tab.Screen name="Accueil" component={UserHomeScreen} />
                        <Tab.Screen name="Itinéraire" component={UserRouteScreen} />
                        <Tab.Screen name="Profil" component={UserProfileScreen} />
                    </Tab.Navigator>
                )}
            </Stack.Screen>
            <Stack.Screen name="MapScreen" component={MapScreen} />
        </Stack.Navigator>
    );
};

export default UserTabNavigator;
