import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [savedRoute, setSavedRoute] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
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
          latitude: parseFloat(currentLocation.coords.latitude),
          longitude: parseFloat(currentLocation.coords.longitude),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setLocation(userLocation);

        if (mapRef.current) {
          mapRef.current.animateToRegion(userLocation, 1000);
        }
      } catch (error) {
        console.error('Erreur de localisation:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      }
    })();
  }, []);

  // Mettre à jour l'itinéraire sauvegardé
  useEffect(() => {
    console.log('Route params in UserHomeScreen:', route.params);
    if (route.params?.savedRoute) {
      const { savedRoute } = route.params;
      console.log('Saved route in UserHomeScreen:', savedRoute);

      // Parse coordinates to ensure they are numbers
      const parsedRoute = {
        ...savedRoute,
        departureCoordinates: {
          latitude: parseFloat(savedRoute.departureCoordinates.latitude),
          longitude: parseFloat(savedRoute.departureCoordinates.longitude),
        },
        arrivalCoordinates: {
          latitude: parseFloat(savedRoute.arrivalCoordinates.latitude),
          longitude: parseFloat(savedRoute.arrivalCoordinates.longitude),
        },
        routeCoordinates: Array.isArray(savedRoute.routeCoordinates)
          ? savedRoute.routeCoordinates.map(coord => ({
              latitude: parseFloat(coord.latitude),
              longitude: parseFloat(coord.longitude),
            }))
          : [],
      };

      // Validate coordinates
      if (
        isValidCoordinate(parsedRoute.departureCoordinates) &&
        isValidCoordinate(parsedRoute.arrivalCoordinates)
      ) {
        console.log('Parsed route set:', parsedRoute);
        setSavedRoute(parsedRoute);
        if (mapRef.current) {
          const coordinates = [
            parsedRoute.departureCoordinates,
            parsedRoute.arrivalCoordinates,
          ];
          if (parsedRoute.routeCoordinates.length > 0) {
            coordinates.push(...parsedRoute.routeCoordinates);
          }
          console.log('Fitting to coordinates:', coordinates);
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
            animated: true,
          });
        }
      } else {
        console.error('Invalid coordinates in savedRoute:', parsedRoute);
        Alert.alert('Erreur', 'Les données de l’itinéraire sont incomplètes.');
      }
    }
  }, [route.params]);

  // Région par défaut : Antananarivo, Madagascar
  const fallbackRegion = {
    latitude: -18.8792,
    longitude: 47.5079,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const initialRegion = location || fallbackRegion;

  // Modifier l'itinéraire
  const handleEditRoute = () => {
    if (savedRoute) {
      navigation.navigate('MapScreen', { route: savedRoute });
    } else {
      Alert.alert('Erreur', 'Aucun itinéraire sauvegardé à modifier.');
    }
  };

  // Supprimer l'itinéraire
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
            setShowRouteDetails(true);
            if (location && mapRef.current) {
              mapRef.current.animateToRegion(location, 1000);
            } else {
              mapRef.current.animateToRegion(fallbackRegion, 1000);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Basculer les détails de l'itinéraire
  const toggleRouteDetails = () => {
    setShowRouteDetails(!showRouteDetails);
  };

  // Vérifier la validité des coordonnées
  const isValidCoordinate = (coord) => {
    const valid = (
      coord &&
      typeof coord.latitude === 'number' &&
      typeof coord.longitude === 'number' &&
      !isNaN(coord.latitude) &&
      !isNaN(coord.longitude)
    );
    console.log('isValidCoordinate:', coord, valid);
    return valid;
  };

  // Gestion des interactions avec les marqueurs
  const handleMarkerPress = (type) => {
    console.log(`${type} marker pressed`);
  };

  const handleCalloutPress = (type) => {
    console.log(`${type} callout pressed`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.greetingText}>Bonjour, prêt à rouler ?</Text>
      </View>
      <View style={styles.mapSection}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          customMapStyle={[]}
          key={savedRoute ? savedRoute.id : 'no-route'}
          showsUserLocation={true} // Show user location dot
          showsMyLocationButton={true} // Show default recenter button
        >
          {!savedRoute && location && isValidCoordinate(location) && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Votre position"
              pinColor="blue"
              onPress={() => handleMarkerPress('User Location')}
            >
              <Callout tooltip onPress={() => handleCalloutPress('User Location')}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>Votre position</Text>
                  <Text>Votre position actuelle</Text>
                </View>
              </Callout>
            </Marker>
          )}
          {savedRoute &&
            isValidCoordinate(savedRoute.departureCoordinates) &&
            isValidCoordinate(savedRoute.arrivalCoordinates) && (
              <>
                <Marker
                  coordinate={savedRoute.departureCoordinates}
                  title="Départ"
                  description={savedRoute.departure || 'Point de départ'}
                  pinColor="green"
                  onPress={() => handleMarkerPress('Departure')}
                >
                  <Callout tooltip onPress={() => handleCalloutPress('Departure')}>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>Départ</Text>
                      <Text>{savedRoute.departure || 'Point de départ'}</Text>
                    </View>
                  </Callout>
                </Marker>
                <Marker
                  coordinate={savedRoute.arrivalCoordinates}
                  title="Arrivée"
                  description={savedRoute.arrival || 'Point d’arrivée'}
                  pinColor="red"
                  onPress={() => handleMarkerPress('Arrival')}
                >
                  <Callout tooltip onPress={() => handleCalloutPress('Arrival')}>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>Arrivée</Text>
                      <Text>{savedRoute.arrival || 'Point d’arrivée'}</Text>
                    </View>
                  </Callout>
                </Marker>
                {Array.isArray(savedRoute.routeCoordinates) &&
                savedRoute.routeCoordinates.length > 0 &&
                savedRoute.routeCoordinates.every(isValidCoordinate) ? (
                  <Polyline
                    coordinates={savedRoute.routeCoordinates}
                    strokeColor="#0000FF"
                    strokeWidth={4}
                  />
                ) : (
                  <Polyline
                    coordinates={[savedRoute.departureCoordinates, savedRoute.arrivalCoordinates]}
                    strokeColor="#0000FF"
                    strokeWidth={4}
                    strokeDashPattern={[10, 10]}
                  />
                )}
              </>
            )}
        </MapView>
        {savedRoute && showRouteDetails && (
          <View style={styles.routeDetails}>
            <Text style={styles.routeText}>Départ: {savedRoute.departure || 'Non spécifié'}</Text>
            <Text style={styles.routeText}>Arrivée: {savedRoute.arrival || 'Non spécifié'}</Text>
            <Text style={styles.routeText}>Distance: {savedRoute.distance || 'Non calculée'} km</Text>
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
        {savedRoute && (
          <TouchableOpacity style={styles.toggleButton} onPress={toggleRouteDetails}>
            <Text style={styles.buttonText}>{showRouteDetails ? 'Masquer' : 'Afficher'} Détails</Text>
          </TouchableOpacity>
        )}
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
    padding: 25,
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
  calloutContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    minWidth: 150,
    alignItems: 'center',
  },
});

export default UserHomeScreen;