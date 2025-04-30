import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialIcons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';


const RideRequestsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const pickupPoint = { latitude: -19.8625, longitude: 47.0302 }; // point de départ du client
  const dropoffPoint = { latitude: -19.8712, longitude: 47.0377 };
  const [driverLocation, setDriverLocation] = useState(null);
  const rideRequests = [
    { id: '1', distance: 2, pickup: 'Aéroport', destination: 'Centre-ville', startLocation: pickupPoint, endLocation: dropoffPoint },
    { id: '2', distance: 2, pickup: 'Gare', destination: 'Mahamasina', startLocation: pickupPoint, endLocation: dropoffPoint },
    { id: '3', distance: 2, pickup: 'Ambohijatovo', destination: 'Anosy', startLocation: pickupPoint, endLocation: dropoffPoint },
    { id: '4', distance: 2, pickup: 'Tana Water Front', destination: 'Ivato', startLocation: pickupPoint, endLocation: dropoffPoint },
    { id: '5', distance: 2, pickup: 'Ambohimanambola', destination: 'Andraharo', startLocation: pickupPoint, endLocation: dropoffPoint },
    { id: '6', distance: 2, pickup: 'Antsenakely', destination: 'Andraharo', startLocation: pickupPoint, endLocation: dropoffPoint },
    { id: '7', distance: 2, pickup: 'Antsenakely', destination: 'Andraharo', startLocation: pickupPoint, endLocation: dropoffPoint },
  ];

  
   const getDriverLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Activez la localisation.');
                return null; // Return null if permission is not granted
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
        return null; // Return null on error
      }
    };
    useEffect(()=> { 
      getDriverLocation(); 

    },[]);
  
    
  

  const getRoute = async (from, to) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
      const res = await axios.get(url);
      if (!res.data || !res.data.routes || res.data.routes.length === 0) {
        Alert.alert('Erreur', 'Itinéraire non disponible');
        return [];
      }
      const coords = res.data.routes[0].geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
      return coords;
    } catch (err) {
      console.error("Route error:", err); // Log the actual error
      Alert.alert('Erreur', 'Itinéraire non disponible');
      return [];
    }
  };


  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  const handleAccept = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };
  

  return (
    <LinearGradient
      colors={['#f2f2f2', '#f2f2f2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={{ paddingTop: insets.top }}>
          <Text style={styles.title}>Demandes de Trajets</Text>
          <FlatList
            data={rideRequests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleRequestPress(item)} activeOpacity={0.2}>
                <View style={styles.card}>
                  <Text style={styles.pickupText}>Départ : <Text style={styles.highlight}>{item.pickup}</Text></Text>
                  <Text style={styles.destinationText}>Destination : <Text style={styles.highlight}>{item.destination}</Text></Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <Modal
            visible={isModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
              setIsModalVisible(false);
              setSelectedRequest(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {selectedRequest && (
                  <>
                    <Text style={styles.modalTitle}>Détails de la course</Text>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: driverLocation.latitude,
                        longitude: driverLocation.longitude,
                        latitudeDelta: 0.05, // Adjusted delta for slightly wider view
                        longitudeDelta: 0.05, // Adjusted delta
                      }}
                      showsUserLocation
                      followsUserLocation
                    >
                      <>
                        <Marker
                          coordinate={selectedRequest.startLocation}
                          title="Départ client"
                          description="Lieu de départ"
                          pinColor="orange"
                        />
                        <Marker
                          coordinate={selectedRequest.endLocation}
                          title="Arrivée client"
                          description="Destination finale"
                          pinColor="red"
                        />
                      </>
                    </MapView>


                    <Text style={styles.modalLabel}>Départ : <Text style={styles.modalInfo}>{selectedRequest.pickup}</Text></Text>
                    <Text style={styles.modalLabel}>Destination : <Text style={styles.modalInfo}>{selectedRequest.destination}</Text></Text>
                    <Text style={styles.destinationText}>Distance : <Text style={styles.highlight}>{selectedRequest.distance} Km</Text></Text>
                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                        <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Accepter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                        <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
                        <Text style={styles.buttonCancelText}>Refuser</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setIsModalVisible(false);
                        setSelectedRequest(null);
                      }}
                    >
                    </TouchableOpacity>
                  </>
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
    height: '60%',
    backgroundColor: 'rgba(46, 161, 81, 0.88)',
    borderRadius: 10,
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
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#60a5fa'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },

});

export default RideRequestsScreen;
