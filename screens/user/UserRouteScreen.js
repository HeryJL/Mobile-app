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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (departure && departure !== selectedDeparture?.display_name) {
        fetchSuggestions(departure, setDepartureSuggestions, setDepartureLoading);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [departure, fetchSuggestions, selectedDeparture]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(arrival, setArrivalSuggestions, setArrivalLoading);
    }, 500);
    return () => clearTimeout(timer);
  }, [arrival, fetchSuggestions]);

  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3;
    const lat1 = (coord1.latitude * Math.PI) / 180;
    const lat2 = (coord2.latitude * Math.PI) / 180;
    const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return (dist / 1000).toFixed(2);
  };

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

  const handleCancelCreate = () => {
    setDeparture(selectedDeparture?.display_name || '');
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

  const handleClearRoute = () => {
    Alert.alert(
      'Supprimer l’itinéraire',
      'Voulez-vous vraiment supprimer cet itinéraire ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => updateSavedRoute(null),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        {savedRoute ? (
          <SavedRouteView savedRoute={savedRoute} onClear={handleClearRoute} />
        ) : (
          <>
            <View style={styles.formContainer}>
              <Text style={styles.modalTitle}>Les positions</Text>

              <Text style={styles.inputLabel}>Départ</Text>
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

              <Text style={styles.inputLabel}>Arrivée</Text>
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
                  <Text style={styles.can}>Confirmer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCreate}>
                  <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
                  <Text style={styles.buttonCancelText}>Annuler</Text>
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
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

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
    padding: 20,
    marginBottom: 24,
    width: '100%',
    minHeight: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
    color: '#1E88E5',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
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