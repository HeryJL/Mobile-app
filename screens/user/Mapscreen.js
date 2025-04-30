import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';

const MapScreen = () => {
  const route = useRoute();
  const { route: routeData } = route.params; // Route data from UserRouteScreen
  const [distance, setDistance] = useState(null);

  // Calculate Haversine distance between two coordinates
  const calculateDistance = (coord1, coord2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2); // Return distance rounded to 2 decimal places
  };

  useEffect(() => {
    if (routeData.departureCoordinates && routeData.arrivalCoordinates) {
      const dist = calculateDistance(routeData.departureCoordinates, routeData.arrivalCoordinates);
      setDistance(dist);
    }
  }, [routeData]);

  // Define region to center the map
  const initialRegion = {
    latitude: (routeData.departureCoordinates.latitude + routeData.arrivalCoordinates.latitude) / 2,
    longitude: (routeData.departureCoordinates.longitude + routeData.arrivalCoordinates.longitude) / 2,
    latitudeDelta: Math.abs(routeData.departureCoordinates.latitude - routeData.arrivalCoordinates.latitude) * 2 || 0.05,
    longitudeDelta: Math.abs(routeData.departureCoordinates.longitude - routeData.arrivalCoordinates.longitude) * 2 || 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {/* Marker for current location (departure) */}
        <Marker
          coordinate={routeData.departureCoordinates}
          title={routeData.departure}
          description="Votre position actuelle"
          pinColor="blue" // Distinct color for current location
        />
        {/* Marker for arrival */}
        <Marker
          coordinate={routeData.arrivalCoordinates}
          title={routeData.arrival}
          description="Destination"
          pinColor="red" // Distinct color for arrival
        />
        {/* Polyline to show the route */}
        <Polyline
          coordinates={[routeData.departureCoordinates, routeData.arrivalCoordinates]}
          strokeColor="#000"
          strokeWidth={3}
        />
      </MapView>
      {/* Display distance */}
      {distance && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Distance: {distance} km</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapScreen;