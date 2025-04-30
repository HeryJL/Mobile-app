import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location'; // For Expo location services

const UserRouteScreen = () => {
  const insets = useSafeAreaInsets();
  const [isDepartureModalVisible, setIsDepartureModalVisible] = useState(false);
  const [isArrivalModalVisible, setIsArrivalModalVisible] = useState(false);
  const [departure, setDeparture] = useState('Ma position actuelle');
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [arrival, setArrival] = useState('');
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const navigation = useNavigation();

  // Fetch user's current location on component mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission refusée', 'L’accès à la localisation est nécessaire.');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Set default departure to current location
        setSelectedDeparture({
          display_name: 'Ma position actuelle',
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
      } catch (error) {
        console.error('Erreur de localisation:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      }
    })();
  }, []);

  const fetchSuggestions = useCallback(async (text, setResults, setLoading) => {
    setLoading(true);
    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=10`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0 (your@email.com)',
          },
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erreur Nominatim:', error);
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (departure !== 'Ma position actuelle') {
        fetchSuggestions(departure, setDepartureSuggestions, setDepartureLoading);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [departure, fetchSuggestions]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(arrival, setArrivalSuggestions, setArrivalLoading);
    }, 300);

    return () => clearTimeout(handler);
  }, [arrival, fetchSuggestions]);

  const handleSaveRoute = () => {
    if (selectedDeparture && selectedArrival) {
      const newRoute = {
        id: String(Date.now()),
        departure: selectedDeparture.display_name,
        arrival: selectedArrival.display_name,
        departureCoordinates: {
          latitude: parseFloat(selectedDeparture.lat),
          longitude: parseFloat(selectedDeparture.lon),
        },
        arrivalCoordinates: {
          latitude: parseFloat(selectedArrival.lat),
          longitude: parseFloat(selectedArrival.lon),
        },
      };
      setDeparture('Ma position actuelle');
      setArrival('');
      setSelectedArrival(null);
      setIsDepartureModalVisible(false);
      setIsArrivalModalVisible(false);

      navigation.navigate('MapScreen', { route: newRoute });
    } else {
      Alert.alert('Erreur', 'Veuillez sélectionner un lieu de départ et d’arrivée.');
    }
  };

  const handleCancelCreate = () => {
    setDeparture('Ma position actuelle');
    setArrival('');
    setSelectedArrival(null);
    setIsDepartureModalVisible(false);
    setIsArrivalModalVisible(false);
  };

  const handleSelectDeparture = (item) => {
    setDeparture(item.display_name);
    setSelectedDeparture(item);
    setDepartureSuggestions([]);
    setIsDepartureModalVisible(false);
  };

  const handleSelectArrival = (item) => {
    setArrival(item.display_name);
    setSelectedArrival(item);
    setArrivalSuggestions([]);
    setIsArrivalModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Text style={styles.title}>Itinéraire</Text>
        <View style={styles.formContainer}>
          <Text style={styles.modalTitle}>Nouvel itinéraire</Text>
          <TouchableOpacity
            style={styles.inputTouchable}
            onPress={() => setIsDepartureModalVisible(true)}
          >
            <Text style={styles.inputText}>
              {selectedDeparture ? selectedDeparture.display_name : 'Ma position actuelle'}
            </Text>
          </TouchableOpacity>
          {departureLoading && <ActivityIndicator size="small" color="#0000ff" />}
          <TouchableOpacity
            style={styles.inputTouchable}
            onPress={() => setIsArrivalModalVisible(true)}
          >
            <Text style={styles.inputText}>
              {selectedArrival ? selectedArrival.display_name : 'Lieu d’arrivée'}
            </Text>
          </TouchableOpacity>
          {arrivalLoading && <ActivityIndicator size="small" color="#0000ff" />}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSaveRoute}>
              <Text style={styles.buttonText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCreate}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          visible={isDepartureModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsDepartureModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.suggestionsModalContent}>
              <Text style={styles.modalTitle}>Suggestions de départ</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Rechercher un lieu de départ"
                value={departure}
                onChangeText={setDeparture}
              />
              {departureLoading && <ActivityIndicator size="small" color="#0000ff" />}
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={departureSuggestions}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItemTouchable}
                      onPress={() => handleSelectDeparture(item)}
                    >
                      <Text style={styles.suggestionItem}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsDepartureModalVisible(false)}
              >
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={isArrivalModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsArrivalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.suggestionsModalContent}>
              <Text style={styles.modalTitle}>Suggestions d’arrivée</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Rechercher un lieu d’arrivée"
                value={arrival}
                onChangeText={setArrival}
              />
              {arrivalLoading && <ActivityIndicator size="small" color="#0000ff" />}
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={arrivalSuggestions}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItemTouchable}
                      onPress={() => handleSelectArrival(item)}
                    >
                      <Text style={styles.suggestionItem}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsArrivalModalVisible(false)}
              >
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
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
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  inputTouchable: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  confirmButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  suggestionItem: {
    padding: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  suggestionItemTouchable: {
    padding: 8,
  },
  suggestionsContainer: {
    flexGrow: 0,
    maxHeight: '60%',
  },
  modalCancelButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: 'center',
  },
});

export default UserRouteScreen;