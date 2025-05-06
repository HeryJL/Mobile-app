import React, { useState, useEffect, useRef, useContext } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../../context/AuthContext';
import { getNearbyTaxis } from '../../services/location.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { savedRoute, updateSavedRoute } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [taxis,setTaxis] = useState(null)
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const mapRef = useRef(null);

  // Configurer les notifications
  useEffect(() => {
    const setupNotifications = async () => {
      if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Erreur', 'Les permissions pour les notifications sont requises.');
        return;
      }
    };

    setupNotifications();
  }, []);

  // Obtenir la position de l'utilisateur
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
        console.log('User Location:', userLocation); // Log pour déboguer
        setLocation(userLocation);

        if (mapRef.current) {
          mapRef.current.animateToRegion(userLocation, 1000);
        }
        const updateTaxiLocation = async () => {
            const tax = await getNearbyTaxis(47.90, -18.90, 2);
            const mockTaxis = tax.map(taxi => (
              {
                _id: taxi._id,
                driverId: { name: taxi.taxiId.driverId.name, phone: taxi.taxiId.driverId.phone },
                licensePlate: taxi.taxiId.licensePlate,
                model: taxi.taxiId.model,
                color: taxi.taxiId.color,
                status: taxi.taxiId.status,
                coordinates: { 
                  latitude: taxi.location.coordinates[1], 
                  longitude: taxi.location.coordinates[0] 
                },
              }
            ))          
            setTaxis(mockTaxis)
          }
          updateTaxiLocation(); // appel initial
          intervalId = setInterval(updateTaxiLocation, 5000); // toutes les 10s
          return () => clearInterval(intervalId);
        
      } catch (error) {
        console.error('Erreur de localisation:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      }
    })();
  }, []);

  // Fonction pour envoyer une notification locale
  const sendLocalNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification.');
    }
  };

  // Calculer la distance entre deux coordonnées
  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;
    const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en mètres
  };

  // Simuler la position du chauffeur
  useEffect(() => {
    if (savedRoute && savedRoute.reservation && savedRoute.reservation.status === 'confirmed') {
      const taxi = taxis.find(t => t._id === savedRoute.reservation.taxiId);
      if (taxi) {
        setDriverLocation(taxi.coordinates);
        console.log('Driver Location:', taxi.coordinates); // Log pour déboguer

        // Simuler le déplacement du chauffeur vers la destination
        const interval = setInterval(() => {
          setDriverLocation(prev => {
            if (!prev || !savedRoute.arrivalCoordinates) return prev;

            // Calculer la distance restante
            const distance = calculateDistance(prev, savedRoute.arrivalCoordinates);
            if (distance < 50) { // Seuil de 50 mètres
              clearInterval(interval);
              sendLocalNotification(
                'Chauffeur arrivé',
                `Votre chauffeur ${savedRoute.reservation.driverName} est arrivé à votre destination.`
              );
              Alert.alert('Arrivée', 'Votre chauffeur est arrivé à votre destination.');
              updateSavedRoute(null); // Supprimer le trajet
              return prev;
            }

            // Simuler un déplacement progressif
            const speed = 0.0001; // Ajuster pour simuler la vitesse
            const deltaLat = (savedRoute.arrivalCoordinates.latitude - prev.latitude) * speed;
            const deltaLon = (savedRoute.arrivalCoordinates.longitude - prev.longitude) * speed;

            return {
              latitude: prev.latitude + deltaLat,
              longitude: prev.longitude + deltaLon,
            };
          });
        }, 1000); // Mettre à jour toutes les secondes

        return () => clearInterval(interval);
      }
    } else {
      setDriverLocation(null);
    }
  }, [savedRoute]);

  // Mettre à jour la carte pour inclure la position du chauffeur
  useEffect(() => {
    if (savedRoute && mapRef.current) {
      console.log('Saved Route Coordinates:', savedRoute); // Log pour déboguer
      const coordinates = [
        savedRoute.departureCoordinates,
        savedRoute.arrivalCoordinates,
      ];
      if (savedRoute.routeCoordinates.length > 0) {
        coordinates.push(...savedRoute.routeCoordinates);
      }
      if (driverLocation) {
        coordinates.push(driverLocation);
      }
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
        animated: true,
      });
    } else if (location && mapRef.current) {
      mapRef.current.animateToRegion(location, 1000);
    }
  }, [savedRoute, location, driverLocation]);

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
            updateSavedRoute(null);
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
    return (
      coord &&
      typeof coord.latitude === 'number' &&
      typeof coord.longitude === 'number' &&
      !isNaN(coord.latitude) &&
      !isNaN(coord.longitude)
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Icon name="map" size={24} color="#fff" style={styles.headerIcon} />
          <Text style={styles.greetingText}>Bonjour, prêt à rouler ?</Text>
          {savedRoute && savedRoute.reservation && savedRoute.reservation.status === 'confirmed' && (
            <Text style={styles.taxiStatusText}>{"\n"}Votre taxi arrive, veuillez patienter un peu</Text>
          )}
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
          {/* Marqueur pour la position de l'utilisateur */}
          {!savedRoute && location && isValidCoordinate(location) && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              pinColor="blue"
              title="Votre position"
              description={`Lat: ${location.latitude.toFixed(6)}, Lon: ${location.longitude.toFixed(6)}`}
            />
          )}

          {/* Marqueurs pour le trajet (départ, arrivée, chauffeur) */}
          {savedRoute ?
            isValidCoordinate(savedRoute.departureCoordinates) &&
            isValidCoordinate(savedRoute.arrivalCoordinates) && (
              <>
                <Marker
                  coordinate={savedRoute.departureCoordinates}
                  pinColor="green"
                  title="Départ"
                  description={savedRoute.departure || 'Point de départ'}
                />
                <Marker
                  coordinate={savedRoute.arrivalCoordinates}
                  pinColor="red"
                  title="Arrivée"
                  description={savedRoute.arrival || 'Point d’arrivée'}
                />
                {driverLocation && isValidCoordinate(driverLocation) && (
                  <Marker
                    coordinate={driverLocation}
                    pinColor="yellow"
                    title="Chauffeur"
                    description={`${savedRoute.reservation.driverName}\nModèle: ${savedRoute.reservation.model}\nPlaque: ${savedRoute.reservation.licensePlate}`}
                  />
                )}
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
            ):(
              taxis && taxis.map(taxi => (
                <Marker
                coordinate={{ latitude: taxi.coordinates.latitude, longitude: taxi.coordinates.longitude }}
                pinColor={taxi.status === "disponible" ? "vert":"yellow"}
                title= {taxi.licensePlate}
                description={`chauffeur:${taxi.driverId.name}`}
              />
              ))
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
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        savedRoute.reservation.status === 'confirmed'
                          ? '#4CAF50'
                          : '#FFA500',
                    },
                  ]}
                >
                  Statut: {savedRoute.reservation.status === 'confirmed' ? 'Confirmé' : 'En attente de confirmation'}
                </Text>
              </>
            )}
            {savedRoute.reservation && savedRoute.reservation.status === 'pending' && (
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
            )}
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
  taxiStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#471',
    marginLeft: 10,
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
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    backgroundColor: '#60a5fa',
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
});

export default UserHomeScreen;