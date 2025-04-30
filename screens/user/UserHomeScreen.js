import React, { useState, useEffect, useRef, useContext } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { AuthContext } from '../../context/AuthContext';

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [taxis, setTaxis] = useState({})
  const mapRef = useRef(null); // Reference to the MapView
  const { user } = useContext(AuthContext);
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
      const tax = await getNearbyTaxis(userLocation.longitude, userLocation.latitude, 2);
      console.log("taxi",tax)
      setTaxis(tax)
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

  return (
    React.createElement(
      SafeAreaView,
      { style: [styles.safeArea, { paddingTop: insets.top }] },
      // Header Section (Updated to match the design in the image)
      React.createElement(
        View,
        { style: styles.headerContainer },
        React.createElement(Text, { style: styles.greetingText }, 'Bonjour,\nBesoin de prendre la route ?'),
        // Tabs Section
        React.createElement(
          View,
          { style: styles.tabContainer },
          React.createElement(
            TouchableOpacity,
            { style: styles.tabActive },
            React.createElement(
              View,
              { style: styles.tabContent },
              React.createElement(Text, { style: styles.tabIcon }, '📍'),
              React.createElement(Text, { style: styles.tabText }, 'Réserver')
            )
          ),
          React.createElement(
            TouchableOpacity,
            { style: styles.tabInactive },
            React.createElement(
              View,
              { style: styles.tabContent },
              React.createElement(Text, { style: styles.tabIcon }, '🚗'),
              React.createElement(Text, { style: styles.tabText }, 'Véhicules')
            )
          )
        )
      ),
      // Map Section
      React.createElement(
        View,
        { style: styles.mapSection },
        React.createElement(Text, { style: styles.sectionTitle }, 'Réserver une course'),
        React.createElement(
          MapView,
          {
            ref: mapRef, // Attach the ref to the MapView
            provider: PROVIDER_DEFAULT, // Use OpenStreetMap as the provider
            style: styles.map,
            initialRegion: initialRegion,
            customMapStyle: [],
          },
          location && React.createElement(Marker, {
            coordinate: { latitude: initialRegion.latitude, longitude: initialRegion.longitude },
            title: 'Votre position',
          }),
          
        ),
        // Recenter Button
        React.createElement(
          TouchableOpacity,
          { style: styles.recenterButton, onPress: recenterMap },
          React.createElement(Text, { style: styles.recenterButtonText }, 'Recentrer')
        )
      )
    )
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#60a5fa', // Yellow background
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  infoIcon: {
    padding: 5,
  },
  infoText: {
    fontSize: 20,
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
    flex: 1, // Allow the map section to take up remaining space
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    flex: 1, // Make the map take up the full space of its container
    minHeight: 400, // Ensure a larger minimum height
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
});

export default UserHomeScreen;