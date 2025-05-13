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
import { getRideAccepte, getRideAttente } from './../../services/ride.service';
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
  const [taxiAccepte, setTaxiAccepte] = useState([])
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const mapRef = useRef(null);
  const { userToken} = useContext(AuthContext)

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

   useEffect(() => {
      let intervalIds;
      const taxiAttent = async () => {
        try {
          const dataAccepte = await getRideAttente(userToken);
          const updatedData = {
            departure:dataAccepte.startLocation.destination,
            departureCoordinates: { latitude:dataAccepte.startLocation.coordinates[1],
            longitude:dataAccepte.startLocation.coordinates[0] },
            arrival: dataAccepte.endLocation.destination,
            arrivalCoordinates: { latitude:dataAccepte.endLocation.coordinates[1],
               longitude:dataAccepte.endLocation.coordinates[0] },
            distance:dataAccepte.distanceKm,
            reservation: {
              taxiId: dataAccepte.taxiId._id,
              driverName: dataAccepte.taxiId.driverId.name,
              licensePlate: dataAccepte.taxiId.licensePlate,
              model: dataAccepte.taxiId.model,
              color: dataAccepte.taxiId.color,
              status: dataAccepte.status,
              price:dataAccepte.price 
            },
          }
          if(dataAccepte) {
            setTaxiAccepte(updatedData)
            set
          } else {
            setTaxiAccepte(null)
          }
        } catch (err) {
          console.error('Erreur envoi position:', Idtaxi);
        }
      };
  
      const taxiAccepte = async () => {
        try {
          const dataAccepte = await getRideAccepte(userToken);
          const updatedData = {
            departure:dataAccepte.startLocation.destination,
            departureCoordinates: { latitude:dataAccepte.startLocation.coordinates[1],
            longitude:dataAccepte.startLocation.coordinates[0] },
            arrival: dataAccepte.endLocation.destination,
            arrivalCoordinates: { latitude:dataAccepte.endLocation.coordinates[1],
            ongitude:dataAccepte.endLocation.coordinates[0] },
            distance:dataAccepte.distanceKm,
            reservation: {
              taxiId: dataAccepte.taxiId._id,
              driverName: dataAccepte.taxiId.driverId.name,
              licensePlate: dataAccepte.taxiId.licensePlate,
              model: dataAccepte.taxiId.model,
              color: dataAccepte.taxiId.color,
              status: dataAccepte.status,
              price:dataAccepte.price 
            },
          }
          dataAccepte ? setTaxiAccepte(updatedData):setTaxiAccepte(null)
        } catch (err) {
          console.error('Erreur envoi position:', Idtaxi);
        }
      };
      taxiAttent();
      taxiAccepte(); // appel initial
      intervalIds = setInterval(taxiAccepte, 2000);
  
      return () => clearInterval(intervalIds);
    });

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
    if (taxiAccepte && taxiAccepte.reservation && taxiAccepte.reservation.status === 'en cours') {
      //const taxi = taxis.find(t => t._id === taxiAccepte.reservation.taxiId);
      if (taxiAccepte.reservation.status === 'en cours') {
        setDriverLocation(taxiAccepte.coordinates);
        console.log('Driver Location:', taxiAccepte.coordinates); // Log pour déboguer

        // Simuler le déplacement du chauffeur vers la destination
        const interval = setInterval(() => {
          setDriverLocation(prev => {
            if (!prev || !taxiAccepte.arrivalCoordinates) return prev;

            // Calculer la distance restante
            const distance = calculateDistance(prev,taxiAccepte.arrivalCoordinates);
            if (distance < 50) { // Seuil de 50 mètres
              clearInterval(interval);
              sendLocalNotification(
                'Chauffeur arrivé',
                `Votre chauffeur ${taxiAccepte.reservation.driverName} est arrivé à votre destination.`
              );
              Alert.alert('Arrivée', 'Votre chauffeur est arrivé à votre destination.');
              updateSavedRoute(null); // Supprimer le trajet
              return prev;
            }

            // Simuler un déplacement progressif
            const speed = 0.0001; // Ajuster pour simuler la vitesse
            const deltaLat = (taxiAccepte.arrivalCoordinates.latitude - prev.latitude) * speed;
            const deltaLon = (taxiAccepte.arrivalCoordinates.longitude - prev.longitude) * speed;

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
  }, [taxiAccepte]);

  // Mettre à jour la carte pour inclure la position du chauffeur
  useEffect(() => {
    if (taxiAccepte && mapRef.current) {
      console.log('Saved Route Coordinates:',taxiAccepte); // Log pour déboguer
      const coordinates = [
       taxiAccepte.departureCoordinates,
       taxiAccepte.arrivalCoordinates,
      ];
      // if (savedRoute.routeCoordinates.length > 0) {
      //   coordinates.push(...savedRoute.routeCoordinates);
      // }
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
  }, [taxiAccepte, location, driverLocation]);

  const fallbackRegion = {
    latitude: -18.8792,
    longitude: 47.5079,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const initialRegion = location || fallbackRegion;

  const handleEditRoute = () => {
    if (taxiAccepte) {
      navigation.navigate('MapScreen', { route:taxiAccepte });
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
          {taxiAccepte && taxiAccepte.status === 'en cours' && (
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
          key={taxiAccepte ? taxiAccepte.id : 'no-route'}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Marqueur pour la position de l'utilisateur */}
          {!taxiAccepte && location && isValidCoordinate(location) && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              pinColor="blue"
              title="Votre position"
              description={`Lat: ${location.latitude.toFixed(6)}, Lon: ${location.longitude.toFixed(6)}`}
            />
          )}

          {/* Marqueurs pour le trajet (départ, arrivée, chauffeur) */}
          {taxiAccepte.length !== 0  ?
            isValidCoordinate(taxiAccepte.departureCoordinates) &&
            isValidCoordinate(taxiAccepte.arrivalCoordinates) && (
              <>
                <Marker
                  coordinate={taxiAccepte.departureCoordinates}
                  pinColor="green"
                  title="Départ"
                  description={taxiAccepte.departure || 'Point de départ'}
                />
                <Marker
                  coordinate={taxiAccepte.arrivalCoordinates}
                  pinColor="red"
                  title="Arrivée"
                  description={taxiAccepte.arrival || 'Point d’arrivée'}
                />
                {driverLocation && isValidCoordinate(driverLocation) && (
                  <Marker
                    coordinate={driverLocation}
                    pinColor="yellow"
                    title="Chauffeur"
                    description={`${taxiAccepte.reservation.driverName}\nModèle: ${taxiAccepte.reservation.model}\nPlaque: ${taxiAccepte.reservation.licensePlate}`}
                  />
                )}
                {/* {Array.isArray(savedRoute.routeCoordinates) &&
               savedRoute.routeCoordinates.length > 0 &&
               savedRoute.routeCoordinates.every(isValidCoordinate) ? (
                  <Polyline
                    coordinates={savedRoute.routeCoordinates}
                    strokeColor="#1e90ff"
                    strokeWidth={4}
                  />
                ) : (
                  <Polyline
                    coordinates={[taxiAccepte.departureCoordinates,taxiAccepte.arrivalCoordinates]}
                    strokeColor="#1e90ff"
                    strokeWidth={4}
                    strokeDashPattern={[10, 10]}
                  />
                )} */}
              </>
            ):(
              taxis && taxis.map(taxi => (
                <Marker
                coordinate={{ latitude: taxi.coordinates.latitude, longitude: taxi.coordinates.longitude }}
                pinColor={taxi.status === "disponible" ? "green":"yellow"}
                title= {taxi.licensePlate}
                description={`chauffeur:${taxi.driverId.name}`}
              />
              ))
           )}
        </MapView>
        {taxiAccepte.length !== 0  && showRouteDetails && (
          <View style={styles.routeDetails}>
            <Text style={styles.routeText}>Départ: {taxiAccepte.departure || 'Non spécifié'}</Text>
            <Text style={styles.routeText}>Arrivée: {taxiAccepte.arrival || 'Non spécifié'}</Text>
            <Text style={styles.routeText}>Distance: {taxiAccepte.distance || 'Non calculée'} km</Text>
            {taxiAccepte.reservation && (
              <>
                <Text style={styles.reservationText}>
                  Réservation: Taxi {taxiAccepte.reservation.model} ({taxiAccepte.reservation.licensePlate})
                </Text>
                <Text style={styles.reservationText}>
                  Chauffeur: {taxiAccepte.reservation.driverName}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                       taxiAccepte.reservation.status === 'en cours'
                          ? '#4CAF50'
                          : '#FFA500',
                    },
                  ]}
                >
                  Statut: {taxiAccepte.reservation.status === 'en cours' ? 'Confirmé' : 'En attente de confirmation'}
                </Text>
              </>
            )}
            {taxiAccepte.reservation &&taxiAccepte.reservation.status === 'en attente' && (
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
        {taxiAccepte.length !== 0 && (
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