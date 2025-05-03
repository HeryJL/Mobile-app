
import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Modal, FlatList, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { AuthContext } from '../../context/AuthContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const mockTaxis = [
  {
    _id: 'taxi1',
    driverId: { name: 'Jean Dupont', phone: '+261 34 123 4567' },
    licensePlate: 'TAXI-123',
    model: 'Toyota Corolla',
    color: 'Jaune',
    status: 'disponible',
    coordinates: { latitude: -18.8792, longitude: 47.5079 },
  },
  {
    _id: 'taxi2',
    driverId: { name: 'Marie Rakoto', phone: '+261 33 987 6543' },
    licensePlate: 'TAXI-456',
    model: 'Peugeot 208',
    color: 'Noir',
    status: 'disponible',
    coordinates: { latitude: -18.8700, longitude: 47.5100 },
  },
  {
    _id: 'taxi3',
    driverId: { name: 'Paul Rabe', phone: '+261 32 555 7890' },
    licensePlate: 'TAXI-789',
    model: 'Hyundai Accent',
    color: 'Bleu',
    status: 'occupé',
    coordinates: { latitude: -18.8850, longitude: 47.5000 },
  },
  {
    _id: 'taxi4',
    driverId: { name: 'Sophie Andria', phone: '+261 34 222 3333' },
    licensePlate: 'TAXI-101',
    model: 'Renault Clio',
    color: 'Blanc',
    status: 'disponible',
    coordinates: { latitude: -18.8750, longitude: 47.5150 },
  },
];

