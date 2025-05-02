import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SavedRouteView = ({ routeData }) => {
  const navigation = useNavigation();

  const handleViewMap = () => {
    navigation.navigate('MapScreen', { route: routeData });
  };

  const handleCancelRoute = () => {
    // Pour l'instant, on retourne simplement à l'écran de création
    navigation.setParams({ savedRoute: null });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itinéraire Enregistré</Text>
      <View style={styles.routeCard}>
        <View style={styles.routeDetail}>
          <Icon name="location-on" size={24} color="#1E88E5" style={styles.icon} />
          <Text style={styles.routeText}>Départ : {routeData.departure}</Text>
        </View>
        <View style={styles.routeDetail}>
          <Icon name="flag" size={24} color="#1E88E5" style={styles.icon} />
          <Text style={styles.routeText}>Arrivée : {routeData.arrival}</Text>
        </View>
        <View style={styles.routeDetail}>
          <Icon name="straighten" size={24} color="#1E88E5" style={styles.icon} />
          <Text style={styles.routeText}>Distance : {routeData.distance} km</Text>
        </View>
        <View style={styles.statusContainer}>
          <Icon name="hourglass-empty" size={24} color="#F9A825" style={styles.icon} />
          <Text style={styles.statusText}>Statut : En attente de confirmation du chauffeur</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewButton} onPress={handleViewMap}>
          <Icon name="map" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Voir sur la carte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRoute}>
          <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
          <Text style={styles.buttonCancelText}>Annuler l'itinéraire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E88E5',
    textAlign: 'center',
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 24,
    width: '100%',
    alignItems: 'flex-start',
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9A825',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 10,
    width: '100%',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#60a5fa',
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
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

export default SavedRouteView;