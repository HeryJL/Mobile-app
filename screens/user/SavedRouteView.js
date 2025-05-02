import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import * as Notifications from 'expo-notifications';

const SavedRouteView = ({ savedRoute, onClear }) => {
  const navigation = useNavigation();
  const { updateSavedRoute } = useContext(AuthContext);

  const handleEditRoute = () => {
    navigation.navigate('MapScreen', { route: savedRoute });
  };

  const sendLocalNotification = async (title, body) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: { seconds: 1 }, // Déclencher immédiatement
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification.');
    }
  };

  const handleSimulateDriverAccept = async () => {
    try {
      // Mettre à jour le statut de la réservation
      const updatedRoute = {
        ...savedRoute,
        reservation: {
          ...savedRoute.reservation,
          status: 'confirmed',
        },
      };

      // Mettre à jour le trajet dans le contexte
      updateSavedRoute(updatedRoute);

      // Envoyer une notification locale
      await sendLocalNotification(
        'Trajet accepté',
        `Le chauffeur ${savedRoute.reservation.driverName} a accepté votre trajet avec le taxi ${savedRoute.reservation.model} (${savedRoute.reservation.licensePlate}).`
      );

      Alert.alert('Succès', 'Le chauffeur a accepté le trajet.');
    } catch (error) {
      console.error('Erreur lors de la simulation de l\'acceptation:', error);
      Alert.alert('Erreur', 'Impossible de simuler l\'acceptation du chauffeur.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Itinéraire Enregistré</Text>
      <View style={styles.routeDetails}>
        <Text style={styles.routeText}>Départ: {savedRoute.departure || 'Non spécifié'}</Text>
        <Text style={styles.routeText}>Arrivée: {savedRoute.arrival || 'Non spécifié'}</Text>
        <Text style={styles.routeText}>Distance: {savedRoute.distance || 'Non calculée'} km</Text>
        {savedRoute.reservation && (
          <>
            <Text style={styles.reservationText}>
              Réservation: Taxi {savedRoute.reservation.model} ({savedRoute.reservation.licensePlate})
            </Text>
            <Text style={styles.reservationText}>
              Chauffeur: {savedRoute.reservation.driverName}
            </Text>
            <Text style={styles.statusText}>
              Statut: {savedRoute.reservation.status === 'pending' ? 'En attente de confirmation' : 'Confirmé'}
            </Text>
          </>
        )}
        <View style={styles.actions}>
          {savedRoute.reservation && savedRoute.reservation.status === 'pending' && (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEditRoute}>
                <Icon name="edit" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                <Icon name="delete" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleSimulateDriverAccept}>
                <Icon name="check-circle" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Simuler Acceptation Chauffeur</Text>
              </TouchableOpacity>
            </>
          )}
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
  routeDetails: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  reservationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
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