// Configurer le gestionnaire de notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { route: initialRouteData } = route.params || {};
  const { updateSavedRoute } = useContext(AuthContext);

  if (!initialRouteData || (!initialRouteData.departureCoordinates && !initialRouteData.arrivalCoordinates)) {
    console.error("Missing or invalid initial route data");
    useEffect(() => {
      Alert.alert("Erreur de données", "Impossible de charger les informations de l'itinéraire.");
      navigation.goBack();
    }, [navigation]);
    return <View style={styles.container}><Text>Chargement...</Text></View>;
  }

  const [routeData, setRouteData] = useState(initialRouteData);
  const [originalRouteData] = useState(initialRouteData);
  const [distance, setDistance] = useState(initialRouteData.distance || null);
  const [duration, setDuration] = useState(initialRouteData.duration || null); // Ajout de l'état pour la durée
  const [routeCoordinates, setRouteCoordinates] = useState(initialRouteData.routeCoordinates || []);
  const [editingMode, setEditingMode] = useState(null);
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState(null);
  const [isTaxiModalVisible, setIsTaxiModalVisible] = useState(false);
  const [availableTaxis, setAvailableTaxis] = useState([]);
  const [isLoadingTaxis, setIsLoadingTaxis] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [selectedTaxiForReservation, setSelectedTaxiForReservation] = useState(null);

  const mapRef = useRef(null);
  const isEditingExistingRoute = !!initialRouteData.reservation;

  // Demander les permissions pour les notifications et configurer le canal Android
  useEffect(() => {
    const setupNotifications = async () => {
      if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return;
      }

      // Configurer le canal de notification pour Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Vérifier et demander les permissions
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

  // Fonction pour envoyer une notification locale
  const sendLocalNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: { seconds: 1 }, // Déclencher immédiatement (1 seconde de délai)
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification.');
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3;
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;
    const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return (dist / 1000).toFixed(2);
  };

  useEffect(() => {
    if (routeData.departureCoordinates && routeData.arrivalCoordinates) {
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `http://router.project-osrm.org/route/v1/driving/${routeData.departureCoordinates.longitude},${routeData.departureCoordinates.latitude};${routeData.arrivalCoordinates.longitude},${routeData.arrivalCoordinates.latitude}?overview=full&geometries=geojson`
          );
          if (!response.ok) {
            const errorBody = await response.text();
            console.error(`OSRM Error ${response.status}:`, errorBody);
            throw new Error(`Erreur de l'API OSRM: ${response.status}`);
          }
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
              latitude: lat,
              longitude: lon,
            }));
            const routeDistance = (data.routes[0].distance / 1000).toFixed(2); // Distance en km
            const routeDuration = Math.round(data.routes[0].duration / 60); // Durée en minutes
            setRouteCoordinates(coords);
            setDistance(routeDistance);
            setDuration(routeDuration);
            setRouteData(prev => ({ ...prev, distance: routeDistance, duration: routeDuration }));

            if (mapRef.current) {
              const allCoords = [routeData.departureCoordinates, routeData.arrivalCoordinates, ...coords];

              if (allCoords.length > 1) {
                mapRef.current.fitToCoordinates(allCoords, {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true,
                });
              } else if (allCoords.length === 1) {
                mapRef.current.animateToRegion({
                  latitude: allCoords[0].latitude,
                  longitude: allCoords[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              }
            }
          } else {
            Alert.alert('Erreur', 'Aucun itinéraire trouvé pour les points sélectionnés.');
            setRouteCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean));
            setDistance(calculateDistance(routeData.departureCoordinates, routeData.arrivalCoordinates));
            setDuration(null);

            if (mapRef.current) {
              const fallbackCoords = [routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean);

              if (fallbackCoords.length > 1) {
                mapRef.current.fitToCoordinates(fallbackCoords, {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true,
                });
              } else if (fallbackCoords.length === 1) {
                mapRef.current.animateToRegion({
                  latitude: fallbackCoords[0].latitude,
                  longitude: fallbackCoords[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              }
            }
          }
        } catch (error) {
          console.error("Fetch route error:", error);
          Alert.alert('Erreur', `Impossible de récupérer le trajet: ${error.message}`);
          setRouteCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean));
          setDistance(calculateDistance(routeData.departureCoordinates, routeData.arrivalCoordinates));
          setDuration(null);

          if (mapRef.current) {
            const fallbackCoords = [routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean);

            if (fallbackCoords.length > 1) {
              mapRef.current.fitToCoordinates(fallbackCoords, {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            } else if (fallbackCoords.length === 1) {
              mapRef.current.animateToRegion({
                latitude: fallbackCoords[0].latitude,
                longitude: fallbackCoords[0].longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            }
          }
        }
      };
      fetchRoute();
    } else if (routeData.departureCoordinates || routeData.arrivalCoordinates) {
      const singlePoint = routeData.departureCoordinates || routeData.arrivalCoordinates;
      setRouteCoordinates([singlePoint]);
      setDistance(null);
      setDuration(null);

      if (mapRef.current && singlePoint) {
        mapRef.current.animateToRegion({
          latitude: singlePoint.latitude,
          longitude: singlePoint.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } else {
      setRouteCoordinates([]);
      setDistance(null);
      setDuration(null);
    }

    return () => {};
  }, [routeData]);

  const handleMarkerPress = (type) => {
    if (editingMode) return;

    if (type === 'departure' && routeData.departureCoordinates) {
      setSelectedMarkerInfo({
        type: 'Départ',
        name: routeData.departure,
        coordinates: routeData.departureCoordinates,
        markerType: 'departure',
      });
    } else if (type === 'arrival' && routeData.arrivalCoordinates) {
      setSelectedMarkerInfo({
        type: 'Destination',
        name: routeData.arrival,
        coordinates: routeData.arrivalCoordinates,
        markerType: 'arrival',
      });
    }
  };

  const startEditing = () => {
    if (selectedMarkerInfo) {
      setEditingMode(selectedMarkerInfo.markerType);
      setSelectedMarkerInfo(null);
    }
  };

  const closeInfoView = () => {
    setSelectedMarkerInfo(null);
  };

  const handleMapPress = async (event) => {
    if (!editingMode) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const editingPointType = editingMode;
    setEditingMode(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (yourcontact@example.com)',
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Nominatim Error ${response.status}:`, errorBody);
        throw new Error(`Erreur de l'API Nominatim: ${response.status}`);
      }

      const data = await response.json();
      const displayName = data.display_name || 'Lieu inconnu';

      let newDistance = routeData.distance;
      let newDuration = routeData.duration;
      if (editingPointType === 'departure' && routeData.arrivalCoordinates) {
        newDistance = calculateDistance(
          { latitude, longitude },
          routeData.arrivalCoordinates
        );
        newDuration = null; // Réinitialiser la durée car elle doit être recalculée
      } else if (editingPointType === 'arrival' && routeData.departureCoordinates) {
        newDistance = calculateDistance(
          routeData.departureCoordinates,
          { latitude, longitude }
        );
        newDuration = null; // Réinitialiser la durée car elle doit être recalculée
      }

      const updatedRoute = {
        ...routeData,
        ...(editingPointType === 'departure'
          ? { departure: displayName, departureCoordinates: { latitude, longitude } }
          : { arrival: displayName, arrivalCoordinates: { latitude, longitude } }),
        distance: newDistance,
        duration: newDuration,
      };

      setRouteData(updatedRoute);
      setDistance(newDistance);
      setDuration(newDuration);
      Alert.alert('Point modifié', `Le point de ${editingPointType === 'departure' ? 'départ' : 'destination'} a été défini sur : ${displayName}`);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      Alert.alert('Erreur', `Impossible de récupérer le nom du lieu: ${error.message}.`);
    }
  };

  const handleSave = async () => {
    if (!routeData.departureCoordinates || !routeData.arrivalCoordinates) {
      Alert.alert('Attention', 'Veuillez définir le point de départ et d\'arrivée.');
      return;
    }

    if (isEditingExistingRoute) {
      // Mode modification : sauvegarder directement les modifications
      const updatedRoute = {
        ...routeData,
        distance,
        duration,
        routeCoordinates,
      };
      updateSavedRoute(updatedRoute);
      // Envoyer une notification locale
      await sendLocalNotification(
        'Itinéraire modifié',
        'Votre itinéraire a été modifié avec succès.'
      );
      Alert.alert('Succès', 'Les modifications de l\'itinéraire ont été enregistrées.');
      navigation.navigate('MainTabs', {
        screen: 'Accueil',
        params: { savedRoute: updatedRoute },
      });
    } else {
      // Mode création : afficher la liste des taxis
      setIsLoadingTaxis(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const taxis = mockTaxis
          .filter(taxi => taxi.status === 'disponible')
          .map(taxi => ({
            ...taxi,
            distance: calculateDistance(routeData.departureCoordinates, taxi.coordinates),
          }));

        setAvailableTaxis(taxis);
        setIsTaxiModalVisible(true);
      } catch (error) {
        console.error('Error simulating taxis:', error);
        Alert.alert('Erreur', 'Impossible de charger la liste des taxis.');
      } finally {
        setIsLoadingTaxis(false);
      }
    }
  };

  const handleTaxiSelect = async (taxi) => {
    try {
      const reservationData = {
        clientId: 'mock-client-id',
        taxiId: taxi._id,
        routeData,
        distance,
        duration,
        routeCoordinates,
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      const mockReservation = {
        _id: `reservation-${Date.now()}`,
        ...reservationData,
      };

      const updatedRoute = {
        ...routeData,
        distance,
        duration,
        routeCoordinates,
        reservation: {
          taxiId: taxi._id,
          driverName: taxi.driverId.name,
          licensePlate: taxi.licensePlate,
          model: taxi.model,
          color: taxi.color,
          status: 'pending',
        },
      };

      updateSavedRoute(updatedRoute);
      // Envoyer une notification locale
      await sendLocalNotification(
        'Réservation confirmée',
        `Votre trajet avec le taxi ${taxi.model} (${taxi.licensePlate}) a été enregistré. En attente de confirmation du chauffeur.`
      );
      Alert.alert('Succès', `Réservation confirmée avec le taxi ${taxi.model} (${taxi.licensePlate}). En attente de confirmation du chauffeur.`);

      navigation.navigate('MainTabs', {
        screen: 'Accueil',
        params: { savedRoute: updatedRoute },
      });
    } catch (error) {
      console.error('Error simulating reservation:', error);
      Alert.alert('Erreur', 'Impossible de confirmer la réservation.');
    }

    setIsTaxiModalVisible(false);
    setIsConfirmationModalVisible(false);
    setSelectedTaxiForReservation(null);
  };

  const handleCancel = () => {
    Alert.alert(
      'Confirmer l\'annulation',
      isEditingExistingRoute
        ? 'Voulez-vous annuler les modifications ? Les changements ne seront pas enregistrés.'
        : 'Voulez-vous annuler la création de cet itinéraire ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => {
            if (isEditingExistingRoute) {
              setRouteData(originalRouteData);
              updateSavedRoute(originalRouteData);
              navigation.navigate('MainTabs', { screen: 'Itinéraire' });
            } else {
              updateSavedRoute(null);
              navigation.navigate('MainTabs', { screen: 'Itinéraire' });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderTaxiItem = ({ item }) => (
    <TouchableOpacity
      style={styles.taxiItem}
      onPress={() => {
        setSelectedTaxiForReservation(item);
        setIsConfirmationModalVisible(true);
      }}
    >
      <Icon name="local-taxi" size={24} color="#60a5fa" style={styles.taxiIcon} />
      <View style={styles.taxiDetails}>
        <Text style={styles.taxiText}>Chauffeur: {item.driverId.name}</Text>
        <Text style={styles.taxiText}>Téléphone: {item.driverId.phone}</Text>
        <Text style={styles.taxiText}>Plaque: {item.licensePlate}</Text>
        <Text style={styles.taxiText}>Modèle: {item.model}</Text>
        <Text style={styles.taxiText}>Couleur: {item.color}</Text>
        <Text style={styles.taxiText}>Distance: {item.distance} km</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          routeData.departureCoordinates
            ? {
                latitude: routeData.departureCoordinates.latitude,
                longitude: routeData.departureCoordinates.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
        onPress={handleMapPress}
        mapType="standard"
        showsCompass={true}
        showsScale={true}
        showsUserLocation={true}
      >
        {routeData.departureCoordinates && (
          <Marker
            coordinate={routeData.departureCoordinates}
            title="Départ"
            description={routeData.departure}
            pinColor="green"
            onPress={() => handleMarkerPress('departure')}
          />
        )}
        {routeData.arrivalCoordinates && (
          <Marker
            coordinate={routeData.arrivalCoordinates}
            title="Arrivée"
            description={routeData.arrival}
            pinColor="#F44336"
            onPress={() => handleMarkerPress('arrival')}
          />
        )}
        {routeCoordinates.length > 0 && !editingMode && !selectedMarkerInfo && (
          <Polyline coordinates={routeCoordinates} strokeColor="#1e90ff" strokeWidth={4} />
        )}
      </MapView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedMarkerInfo !== null}
        onRequestClose={closeInfoView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoView}>
            <TouchableOpacity style={styles.closeIcon} onPress={closeInfoView}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            {selectedMarkerInfo && (
              <>
                <Text style={styles.infoViewTitle}>Point de {selectedMarkerInfo.type}</Text>
                <Text style={styles.infoViewAddress}>{selectedMarkerInfo.name}</Text>
                <TouchableOpacity style={styles.modifyButton} onPress={startEditing}>
                  <Icon name="edit-location" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Modifier la position</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isTaxiModalVisible}
        onRequestClose={() => {
          setIsTaxiModalVisible(false);
          setIsConfirmationModalVisible(false);
          setSelectedTaxiForReservation(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taxiModal}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => {
                setIsTaxiModalVisible(false);
                setIsConfirmationModalVisible(false);
                setSelectedTaxiForReservation(null);
              }}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Taxis Disponibles</Text>

            {isLoadingTaxis ? (
              <ActivityIndicator size="large" color="#60a5fa" />
            ) : availableTaxis.length === 0 ? (
              <Text style={styles.noTaxisText}>Aucun taxi disponible pour le moment.</Text>
            ) : (
              <FlatList
                data={availableTaxis}
                renderItem={renderTaxiItem}
                keyExtractor={(item) => item._id}
                style={styles.taxiList}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isConfirmationModalVisible}
        onRequestClose={() => {
          setIsConfirmationModalVisible(false);
          setSelectedTaxiForReservation(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationText}>
              Voulez-vous vraiment réserver le taxi {selectedTaxiForReservation?.model} ({selectedTaxiForReservation?.licensePlate}) ?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleTaxiSelect(selectedTaxiForReservation)}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelConfirmButton}
                onPress={() => {
                  setIsConfirmationModalVisible(false);
                  setSelectedTaxiForReservation(null);
                }}
              >
                <Text style={styles.buttonCancleText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {distance && !editingMode && !selectedMarkerInfo && (
        <View style={styles.distanceTopLeft}>
          <Icon name="straighten" size={20} color="#1e90ff" style={styles.distanceIcon} />
          <View>
            <Text style={styles.distanceText}>Distance: {distance} km</Text>
            {duration && <Text style={styles.distanceText}>Durée: {duration} min</Text>}
          </View>
        </View>
      )}

      {editingMode && (
        <View style={styles.editingOverlay}>
          <Text style={styles.editingText}>
            Tapez sur la carte pour sélectionner le nouveau point de{' '}
            {editingMode === 'departure' ? 'départ' : 'destination'}.
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!editingMode && !selectedMarkerInfo && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Enregistrer</Text>
          </TouchableOpacity>
        )}
      </View>

      {!editingMode && !selectedMarkerInfo && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
          <Text style={styles.buttonCancleText}>Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoView: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: 'relative',
  },
  taxiModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  taxiList: {
    flexGrow: 0,
  },
  taxiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taxiIcon: {
    marginRight: 10,
  },
  taxiDetails: {
    flex: 1,
  },
  taxiText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  noTaxisText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  infoViewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  infoViewAddress: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  distanceTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 10,
  },
  distanceIcon: {
    marginRight: 8,
    color: '#1e90ff',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editingOverlay: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2 - 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 5,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  buttonCancleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#60a5fa',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  confirmationModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: ' k',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelConfirmButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default MapScreen;
