
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import * as Notifications from 'expo-notifications';

// Données simulées des taxis (pour obtenir les coordonnées initiales du taxi)
const mockTaxis = [
  {
    _id: 'taxi1',
    driverId: { name: 'Jean Dupont', phone: '+261 34 123 4567' },
    licensePlate: 'TAXI-123',
    model: 'Toyota Corolla',
    color: 'Jaune',
    status: 'disponible',
    coordinates: { latitude: -18.8792, longitude: 47.5079 },
  },
  {
    _id: 'taxi2',
    driverId: { name: 'Marie Rakoto', phone: '+261 33 987 6543' },
    licensePlate: 'TAXI-456',
    model: 'Peugeot 208',
    color: 'Noir',
    status: 'disponible',
    coordinates: { latitude: -18.8700, longitude: 47.5100 },
  },
  {
    _id: 'taxi3',
    driverId: { name: 'Paul Rabe', phone: '+261 32 555 7890' },
    licensePlate: 'TAXI-789',
    model: 'Hyundai Accent',
    color: 'Bleu',
    status: 'occupé',
    coordinates: { latitude: -18.8850, longitude: 47.5000 },
  },
  {
    _id: 'taxi4',
    driverId: { name: 'Sophie Andria', phone: '+261 34 222 3333' },
    licensePlate: 'TAXI-101',
    model: 'Renault Clio',
    color: 'Blanc',
    status: 'disponible',
    coordinates: { latitude: -18.8750, longitude: 47.5150 },
  },
];

const SavedRouteView = ({ savedRoute, onClear }) => {
  const navigation = useNavigation();
  const { updateSavedRoute } = useContext(AuthContext);

  const handleEditRoute = () => {
    navigation.navigate('MapScreen', { route: savedRoute });
  };

  // Fonction pour calculer le temps estimé (en minutes) basé sur la distance
  const calculateEstimatedTime = (taxiCoordinates, departureCoordinates) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const lat1 = (taxiCoordinates.latitude * Math.PI) / 180;
    const lat2 = (departureCoordinates.latitude * Math.PI) / 180;
    const deltaLat = ((departureCoordinates.latitude - taxiCoordinates.latitude) * Math.PI) / 180;
    const deltaLon = ((departureCoordinates.longitude - taxiCoordinates.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c / 1000; // Distance en kilomètres

    const averageSpeed = 30; // Vitesse moyenne en km/h
    const timeHours = distance / averageSpeed; // Temps en heures
    const timeMinutes = Math.ceil(timeHours * 60); // Temps en minutes, arrondi à l'entier supérieur
    return timeMinutes;
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
      // Trouver le taxi correspondant à la réservation
      const taxi = mockTaxis.find(t => t._id === savedRoute.reservation.taxiId);
      if (!taxi) {
        throw new Error('Taxi non trouvé');
      }

      // Calculer le temps estimé pour que le taxi arrive au point de départ
      const estimatedTime = calculateEstimatedTime(taxi.coordinates, savedRoute.departureCoordinates);

      // Mettre à jour le statut de la réservation et ajouter le temps estimé
      const updatedRoute = {
        ...savedRoute,
        reservation: {
          ...savedRoute.reservation,
          status: 'confirmed',
          estimatedTime, // Ajouter le temps estimé (en minutes)
        },
      };

      // Mettre à jour le trajet dans le contexte
      updateSavedRoute(updatedRoute);

      // Envoyer une notification locale
      await sendLocalNotification(
        'Trajet accepté',
        `Le chauffeur ${savedRoute.reservation.driverName} a accepté votre trajet avec le taxi ${savedRoute.reservation.model} (${savedRoute.reservation.licensePlate}). Temps estimé d'arrivée : ${estimatedTime} min.`
      );

      Alert.alert('Succès', `Le chauffeur a accepté le trajet. Temps estimé d'arrivée : ${estimatedTime} min.`);
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
        {savedRoute.duration && (
          <Text style={styles.routeText}>Durée: {savedRoute.duration} min</Text>
        )}
        {savedRoute.reservation && (
          <>
            <Text style={styles.reservationText}>
              Réservation: Taxi {savedRoute.reservation.model} ({savedRoute.reservation.licensePlate})
            </Text>
            <Text style={styles.reservationText}>
              Chauffeur: {savedRoute.reservation.driverName}
            </Text>
            {savedRoute.reservation.estimatedTime && savedRoute.reservation.status === 'pending' && (
              <Text style={styles.reservationText}>
                Temps estimé d'arrivée : {savedRoute.reservation.estimatedTime} min
              </Text>
            )}
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
