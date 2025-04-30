import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { route: initialRouteData } = route.params;
  const [routeData, setRouteData] = useState(initialRouteData); // Données de l'itinéraire (modifiable)
  const [distance, setDistance] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Mode modification
  const mapRef = useRef(null);

  // Calculer la distance et récupérer le trajet lorsque les coordonnées changent
  useEffect(() => {
    if (routeData.departureCoordinates && routeData.arrivalCoordinates) {
      // Calculer la distance en ligne droite avec la formule de Haversine
      const calculateDistance = () => {
        const R = 6371e3; // Rayon de la Terre en mètres
        const lat1 = (routeData.departureCoordinates.latitude * Math.PI) / 180;
        const lat2 = (routeData.arrivalCoordinates.latitude * Math.PI) / 180;
        const deltaLat = ((routeData.arrivalCoordinates.latitude - routeData.departureCoordinates.latitude) * Math.PI) / 180;
        const deltaLon = ((routeData.arrivalCoordinates.longitude - routeData.departureCoordinates.longitude) * Math.PI) / 180;

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c; // Distance en mètres
        return (dist / 1000).toFixed(2); // Convertir en kilomètres
      };

      setDistance(calculateDistance());

      // Récupérer le trajet avec l'API OSRM
      const fetchRoute = async () => {
        try {
          const response = await fetch(
            `http://router.project-osrm.org/route/v1/driving/${routeData.departureCoordinates.longitude},${routeData.departureCoordinates.latitude};${routeData.arrivalCoordinates.longitude},${routeData.arrivalCoordinates.latitude}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
              latitude: lat,
              longitude: lon,
            }));
            setRouteCoordinates(coords);

            // Ajuster la carte pour afficher les deux marqueurs
            if (mapRef.current) {
              mapRef.current.fitToCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates], {
                edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                animated: true,
              });
            }
          }
        } catch (error) {
          console.error('Erreur OSRM:', error);
          // Repli sur une ligne droite si OSRM échoue
          setRouteCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates]);
        }
      };

      fetchRoute();
    }
  }, [routeData]);

  // Fonction pour gérer le clic sur la carte en mode modification
  const handleMapPress = async (event) => {
    if (!isEditing) return; // Ignorer les clics si le mode modification n'est pas activé

    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Récupérer le nom du lieu via Nominatim (géocodage inverse)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp/1.0 (your@email.com)',
          },
        }
      );
      const data = await response.json();
      const displayName = data.display_name || 'Lieu inconnu';

      // Mettre à jour les données de l'itinéraire avec la nouvelle destination
      setRouteData({
        ...routeData,
        arrival: displayName,
        arrivalCoordinates: {
          latitude,
          longitude,
        },
      });

      setIsEditing(false); // Désactiver le mode modification après sélection
    } catch (error) {
      console.error('Erreur Nominatim:', error);
      Alert.alert('Erreur', 'Impossible de récupérer le nom du lieu.');
    }
  };

  // Fonction pour enregistrer l'itinéraire et retourner à l'écran Accueil
  const handleSave = () => {
    navigation.navigate('MainTabs', {
      screen: 'Accueil',
      params: {
        savedRoute: {
          ...routeData,
          distance,
          routeCoordinates,
        },
      },
    });
  };

  // Fonction pour annuler l'itinéraire avec confirmation
  const handleCancel = () => {
    Alert.alert(
      'Confirmer l\'annulation',
      'Voulez-vous vraiment annuler cet itinéraire ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: () => {
            navigation.navigate('MainTabs', { screen: 'Itinéraire' });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Fonction pour activer le mode modification
  const handleEdit = () => {
    setIsEditing(true);
    Alert.alert(
      'Modifier la destination',
      'Cliquez sur la carte pour sélectionner une nouvelle destination.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: routeData.departureCoordinates.latitude,
          longitude: routeData.departureCoordinates.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress} // Gérer les clics sur la carte
      >
        {/* Marqueur pour le point de départ */}
        <Marker
          coordinate={routeData.departureCoordinates}
          title="Départ"
          description={routeData.departure}
          pinColor="green"
        />
        {/* Marqueur pour le point d'arrivée */}
        {routeData.arrivalCoordinates && (
          <Marker
            coordinate={routeData.arrivalCoordinates}
            title="Arrivée"
            description={routeData.arrival}
            pinColor="red"
          />
        )}
        {/* Polyligne pour le trajet */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#0000FF"
            strokeWidth={3} // Correction: Remplacé ] par }
          />
        )}
      </MapView>
      {/* Affichage de la distance */}
      {distance && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Distance: {distance} km</Text>
        </View>
      )}
      {/* Bouton Enregistrer */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </TouchableOpacity>
      {/* Bouton Annuler */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.buttonText}>Annuler</Text>
      </TouchableOpacity>
      {/* Bouton Modifier */}
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.buttonText}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  editButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default MapScreen;