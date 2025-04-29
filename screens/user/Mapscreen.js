import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapAutocompleteScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchSuggestions = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              text
            )}&format=json&addressdetails=1&limit=5`,
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
  };

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setSelectedLocation({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: selectedLocation ? selectedLocation.latitude : 48.8566,
          longitude: selectedLocation ? selectedLocation.longitude : 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Lieu sélectionné"
            description={query}
          />
        )}
      </MapView>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Entrez un lieu"
          value={query}
          onChangeText={fetchSuggestions}
        />

        {loading && <ActivityIndicator size="small" color="#0000ff" />}

        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <Text style={styles.item}>{item.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    height: 45,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  item: {
    padding: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});
