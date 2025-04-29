import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, Marker } from 'react-native-maps'; // Using react-native-maps

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();

  // Initial region for the map (example coordinates, adjust as needed)
  const initialRegion = {
    latitude: 48.8566, // Example: Paris coordinates
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    React.createElement(
      SafeAreaView,
      { style: [styles.safeArea, { paddingTop: insets.top }] },
      // Header Section
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Image, {
          source: { uri: 'https://via.placeholder.com/50' }, // Placeholder for EasyMove logo
          style: styles.logo,
        }),
        React.createElement(Text, { style: styles.headerText }, 'Bonjour, besoin de prendre la route ?')
      ),
      // Tabs Section
      React.createElement(
        View,
        { style: styles.tabContainer },
        React.createElement(
          TouchableOpacity,
          { style: styles.tabActive },
          React.createElement(Text, { style: styles.tabText }, 'Réserver')
        ),
        React.createElement(
          TouchableOpacity,
          { style: styles.tabInactive },
          React.createElement(Text, { style: styles.tabText }, 'Véhicules')
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
            provider: PROVIDER_DEFAULT, // Use OpenStreetMap as the provider
            style: styles.map,
            initialRegion: initialRegion,
            customMapStyle: [], // Optionally customize map style
          },
          React.createElement(Marker, {
            coordinate: { latitude: 48.8566, longitude: 2.3522 },
            title: 'Votre position',
          })
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
  header: {
    backgroundColor: '#ffeb3b', // Yellow background like in the image
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  tabActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffeb3b',
  },
  tabInactive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  mapSection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    height: 200,
    borderRadius: 10,
  },
});

export default UserHomeScreen;