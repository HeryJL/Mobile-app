import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapAutocompleteScreen() {
  const [departureQuery, setDepartureQuery] = useState('');
  const [arrivalQuery, setArrivalQuery] = useState('');
  const [departureResults, setDepartureResults] = useState([]);
  const [arrivalResults, setArrivalResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departureLocation, setDepartureLocation] = useState(null);
  const [arrivalLocation, setArrivalLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null);

  // Get user's current location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'application a besoin de votre position.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setDepartureLocation(userLocation);
      setDepartureQuery('Votre position actuelle');

      // Center map on user's location
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...userLocation,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          1000
        );
      }
    })();
  }, []);

  // Calculate distance and fetch route when both locations are set
  useEffect(() => {
    if (departureLocation && arrivalLocation) {
      // Calculate straight-line distance
      const calculateDistance = () => {
        const R = 6371e3; // Earth's radius in meters
        const lat1 = (departureLocation.latitude * Math.PI) / 180;
        const lat2 = (arrivalLocation.latitude * Math.PI) / 180;
        const deltaLat = ((arrivalLocation.latitude - departureLocation.latitude) * Math.PI) / 180;
        const deltaLon = ((arrivalLocation.longitude - departureLocation.longitude) * Math.PI) / 180;

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c; // Distance in meters
        return (dist / 1000).toFixed(2); // Convert to kilometers
      };

      setDistance(calculateDistance());

      // Fetch route using OSRM (Open Source Routing Machine)
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `http://router.project-osrm.org/route/v1/driving/${departureLocation.longitude},${departureLocation.latitude};${arrivalLocation.longitude},${arrivalLocation.latitude}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
              latitude: lat,
              longitude: lon,
            }));
            setRouteCoordinates(coords);

            // Fit map to show both points
            if (mapRef.current) {
              mapRef.current.fitToCoordinates([departureLocation, arrivalLocation], {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            }
          }
        } catch (error) {
          console.error('Erreur OSRM:', error);
          // Fallback to straight line
          setRouteCoordinates([departureLocation, arrivalLocation]);
        }
      };

      fetchRoute();
    }
  }, [departureLocation, arrivalLocation]);

  const fetchSuggestions = async (text, type) => {
    if (type === 'departure') {
      setDepartureQuery(text);
      if (text.length < 3) {
        setDepartureResults([]);
        return;
      }
    } else {
      setArrivalQuery(text);
      if (text.length < 3) {
        setArrivalResults([]);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0 (your@email.com)',
          },
        }
      );
      const data = await response.json();
      if (type === 'departure') {
        setDepartureResults(data);
      } else {
        setArrivalResults(data);
      }
    } catch (error) {
      console.error('Erreur Nominatim:', error);
      type === 'departure' ? setDepartureResults([]) : setArrivalResults([]);
    }
    setLoading(false);
  };

  const handleSelect = (item, type) => {
    const location = {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
    if (type === 'departure') {
      setDepartureQuery(item.display_name);
      setDepartureLocation(location);
      setDepartureResults([]);
    } else {
      setArrivalQuery(item.display_name);
      setArrivalLocation(location);
      setArrivalResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={{
          latitude: departureLocation ? departureLocation.latitude : -18.8792,
          longitude: departureLocation ? departureLocation.longitude : 47.5079,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {departureLocation && (
          <Marker
            coordinate={departureLocation}
            title="Départ"
            description={departureQuery}
            pinColor="green"
          />
        )}
        {arrivalLocation && (
          <Marker
            coordinate={arrivalLocation}
            title="Arrivée"
            description={arrivalQuery}
            pinColor="red"
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Lieu de départ (position actuelle)"
          value={departureQuery}
          onChangeText={(text) => fetchSuggestions(text, 'departure')}
        />
        <TextInput
          style={styles.input}
          placeholder="Lieu d'arrivée"
          value={arrivalQuery}
          onChangeText={(text) => fetchSuggestions(text, 'arrival')}
        />

        {loading && <ActivityIndicator size="small" color="#0000ff" />}

        {distance && (
          <Text style={styles.distanceText}>
            Distance: {distance} km
          </Text>
        )}

        <FlatList
          data={departureResults}
          keyExtractor={(item) => `dep-${item.place_id}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item, 'departure')}>
              <Text style={styles.item}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          data={arrivalResults}
          keyExtractor={(item) => `arr-${item.place_id}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item, 'arrival')}>
              <Text style={styles.item}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    height: 45,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  item: {
    padding: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 10,
    textAlign: 'center',
  },
});