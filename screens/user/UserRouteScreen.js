import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const UserRouteScreen = () => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [savedRoutes, setSavedRoutes] = useState([]);
  const { user } = useContext(AuthContext);
  const handleCreateRoutePress = () => {
    setIsModalVisible(true);
  };

  const handleTaxiReservation = (taxi) => {
    createRide({
      clientId: user._id,
      taxiId:taxi.id, 
      startLocation, 
      endLocation,
      distanceKm: 2,
      price: 100,
      heure: "12:20"
    }).then(() => {
        Alert.alert('Réservation réussie!', `Taxi ${taxi.driverName} réservé.`);
      })
      .catch(() => {
        Alert.alert('Erreur', 'Impossible de réserver ce taxi.');
      });
  };
  const handleSaveRoute = () => {
    if (departure && arrival && departureTime) {
      const newRoute = { id: String(Date.now()), departure, arrival, departureTime };
      setSavedRoutes([...savedRoutes, newRoute]);
      setDeparture('');
      setArrival('');
      setDepartureTime('');
      setIsModalVisible(false);
    } else {
      alert('Veuillez entrer le lieu de départ, d\'arrivée et l\'heure de départ.');
    }
  };

  const handleCancelCreate = () => {
    setIsModalVisible(false);
    setDeparture('');
    setArrival('');
    setDepartureTime('');
  };

  const renderSavedRoute = ({ item }) => (
    <View style={styles.savedRouteItem}>
      <Text style={styles.routeText}>Départ : {item.departure}</Text>
      <Text style={styles.routeText}>Arrivée : {item.arrival}</Text>
      <Text style={styles.routeText}>Heure de départ : {item.departureTime}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Text style={styles.title}>Itinéraire</Text>

        <TouchableOpacity style={styles.createRouteButton} onPress={handleCreateRoutePress}>
          <Text style={styles.buttonText}>Créer un itinéraire</Text>
        </TouchableOpacity>

        <View style={styles.savedRoutesContainer}>
          <Text style={styles.subtitle}>Itinéraires enregistrés</Text>
          {savedRoutes.length === 0 ? (
            <Text>Aucun itinéraire enregistré pour le moment.</Text>
          ) : (
            <FlatList
              data={savedRoutes}
              keyExtractor={(item) => item.id}
              renderItem={renderSavedRoute}
            />
          )}
        </View>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCancelCreate}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nouveau itinéraire</Text>
              <TextInput
                style={styles.input}
                placeholder="Lieu de départ"
                value={departure}
                onChangeText={setDeparture}
              />
              <TextInput
                style={styles.input}
                placeholder="Lieu d'arrivée"
                value={arrival}
                onChangeText={setArrival}
              />
              <TextInput
                style={styles.input}
                placeholder="Heure de départ (HH:MM)"
                value={departureTime}
                onChangeText={setDepartureTime}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoute}>
                  <Text style={styles.buttonText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCreate}>
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  createRouteButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savedRoutesContainer: {
    marginTop: 30,
    padding: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  savedRouteItem: {
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  routeText: {
    fontSize: 16,
  },
});

export default UserRouteScreen;