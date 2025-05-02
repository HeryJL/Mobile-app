import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SavedRouteView = ({ savedRoute, onClearRoute }) => {
  const navigation = useNavigation();

  const handleEditRoute = () => {
    if (savedRoute) {
      navigation.navigate('MapScreen', { route: savedRoute });
    } else {
      Alert.alert('Erreur', 'Aucun itinéraire sauvegardé à modifier.');
    }
  };

  const handleClearRoute = () => {
    Alert.alert(
      'Supprimer l’itinéraire',
      'Voulez-vous vraiment supprimer cet itinéraire ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => {
            onClearRoute();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itinéraire Enregistré</Text>
      <View style={styles.routeContainer}>
        <Text style={styles.routeTitle}>Détails de l'itinéraire</Text>
        <View style={styles.routeDetails}>
          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#1E88E5" style={styles.icon} />
            <Text style={styles.routeText}>
              Départ: {savedRoute.departure || 'Non spécifié'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="flag" size={20} color="#1E88E5" style={styles.icon} />
            <Text style={styles.routeText}>
              Arrivée: {savedRoute.arrival || 'Non spécifié'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="straighten" size={20} color="#1E88E5" style={styles.icon} />
            <Text style={styles.routeText}>
              Distance: {savedRoute.distance || 'Non calculée'} km
            </Text>
          </View>
          {savedRoute.reservation && (
            <>
              <View style={styles.detailRow}>
                <Icon name="local-taxi" size={20} color="#1E88E5" style={styles.icon} />
                <Text style={styles.reservationText}>
                  Taxi: {savedRoute.reservation.model} ({savedRoute.reservation.licensePlate})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="person" size={20} color="#1E88E5" style={styles.icon} />
                <Text style={styles.reservationText}>
                  Chauffeur: {savedRoute.reservation.driverName}
                </Text>
              </View>
            </>
          )}
          <View style={styles.detailRow}>
            <Icon name="hourglass-empty" size={20} color="#FFA500" style={styles.icon} />
            <Text style={styles.statusText}>
              Statut: En attente de confirmation
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditRoute}>
            <Icon name="edit" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearRoute}>
            <Icon name="delete" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
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
  routeContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    marginBottom: 24,
    width: '100%',
    minHeight: '60%',
    justifyContent: 'center',
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1E88E5',
  },
  routeDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  reservationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
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

export default SavedRouteView;
