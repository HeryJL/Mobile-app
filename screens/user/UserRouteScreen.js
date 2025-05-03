
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
import SavedRouteView from './SavedRouteView';

const UserRouteScreen = () => {
  const insets = useSafeAreaInsets();
  const { savedRoute, updateSavedRoute } = useContext(AuthContext);
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

  // Obtenir la position actuelle de l'utilisateur au chargement
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

  // Fonction pour récupérer les suggestions de lieux depuis Nominatim
  const fetchSuggestions = useCallback(async (text, setResults, setLoading) => {
    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=10`,
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

  // Déclencher la recherche de suggestions pour le départ
  useEffect(() => {
    const timer = setTimeout(() => {
      if (departure && departure !== selectedDeparture?.display_name) {
        fetchSuggestions(departure, setDepartureSuggestions, setDepartureLoading);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [departure, fetchSuggestions, selectedDeparture]);

  // Déclencher la recherche de suggestions pour l'arrivée
  useEffect(() => {
    const timer = setTimeout(() => {
      if (arrival && arrival !== selectedArrival?.display_name) {
        fetchSuggestions(arrival, setArrivalSuggestions, setArrivalLoading);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [arrival, fetchSuggestions, selectedArrival]);

  // Calculer la distance entre deux coordonnées
  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;
    const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return (dist / 1000).toFixed(2); // Distance en kilomètres
  };

  // Sauvegarder l'itinéraire et naviguer vers MapScreen
  const handleSaveRoute = async () => {
    if (selectedDeparture && selectedArrival) {
      const departureLat = parseFloat(selectedDeparture.lat);
      const departureLon = parseFloat(selectedDeparture.lon);
      const arrivalLat = parseFloat(selectedArrival.lat);
      const arrivalLon = parseFloat(selectedArrival.lon);

      const distance = calculateDistance(
        { latitude: departureLat, longitude: departureLon },
        { latitude: arrivalLat, longitude: arrivalLon }
      );

      let crossesCountry = false;
      let crossesSea = false;

      try {
        const departureResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${departureLat}&lon=${departureLon}&format=json&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ReactNativeApp/1.0 (' + user?.email + ')',
            },
          }
        );
        const departureData = await departureResponse.json();

        const arrivalResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${arrivalLat}&lon=${arrivalLon}&format=json&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ReactNativeApp/1.0 (' + user?.email + ')',
            },
          }
        );
        const arrivalData = await arrivalResponse.json();

        const departureCountry = departureData.address?.country;
        const arrivalCountry = arrivalData.address?.country;
        if (departureCountry && arrivalCountry && departureCountry !== arrivalCountry) {
          crossesCountry = true;
        }

        const departureType = departureData.addresstype;
        const arrivalType = arrivalData.addresstype;
        if (
          departureType === 'water' ||
          arrivalType === 'water' ||
          departureData.address?.natural === 'water' ||
          arrivalData.address?.natural === 'water'
        ) {
          crossesSea = true;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des lieux:', error);
        Alert.alert('Erreur', 'Impossible de vérifier les lieux.');
        return;
      }

      if (parseFloat(distance) > 30 || crossesCountry || crossesSea) {
        let errorMessage = 'Itinéraire non valide : ';
        if (parseFloat(distance) > 30) {
          errorMessage += `la distance (${distance} km) dépasse 30 km`;
        }
        if (crossesCountry) {
          errorMessage += `${parseFloat(distance) > 30 ? ', ' : ''}changement de pays détecté`;
        }
        if (crossesSea) {
          errorMessage += `${parseFloat(distance) > 30 || crossesCountry ? ', ' : ''}passage par la mer détecté`;
        }
        errorMessage += '.';
        Alert.alert('Erreur', errorMessage);
        return;
      }

      const newRoute = {
        id: String(Date.now()),
        departure: selectedDeparture.display_name,
        arrival: selectedArrival.display_name,
        departureCoordinates: {
          latitude: departureLat,
          longitude: departureLon,
        },
        arrivalCoordinates: {
          latitude: arrivalLat,
          longitude: arrivalLon,
        },
        distance: distance,
        duration: null, // Initialisé à null, sera calculé dans MapScreen.js
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

  // Sélectionner un lieu de départ
  const handleSelectDeparture = (item) => {
    setSelectedDeparture(item);
    setDeparture(item.display_name);
    setDepartureSuggestions([]);
    setIsDepartureModalVisible(false);
  };

  // Sélectionner un lieu d'arrivée
  const handleSelectArrival = (item) => {
    setSelectedArrival(item);
    setArrival(item.display_name);
    setArrivalSuggestions([]);
    setIsArrivalModalVisible(false);
  };

  // Supprimer l'itinéraire sauvegardé
  const handleClearRoute = () => {
    updateSavedRoute(null);
  };

  // Rendu des suggestions de lieux
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() =>
        isDepartureModalVisible
          ? handleSelectDeparture(item)
          : handleSelectArrival(item)
      }
    >
      <Icon name="place" size={20} color="#60a5fa" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item.display_name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {savedRoute ? (
        <SavedRouteView savedRoute={savedRoute} onClear={handleClearRoute} />
      ) : (
        <>
          <Text style={styles.title}>Créer un itinéraire</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setIsDepartureModalVisible(true)}
            >
              <Icon name="my-location" size={24} color="#60a5fa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Lieu de départ"
                value={departure}
                onChangeText={setDeparture}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setIsArrivalModalVisible(true)}
            >
              <Icon name="location-on" size={24} color="#F44336" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Lieu d’arrivée"
                value={arrival}
                onChangeText={setArrival}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoute}>
              <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCreate}>
              <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal pour le départ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDepartureModalVisible}
        onRequestClose={() => setIsDepartureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setIsDepartureModalVisible(false)}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sélectionner le lieu de départ</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Rechercher un lieu"
              value={departure}
              onChangeText={setDeparture}
              autoFocus
            />
            {departureLoading ? (
              <ActivityIndicator size="large" color="#60a5fa" style={styles.loader} />
            ) : (
              <FlatList
                data={departureSuggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.place_id.toString()}
                style={styles.suggestionList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour l'arrivée */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isArrivalModalVisible}
        onRequestClose={() => setIsArrivalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setIsArrivalModalVisible(false)}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sélectionner le lieu d’arrivée</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Rechercher un lieu"
              value={arrival}
              onChangeText={setArrival}
              autoFocus
            />
            {arrivalLoading ? (
              <ActivityIndicator size="large" color="#60a5fa" style={styles.loader} />
            ) : (
              <FlatList
                data={arrivalSuggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.place_id.toString()}
                style={styles.suggestionList}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  suggestionList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  loader: {
    marginVertical: 20,
  },
});

export default UserRouteScreen;
