import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DriverHomeScreen = () => {
  const { user } = useContext(AuthContext);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeToPickup, setRouteToPickup] = useState([]);
  const [routeToDestination, setRouteToDestination] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coordonnées fictives (à remplacer si nécessaire)
  const pickupPoint = { latitude: -19.8625, longitude: 47.0302 }; // point de départ du client
  const dropoffPoint = { latitude: -19.8712, longitude: 47.0377 }; // point d'arrivée du client

  const getDriverLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Activez la localisation.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setDriverLocation(current);
      return current;
    } catch (error) {
      Alert.alert('Erreur GPS', error.message);
    }
  };

  const getRoute = async (from, to) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
      const res = await axios.get(url);
      const coords = res.data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
      return coords;
    } catch (err) {
      Alert.alert('Erreur', 'Itinéraire non disponible');
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      const current = await getDriverLocation();
      if (current) {
        const pathToPickup = await getRoute(current, pickupPoint);
        const pathToDropoff = await getRoute(pickupPoint, dropoffPoint);
        setRouteToPickup(pathToPickup);
        setRouteToDestination(pathToDropoff);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue {user?.firstName || 'Conducteur'}</Text>

        {loading || !driverLocation ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation
            >
              
              <Marker
                coordinate={pickupPoint}
                title="Départ client"
                description="Lieu de départ"
                pinColor="orange"
              />
              <Marker
                coordinate={dropoffPoint}
                title="Arrivée client"
                description="Destination finale"
                pinColor="red"
              />
              <Polyline coordinates={routeToPickup} strokeColor="blue" strokeWidth={4} />
              <Polyline coordinates={routeToDestination} strokeColor="purple" strokeWidth={4} />
            </MapView>
          </View>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={async () => {
            setLoading(true);
            const current = await getDriverLocation();
            if (current) {
              const pathToPickup = await getRoute(current, pickupPoint);
              const pathToDropoff = await getRoute(pickupPoint, dropoffPoint);
              setRouteToPickup(pathToPickup);
              setRouteToDestination(pathToDropoff);
            }
            setLoading(false);
          }}
        >
          <Text style={styles.refreshText}>↻ Rafraîchir</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  mapContainer: { width: '100%', height: 600, borderRadius: 10, overflow: 'hidden' },
  map: { flex: 1 },
  refreshButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  refreshText: { color: '#fff', fontWeight: 'bold' },
});

export default DriverHomeScreen;
