import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialIcons';

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [savedRoute, setSavedRoute] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const mapRef = useRef(null);

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

  useEffect(() => {
    console.log('Route params in UserHomeScreen:', route.params);
    if (route.params?.savedRoute) {
      const { savedRoute } = route.params;
      console.log('Saved route in UserHomeScreen:', savedRoute);

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
        reservation: savedRoute.reservation || null,
      };

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

  const fallbackRegion = {
    latitude: -18.8792,
    longitude: 47.5079,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const initialRegion = location || fallbackRegion;

  const handleEditRoute = () => {
    if (savedRoute) {
      navigation.navigate('MapScreen', { route: savedRoute });
    } else {
      Alert.alert('Erreur', 'Aucun itinéraire sauvegardé à modifier.');
    }
  };

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
            setShowRouteDetails(false);
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

  const handlePartir = () => {
    navigation.navigate('MainTabs', { screen: 'Itinéraire' });
  };

  const toggleRouteDetails = () => {
    setShowRouteDetails(!showRouteDetails);
  };

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

  const handleMarkerPress = (type) => {
    console.log(`${type} marker pressed`);
  };

  const handleCalloutPress = (type) => {
    console.log(`${type} callout pressed`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Icon name="map" size={24} color="#fff" style={styles.headerIcon} />
          <Text style={styles.greetingText}>Bonjour, prêt à rouler ?</Text>
        </View>
        <TouchableOpacity style={styles.partirButton} onPress={handlePartir}>
          <Icon name="rocket" size={20} color="#fff" style={styles.partirButtonIcon} />
          <Text style={styles.partirButtonText}>Partir</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapSection}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          customMapStyle={[]}
          key={savedRoute ? savedRoute.id : 'no-route'}
          showsUserLocation={true}
          showsMyLocationButton={true}
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
                    strokeColor="#1e90ff"
                    strokeWidth={4}
                  />
                ) : (
                  <Polyline
                    coordinates={[savedRoute.departureCoordinates, savedRoute.arrivalCoordinates]}
                    strokeColor="#1e90ff"
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
            {savedRoute.reservation && (
              <>
                <Text style={styles.reservationText}>
                  Réservation: Taxi {savedRoute.reservation.model} ({savedRoute.reservation.licensePlate})
                </Text>
                <Text style={styles.reservationText}>
                  Chauffeur: {savedRoute.reservation.driverName}
                </Text>
              </>
            )}
            <View style={styles.routeActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditRoute}>
                <Icon name="edit" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearRoute}>
                <Icon name="delete" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {savedRoute && (
          <TouchableOpacity style={styles.toggleButton} onPress={toggleRouteDetails}>
            <Icon
              name={showRouteDetails ? 'visibility-off' : 'visibility'}
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {showRouteDetails ? 'Masquer' : 'Afficher'} Détails
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  partirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  partirButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  partirButtonIcon: {
    marginRight: 4,
  },
  mapSection: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
    borderRadius: 12,
  },
  routeDetails: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  reservationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: '38%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
});

export default UserHomeScreen;