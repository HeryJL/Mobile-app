import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import mockDrivers from '../../data/mockDrivers'; // Assuming mockDrivers is in a separate file

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('Réserver'); // State to track active tab
  const mapRef = useRef(null); // Reference to the MapView

  useEffect(() => {
    (async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'application a besoin de votre position pour afficher la carte.');
        return;
      }

      // Get current position
      let currentLocation = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.005, // Zoom in closer
        longitudeDelta: 0.005, // Zoom in closer
      };
      setLocation(userLocation);

      // Animate map to the user's location
      if (mapRef.current) {
        mapRef.current.animateToRegion(userLocation, 1000);
      }
    })();
  }, []);

  // Fallback region if location is not available
  const fallbackRegion = {
    latitude: 48.8566, // Paris as fallback
    longitude: 2.3522,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const initialRegion = location || fallbackRegion;

  // Function to recenter the map on the user's location
  const recenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(location, 1000);
    }
  };

  // Filter approved drivers
  const approvedDrivers = mockDrivers.filter(driver => driver.status === 'approved');

  // Render driver item
  const renderDriverItem = ({ item }) => (
    <View style={styles.driverItem}>
      <Text style={styles.driverName}>{`${item.firstName} ${item.lastName}`}</Text>
      <Text style={styles.driverDetail}>Téléphone: {item.phoneNumber}</Text>
      <Text style={styles.driverDetail}>Véhicule: {item.vehicleMake} ({item.vehicleLicensePlate})</Text>
      <Text style={styles.driverDetail}>Permis: {item.driverLicense}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.greetingText}>Bonjour,{'\n'}Besoin de prendre la route ?</Text>
        {/* Tabs Section */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={activeTab === 'Réserver' ? styles.tabActive : styles.tabInactive}
            onPress={() => setActiveTab('Réserver')}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>📍</Text>
              <Text style={styles.tabText}>Réserver</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === 'Véhicules' ? styles.tabActive : styles.tabInactive}
            onPress={() => setActiveTab('Véhicules')}
          >
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>🚗</Text>
              <Text style={styles.tabText}>Véhicules</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* Content Section */}
      {activeTab === 'Réserver' ? (
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Réserver une course</Text>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={initialRegion}
            customMapStyle={[]}
          >
            {location && (
              <Marker
                coordinate={{ latitude: initialRegion.latitude, longitude: initialRegion.longitude }}
                title="Votre position"
              />
            )}
          </MapView>
          <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
            <Text style={styles.recenterButtonText}>Recentrer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.driversSection}>
          <Text style={styles.sectionTitle}>Conducteurs disponibles</Text>
          {approvedDrivers.length > 0 ? (
            <FlatList
              data={approvedDrivers}
              renderItem={renderDriverItem}
              keyExtractor={(item) => item.id}
              style={styles.driverList}
            />
          ) : (
            <Text style={styles.noDriversText}>Aucun conducteur disponible</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#60a5fa',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabInactive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  mapSection: {
    marginHorizontal: 20,
    marginTop: 10,
    flex: 1,
  },
  driversSection: {
    marginHorizontal: 20,
    marginTop: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    minHeight: 400,
    borderRadius: 10,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#60a5fa',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  recenterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  driverList: {
    flex: 1,
  },
  driverItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  driverDetail: {
    fontSize: 14,
    color: '#333',
  },
  noDriversText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserHomeScreen;