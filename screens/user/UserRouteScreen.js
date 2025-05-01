import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { AuthContext } from '../../context/AuthContext';
import Icon from '@expo/vector-icons/MaterialIcons';

const UserRouteScreen = () => {
  const insets = useSafeAreaInsets();
  const [isDepartureModalVisible, setIsDepartureModalVisible] = useState(false);
  const [isArrivalModalVisible, setIsArrivalModalVisible] = useState(false);
  const [departure, setDeparture] = useState('');
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [arrival, setArrival] = useState('');
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // Récupérer la position actuelle de l'utilisateur au montage
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

        // Reverse geocoding pour obtenir le nom du lieu
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ReactNativeApp/1.0 (' + user?.email + ')',
            },
          }
        );
        const data = await response.json();
        const placeName = data.display_name || 'Position actuelle';
        setDeparture(placeName);
        setSelectedDeparture({
          display_name: placeName,
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
      } catch (error) {
        console.error('Erreur de localisation ou reverse geocoding:', error);
        Alert.alert('Erreur', 'Impossible de récupérer votre position ou le nom du lieu.');
        setDeparture('Position actuelle');
        setSelectedDeparture(null);
      }
    })();
  }, [user]);

  // Fonction pour récupérer les suggestions d'autocomplétion
  const fetchSuggestions = useCallback(async (text, setResults, setLoading) => {
    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}%&format=json&addressdetails=1&limit=10`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0 (' + user?.email + ')',
          },
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erreur Nominatim:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Géstion des suggestions pour le départ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (departure && departure !== selectedDeparture?.display_name) {
        fetchSuggestions(departure, setDepartureSuggestions, setDepartureLoading);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [departure, fetchSuggestions, selectedDeparture]);

  // Gestion des suggestions pour l'arrivée
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(arrival, setArrivalSuggestions, setArrivalLoading);
    }, 500);
    return () => clearTimeout(timer);
  }, [arrival, fetchSuggestions]);

  // Enregistrer l'itinéraire et naviguer vers MapScreen
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
        distance: null,
        routeCoordinates: [],
      };
      console.log('New route created:', newRoute);
      setDeparture(selectedDeparture.display_name);
      setArrival('');
      setSelectedArrival(null);
      setIsDepartureModalVisible(false);
      setIsArrivalModalVisible(false);
      navigation.navigate('MapScreen', { route: newRoute });
    } else {
      Alert.alert('Erreur', 'Veuillez sélectionner un lieu de départ et d’arrivée.');
    }
  };

  // Annuler la création de l'itinéraire
  const handleCancelCreate = () => {
    setDeparture(selectedDeparture?.display_name || '');
    setArrival('');
    setSelectedArrival(null);
    setIsDepartureModalVisible(false);
    setIsArrivalModalVisible(false);
  };

  // Sélectionner un lieu de départ depuis les suggestions
  const handleSelectDeparture = (item) => {
    setDeparture(item.display_name);
    setSelectedDeparture(item);
    setDepartureSuggestions([]);
    setIsDepartureModalVisible(false);
  };

  // Sélectionner un lieu d'arrivée depuis les suggestions
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
          <Text style={styles.modalTitle}>Les positions</Text>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setIsDepartureModalVisible(true)}
          >
            <Icon name="location-on" size={24} color="#1E88E5" style={styles.inputIcon} />
            <Text style={styles.inputText}>
              {selectedDeparture ? selectedDeparture.display_name : 'Chargement...'}
            </Text>
          </TouchableOpacity>
          {departureLoading && <ActivityIndicator size="small" color="#1E88E5" />}

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setIsArrivalModalVisible(true)}
          >
            <Icon name="flag" size={24} color="#1E88E5" style={styles.inputIcon} />
            <Text style={styles.inputText}>
              {selectedArrival ? selectedArrival.display_name : 'Lieu d’arrivée'}
            </Text>
          </TouchableOpacity>
          {arrivalLoading && <ActivityIndicator size="small" color="#1E88E5" />}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSaveRoute}>
              <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCreate}>
              <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
              <Text style={styles.buttonCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal départ */}
        <Modal
          visible={isDepartureModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsDepartureModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.suggestionsModalContent}>
              <Text style={styles.modalTitle}>Suggestions de départ</Text>
              <View style={styles.modalInputContainer}>
                <Icon name="search" size={24} color="#1E88E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Rechercher un lieu de départ"
                  value={departure}
                  onChangeText={setDeparture}
                />
              </View>
              {departureLoading && <ActivityIndicator size="small" color="#1E88E5" />}
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={departureSuggestions}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItemTouchable}
                      onPress={() => handleSelectDeparture(item)}
                    >
                      <Icon name="location-pin" size={20} color="#1E88E5" style={styles.suggestionIcon} />
                      <Text style={styles.suggestionItem}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsDepartureModalVisible(false)}
              >
                <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
                <Text style={styles.buttonClosetext}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal arrivée */}
        <Modal
          visible={isArrivalModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsArrivalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.suggestionsModalContent}>
              <Text style={styles.modalTitle}>Suggestions d’arrivée</Text>
              <View style={styles.modalInputContainer}>
                <Icon name="search" size={24} color="#1E88E5" style={styles.inputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Rechercher un lieu d’arrivée"
                  value={arrival}
                  onChangeText={setArrival}
                />
              </View>
              {arrivalLoading && <ActivityIndicator size="small" color="#1E88E5" />}
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={arrivalSuggestions}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItemTouchable}
                      onPress={() => handleSelectArrival(item)}
                    >
                      <Icon name="location-pin" size={20} color="#1E88E5" style={styles.suggestionIcon} />
                      <Text style={styles.suggestionItem}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsArrivalModalVisible(false)}
              >
                <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
                <Text style={styles.buttonClosetext}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// === Stylesheet ===
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
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
  formContainer: {
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1E88E5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderColor: '#dbeafe',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
    marginTop: 10,
    backgroundColor: '#f8fafc',
    elevation: 2,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    rowGap: 30,
    columnGap: 10,
    marginTop: 150,
  },
  confirmButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsModalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderColor: '#dbeafe',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    width: '100%',
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  suggestionItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    width: '100%',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionItem: {
    fontSize: 16,
    color: '#333',
  },
  suggestionsContainer: {
    flexGrow: 1,
    maxHeight: 300,
    width: '100%',
    marginBottom: 12,
  },
  modalCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#60a5fa',
    marginTop: 16,
  },
  buttonClosetext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default UserRouteScreen;