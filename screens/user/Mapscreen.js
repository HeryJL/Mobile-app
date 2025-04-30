import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialIcons';

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { route: initialRouteData } = route.params;
  const [routeData, setRouteData] = useState(initialRouteData);
  const [distance, setDistance] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (routeData.departureCoordinates && routeData.arrivalCoordinates) {
      const calculateDistance = () => {
        const R = 6371e3;
        const lat1 = (routeData.departureCoordinates.latitude * Math.PI) / 180;
        const lat2 = (routeData.arrivalCoordinates.latitude * Math.PI) / 180;
        const deltaLat = ((routeData.arrivalCoordinates.latitude - routeData.departureCoordinates.latitude) * Math.PI) / 180;
        const deltaLon = ((routeData.arrivalCoordinates.longitude - routeData.departureCoordinates.longitude) * Math.PI) / 180;

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return (dist / 1000).toFixed(2);
      };

      setDistance(calculateDistance());

      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `http://router.project-osrm.org/route/v1/driving/${routeData.departureCoordinates.longitude},${routeData.departureCoordinates.latitude};${routeData.arrivalCoordinates.longitude},${routeData.arrivalCoordinates.latitude}?overview=full&geometries=geojson`
          );
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
              latitude: lat,
              longitude: lon,
            }));
            setRouteCoordinates(coords);

            if (mapRef.current) {
              mapRef.current.fitToCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates], {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            }
          }
        } catch (error) {
          Alert.alert('Erreur', 'Impossible de récupérer le trajet.');
          setRouteCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates]);
        }
      };

      fetchRoute();
    }
  }, [routeData]);

  const handleMapPress = async (event) => {
    if (!editingMode) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0 (your@email.com)',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      const displayName = data.display_name || 'Lieu inconnu';

      if (editingMode === 'departure') {
        setRouteData({
          ...routeData,
          departure: displayName,
          departureCoordinates: { latitude, longitude },
        });
      } else if (editingMode === 'arrival') {
        setRouteData({
          ...routeData,
          arrival: displayName,
          arrivalCoordinates: { latitude, longitude },
        });
      }

      setEditingMode(null);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer le nom du lieu. Vérifiez votre connexion.');
    }
  };

  const handleSave = () => {
    navigation.navigate('MainTabs', {
      screen: 'Accueil',
      params: {
        savedRoute: {
          ...routeData,
          distance,
          routeCoordinates,
        },
      },
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Confirmer l\'annulation',
      'Voulez-vous vraiment annuler cet itinéraire ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: () => {
            navigation.navigate('MainTabs', { screen: 'Itinéraire' });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditArrival = () => {
    setEditingMode('arrival');
    Alert.alert(
      'Modifier la destination',
      'Cliquez sur la carte pour sélectionner une nouvelle destination.',
      [{ text: 'OK' }]
    );
  };

  const handleEditDeparture = () => {
    setEditingMode('departure');
    Alert.alert(
      'Modifier le départ',
      'Cliquez sur la carte pour sélectionner un nouveau point de départ.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: routeData.departureCoordinates.latitude,
          longitude: routeData.departureCoordinates.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={routeData.departureCoordinates}
          title="Départ"
          description={routeData.departure}
          pinColor="green"
        />
        {routeData.arrivalCoordinates && (
          <Marker
            coordinate={routeData.arrivalCoordinates}
            title="Arrivée"
            description={routeData.arrival}
            pinColor="red"
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#1E88E5"
            strokeWidth={4}
          />
        )}
      </MapView>
      {distance && (
        <View style={styles.distanceContainer}>
          <Icon name="straighten" size={20} color="#1E88E5" style={styles.distanceIcon} />
          <Text style={styles.distanceText}>Distance: {distance} km</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Enregistrer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editArrivalButton} onPress={handleEditArrival}>
          <Icon name="edit-location" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Modifier Arrivée</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editDepartureButton} onPress={handleEditDeparture}>
          <Icon name="edit-location" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Modifier Départ</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Icon name="close" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Annuler</Text>
      </TouchableOpacity>
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
  distanceContainer: {
    position: 'absolute',
    bottom: 170,
    left: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  distanceIcon: {
    marginRight: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editArrivalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editDepartureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
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

export default MapScreen;