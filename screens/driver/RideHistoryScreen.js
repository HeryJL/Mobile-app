import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialIcons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const RideHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Mock past ride data with status
  const rideHistory = [
    { id: '1', distance: 2, pickup: 'Aéroport', destination: 'Centre-ville', startLocation: { latitude: -19.8625, longitude: 47.0302 }, endLocation: { latitude: -19.8712, longitude: 47.0377 }, status: 'completed' },
    { id: '2', distance: 2, pickup: 'GARE', destination: 'Mahamasina', startLocation: { latitude: -19.8712, longitude: 47.0377 }, endLocation: { latitude: -19.8625, longitude: 47.0302 }, status: 'completed' },
    { id: '3', distance: 2, pickup: 'Ambohijatovo', destination: 'Anosy', startLocation: { latitude: -19.8625, longitude: 47.0302 }, endLocation: { latitude: -19.8712, longitude: 47.0377 }, status: 'cancelled' },
    { id: '4', distance: 2, pickup: 'Tana Water Front', destination: 'Ivato', startLocation: { latitude: -19.8625, longitude: 47.0302 }, endLocation: { latitude: -19.8712, longitude: 47.0377 }, status: 'completed' },
  ];

  const getDriverLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Activez la localisation.');
        return null;
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
      return null;
    }
  };

  // Simulate route coordinates for history (static for simplicity)
  const getRoute = async (from, to) => {
    if (!from || !to) return [];
    // Mock route coordinates for history display
    return [
      from,
      { latitude: (from.latitude + to.latitude) / 2, longitude: (from.longitude + to.longitude) / 2 },
      to,
    ];
  };

  const handleRidePress = async (ride) => {
    setSelectedRide(ride);
    const driverLoc = await getDriverLocation();
    if (driverLoc) {
      const route = await getRoute(ride.startLocation, ride.endLocation);
      setRouteCoordinates(route);
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRide(null);
    setRouteCoordinates([]);
  };

  return (
    <LinearGradient colors={['#f2f2f2', '#f2f2f2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ paddingTop: insets.top }}>
          <Text style={styles.title}>Historique des Trajets</Text>
          <FlatList
            data={rideHistory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleRidePress(item)} activeOpacity={0.2}>
                <View style={styles.card}>
                  <Text style={styles.pickupText}>Départ : <Text style={styles.highlight}>{item.pickup}</Text></Text>
                  <Text style={styles.destinationText}>Destination : <Text style={styles.highlight}>{item.destination}</Text></Text>
                  <Text style={styles.statusText}>Statut : <Text style={[styles.highlight, { color: item.status === 'completed' ? '#4CAF50' : '#F44336' }]}>
                    {item.status === 'completed' ? 'Terminé' : 'Annulé'}
                  </Text></Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <Modal
            visible={isModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleCloseModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {selectedRide && driverLocation && (
                  <>
                    <Text style={styles.modalTitle}>Détails du Trajet</Text>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: selectedRide.startLocation.latitude,
                        longitude: selectedRide.startLocation.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                      showsUserLocation
                    >
                      <Marker
                        coordinate={selectedRide.startLocation}
                        title="Départ"
                        pinColor="orange"
                      />
                      <Marker
                        coordinate={selectedRide.endLocation}
                        title="Arrivée"
                        pinColor="red"
                      />
                      <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#1e90ff"
                        strokeWidth={4}
                      />
                    </MapView>
                    <Text style={styles.modalLabel}>Départ : <Text style={styles.modalInfo}>{selectedRide.pickup}</Text></Text>
                    <Text style={styles.modalLabel}>Destination : <Text style={styles.modalInfo}>{selectedRide.destination}</Text></Text>
                    <Text style={styles.modalLabel}>Distance : <Text style={styles.modalInfo}>{selectedRide.distance} Km</Text></Text>
                    <Text style={styles.modalLabel}>Statut : <Text style={[styles.modalInfo, { color: selectedRide.status === 'completed' ? '#4CAF50' : '#F44336' }]}>
                      {selectedRide.status === 'completed' ? 'Terminé' : 'Annulé'}
                    </Text></Text>
                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                      <Icon name="close" size={20} color="#60a5fa" />
                      <Text style={styles.buttonCancelText}>Fermer</Text>
                    </TouchableOpacity>
                  </>
                )}
                {!driverLocation && (
                  <View style={styles.loadingContainer}>
                    <Text>Chargement de votre position...</Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: 'rgb(0, 0, 0)',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pickupText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#555',
  },
  destinationText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#555',
  },
  statusText: {
    fontSize: 16,
    color: '#555',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '95%',
    elevation: 6,
  },
  map: {
    width: '100%',
    height: 250,
    backgroundColor: 'rgba(46, 161, 81, 0.88)',
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  modalInfo: {
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#60a5fa',
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
    marginLeft: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
});

export default RideHistoryScreen;