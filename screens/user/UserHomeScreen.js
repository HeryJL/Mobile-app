import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Marker, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [savedRoute, setSavedRoute] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(true); // Contrôle la visibilité des détails
  const mapRef = useRef(null);

  // Récupérer la position actuelle de l'utilisateur au montage
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'L’application a besoin de votre position pour afficher la carte.');
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
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      }
    })();
  }, []);

  // Mettre à jour l'itinéraire sauvegardé lorsque les paramètres de navigation changent
  useEffect(() => {
    if (route.params?.savedRoute) {
      setSavedRoute(route.params.savedRoute);
      // Ajuster la carte pour afficher les deux marqueurs et le trajet
      if (
        mapRef.current &&
        route.params.savedRoute.departureCoordinates &&
        route.params.savedRoute.arrivalCoordinates
      ) {
        const coordinates = [
          route.params.savedRoute.departureCoordinates,
          route.params.savedRoute.arrivalCoordinates,
        ];
        // Inclure les coordonnées du trajet pour un zoom optimal
        if (route.params.savedRoute.routeCoordinates?.length > 0) {
          coordinates.push(...route.params.savedRoute.routeCoordinates);
        }
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
          animated: true,
        });
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

  // Naviguer vers MapScreen pour modifier l'itinéraire
  const handleEditRoute = () => {
    if (savedRoute) {
      navigation.navigate('MapScreen', { route: savedRoute });
    } else {
      Alert.alert('Erreur', 'Aucun itinéraire sauvegardé à modifier.');
    }
  };

  // Supprimer l'itinéraire sauvegardé
  const handleClearRoute = () => {
    Alert.alert(
      'Supprimer l’itinéraire',
      'Voulez-vous vraiment supprimer cet itinéraire ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => {
            setSavedRoute(null);
            setShowRouteDetails(true); // Réinitialiser l'affichage
            if (location && mapRef.current) {
              mapRef.current.animateToRegion(location, 1000);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Basculer l'affichage des détails de l'itinéraire
  const toggleRouteDetails = () => {
    setShowRouteDetails(!showRouteDetails);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* En-tête minimisé */}
      <View style={styles.headerContainer}>
        <Text style={styles.greetingText}>Bonjour, prêt à rouler ?</Text>
      </View>
      {/* Section de la carte */}
      <View style={styles.mapSection}>
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
            >
              <Callout>
                <Text>Votre position actuelle</Text>
              </Callout>
            </Marker>
          )}
          {/* Marqueurs et polyligne pour l'itinéraire sauvegardé */}
          {savedRoute && (
            <>
              <Marker
                coordinate={savedRoute.departureCoordinates}
                title="Départ"
                description={savedRoute.departure}
                pinColor="green"
              >
                <Callout>
                  <Text style={styles.calloutTitle}>Départ</Text>
                  <Text>{savedRoute.departure}</Text>
                </Callout>
              </Marker>
              <Marker
                coordinate={savedRoute.arrivalCoordinates}
                title="Arrivée"
                description={savedRoute.arrival}
                pinColor="red"
              >
                <Callout>
                  <Text style={styles.calloutTitle}>Arrivée</Text>
                  <Text>{savedRoute.arrival}</Text>
                </Callout>
              </Marker>
              {savedRoute.routeCoordinates?.length > 0 ? (
                <Polyline
                  coordinates={savedRoute.routeCoordinates}
                  strokeColor="#0000FF"
                  strokeWidth={4} // Plus épais pour plus de visibilité
                />
              ) : (
                // Ligne droite si routeCoordinates est vide
                <Polyline
                  coordinates={[savedRoute.departureCoordinates, savedRoute.arrivalCoordinates]}
                  strokeColor="#0000FF"
                  strokeWidth={4}
                  strokeDashPattern={[10, 10]} // Ligne en pointillés pour indiquer un trajet approximatif
                />
              )}
            </>
          )}
        </MapView>
        {/* Affichage des détails de l'itinéraire (masquable) */}
        {savedRoute && showRouteDetails && (
          <View style={styles.routeDetails}>
            <Text style={styles.routeText}>Départ: {savedRoute.departure}</Text>
            <Text style={styles.routeText}>Arrivée: {savedRoute.arrival}</Text>
            <Text style={styles.routeText}>Distance: {savedRoute.distance} km</Text>
            <View style={styles.routeActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditRoute}>
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearRoute}>
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Bouton pour masquer/afficher les détails */}
        {savedRoute && (
          <TouchableOpacity style={styles.toggleButton} onPress={toggleRouteDetails}>
            <Text style={styles.buttonText}>{showRouteDetails ? 'Masquer' : 'Afficher'} Détails</Text>
          </TouchableOpacity>
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
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  mapSection: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 5,
  },
  map: {
    flex: 1,
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
  routeDetails: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
  },
  routeText: {
    fontSize: 16,
    marginBottom: 5,
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
});

export default UserHomeScreen;