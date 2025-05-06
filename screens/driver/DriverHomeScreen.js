import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvailabilityToggle from './AvailabilityToggle';
import OngoingTripCard from './OngoingTripCard';
import { useRoute, useNavigation } from '@react-navigation/native';
import { updateTaxi } from '../../services/taxi.service';
import { getRideLoad, updateRide } from '../../services/ride.service';



const DriverHomeScreen = () => {
  const route = useRoute();
  const { user,updateStatut,statut,Idtaxi } = useContext(AuthContext);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeToPickup, setRouteToPickup] = useState([]);
  const [routeToDestination, setRouteToDestination] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(statut == 'disponible'); // Added availability state
  const [loadingAvailability, setLoadingAvailability] = useState(false); // Loading state for availability toggle
  const [hasOngoingTrip, setHasOngoingTrip] = useState(false); // State to simulate having a trip
  const [ongoingTripDetails, setOngoingTripDetails] = useState(null); 
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

  useEffect(() => {
    // Async IIFE to load initial data
    (async () => {
        if (statut === 'occupé') {
          const data = await getRideLoad(Idtaxi)
          const dummyTrip = {
            id: data._id,
            passengerName: data.clientId.name,
            pickupAddress: data.startLocation.destination,
            dropoffAddress: data.endLocation.destination,
            estimatedTime: "20 min",
            distance: data.distanceKm,
            pickupCoords:{ latitude: data.startLocation.coordinates[1], longitude: data.startLocation.coordinates[0]}, 
            dropoffCoords:{latitude:data.endLocation.coordinates[1],longitude:data.endLocation.coordinates[0]},
            price:data.price,
            heure:data.heure
          };
          setHasOngoingTrip(true);
          setOngoingTripDetails(dummyTrip);
        } else {
            setIsAvailable(false); // Driver starts unavailable if no trip
        }
        const current = await getDriverLocation();

      // Fetch routes only if there's a trip and location is availabl
      if (statut === 'occupé' && current) {
          const pathToPickup = await getRoute(current, ongoingTripDetails.pickupCoords);
          const pathToDropoff = await getRoute(ongoingTripDetails.pickupCoords, ongoingTripDetails.dropoffCoords);
          setRouteToPickup(pathToPickup);
          setRouteToDestination(pathToDropoff);
        }

      setLoading(false); // Hide main loading indicator
    })();
  }, [statut]); // Empty dependency array means this runs once on mount


  // --- Handlers for the new components ---
  const handleToggleAvailability = async () => {
    setLoadingAvailability(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const newStatus = statut === "disponible";
    const st = newStatus ? "occupé":"disponible"
    console.log('Statut du conducteur:', newStatus ? 'Disponible' : 'Indisponible');
    updateStatut(st)
    setIsAvailable(statut === 'disponible');
    setLoadingAvailability(false);
  };

  const handleEndTrip = () => {
      Alert.alert(
          "Terminer la course",
          "Êtes-vous sûr de vouloir terminer cette course ?",
          [
              {
                  text: "Annuler",
                  style: "cancel"
              },
              { text: "Oui", onPress: async() => {
                  await updateRide(ongoingTripDetails.id,{status:"terminé"})
                  await updateStatut("disponible")
                  setHasOngoingTrip(false);
                  setOngoingTripDetails(null);
                  setRouteToPickup([]); // Clear routes
                  setRouteToDestination([]);
                  // In a real app: send trip completion status to backend, navigate to summary
              }}
          ]
      );
  };

  // Simulate getting a new trip when available
 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bienvenue {user?.name || 'Conducteur'}</Text>

         {/* Show main loading indicator if ftching initial data or simulating trip */}
        {loading && !driverLocation ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          // Render map and trip details if driver location is available
          driverLocation && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                 // Center map dynamically based on trip or driver location
                initialRegion={{
                  latitude: hasOngoingTrip ? ongoingTripDetails.pickupCoords.latitude : driverLocation.latitude,
                  longitude: hasOngoingTrip ? ongoingTripDetails.pickupCoords.longitude : driverLocation.longitude,
                  latitudeDelta: 0.03, // Adjusted delta for slightly wider view
                  longitudeDelta: 0.03, // Adjusted delta
                }}
                showsUserLocation
                followsUserLocation // Map follows user location
              >
                
                {/* Only show trip markers and polylines if there's an ongoing trip */}
                {ongoingTripDetails && (
                    <>
                     <Marker
                       coordinate={ongoingTripDetails.pickupCoords}
                       title="Départ client"
                       description="Lieu de départ"
                       pinColor="orange"
                     />
                     <Marker
                       coordinate={ongoingTripDetails.dropoffCoords}
                       title="Arrivée client"
                       description="Destination finale"
                       pinColor="red"
                     />
                     <Polyline coordinates={routeToPickup} strokeColor="blue" strokeWidth={4} />
                     <Polyline coordinates={routeToDestination} strokeColor="purple" strokeWidth={4} />
                    </>
                )}

              </MapView>
            </View>
          )
        )}

        {/* Render AvailabilityToggle or OngoingTripCard based on state */}
        {!hasOngoingTrip ? (
             <AvailabilityToggle
                isAvailable={isAvailable}
                onToggle={handleToggleAvailability}
                loading={loadingAvailability}
             />
        ) : (
            <OngoingTripCard
               tripDetails={ongoingTripDetails}
               onEndTrip={handleEndTrip}
            />
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={async () => {
            setLoading(true); // Show loading for refresh
            const current = await getDriverLocation();
            if (current && hasOngoingTrip && ongoingTripDetails) {
               // Only re-fetch routes if there's an ongoing trip
              const pathToPickup = await getRoute(current, ongoingTripDetails.pickupCoords);
              const pathToDropoff = await getRoute(ongoingTripDetails.pickupCoords, ongoingTripDetails.dropoffCoords);
              setRouteToPickup(pathToPickup);
              setRouteToDestination(pathToDropoff);
            }
            setLoading(false); // Hide loading
          }}
          disabled={loading} // Disable refresh button while loading
        >
          {loading && driverLocation ? ( // Show activity indicator on refresh button if only map data is loading
               <ActivityIndicator color="#fff" size="small" style={{ marginRight: 5 }}/>
          ) : null}
          <Text style={styles.refreshText}>↻ Rafraîchir Position</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light grey background
  },
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30, // Add padding at the bottom for scroll
  },
  title: {
    fontSize: 24, // Slightly larger title
    fontWeight: 'bold',
    marginBottom: 15, // More space below title
    color: '#333',
  },
  mapContainer: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15, // Space below the map
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: { flex: 1 },
  refreshButton: {
    marginTop: 15, // More space above refresh button
    backgroundColor: '#007BFF',
    padding: 12, // Slightly more padding
    borderRadius: 8,
    flexDirection: 'row', // Align icon and text
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
   },
   simulateButton: {
      marginTop: 10,
      backgroundColor: '#28A745', // Green color
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
   },
   simulateButtonText: {
     color: '#fff',
     fontWeight: 'bold',
     fontSize: 16,
   },
    logoutButton: {
      marginTop: 20,
      backgroundColor: '#DC3545', // Red color
      padding: 12,
      borderRadius: 8,
    },
    logoutButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
    },
});

export default DriverHomeScreen;