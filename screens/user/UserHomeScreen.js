import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const [location, setLocation] = useState(null);
  const [savedRoute, setSavedRoute] = useState(null);
  const mapRef = useRef(null);

  // Récupérer la position actuelle de l'utilisateur au montage
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'application a besoin de votre position pour afficher la carte.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setLocation(userLocation);

      // Centrer la carte sur la position de l'utilisateur
      if (mapRef.current) {
        mapRef.current.animateToRegion(userLocation, 1000);
      }
    })();
  }, []);

  // Mettre à jour l'itinéraire sauvegardé lorsque les paramètres de navigation changent
  useEffect(() => {
    if (route.params?.savedRoute) {
      setSavedRoute(route.params.savedRoute);
      // Ajuster la carte pour afficher les deux marqueurs de l'itinéraire
      if (mapRef.current && route.params.savedRoute.departureCoordinates && route.params.savedRoute.arrivalCoordinates) {
        mapRef.current.fitToCoordinates(
          [route.params.savedRoute.departureCoordinates, route.params.savedRoute.arrivalCoordinates],
          {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          }
        );
      }
    }
  }, [route.params]);

  // Région par défaut si la position n'est pas disponible
  const fallbackRegion = {
    latitude: 48.8566, // Paris
    longitude: 2.3522,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const initialRegion = location || fallbackRegion;

  // Recentrer la carte sur la position de l'utilisateur
  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(location, 1000);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* En-tête */}
      <View style={styles.headerContainer}>
        <Text style={styles.greetingText}>Bonjour,\nBesoin de prendre la route ?</Text>
        {/* Onglets */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tabActive}>
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>📍</Text>
              <Text style={styles.tabText}>Réserver</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabInactive}>
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>🚗</Text>
              <Text style={styles.tabText}>Véhicules</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* Section de la carte */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Réserver une course</Text>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          customMapStyle={[]}
        >
          {/* Marqueur pour la position actuelle si aucun itinéraire n'est sauvegardé */}
          {!savedRoute && location && (
            <Marker
              coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
              title="Votre position"
              pinColor="blue"
            />
          )}
          {/* Marqueurs et polyligne pour l'itinéraire sauvegardé */}
          {savedRoute && (
            <>
              <Marker
                coordinate={savedRoute.departureCoordinates}
                title="Départ"
                description={savedRoute.departure}
                pinColor="green"
              />
              <Marker
                coordinate={savedRoute.arrivalCoordinates}
                title="Arrivée"
                description={savedRoute.arrival}
                pinColor="red"
              />
              {savedRoute.routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={savedRoute.routeCoordinates}
                  strokeColor="#0000FF"
                  strokeWidth={3}
                />
              )}
            </>
          )}
        </MapView>
        {/* Affichage de la distance si un itinéraire est sauvegardé */}
        {savedRoute && savedRoute.distance && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>Distance: {savedRoute.distance} km</Text>
          </View>
        )}
        {/* Bouton Recentrer */}
        <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
          <Text style={styles.recenterButtonText}>Recentrer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#60a5fa',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabInactive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  mapSection: {
    marginHorizontal: 20,
    marginTop: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    minHeight: 400,
    borderRadius: 10,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#60a5fa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  recenterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserHomeScreen;