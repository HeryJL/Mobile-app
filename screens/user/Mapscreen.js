import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Modal } from 'react-native'; // Import Modal
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialIcons';

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { route: initialRouteData } = route.params || {};

  // Vérification initiale des données de l'itinéraire
  if (!initialRouteData || (!initialRouteData.departureCoordinates && !initialRouteData.arrivalCoordinates)) {
      console.error("Missing or invalid initial route data");
      // Afficher une alerte et revenir en arrière si les données sont manquantes
      useEffect(() => {
          Alert.alert("Erreur de données", "Impossible de charger les informations de l'itinéraire.");
          navigation.goBack(); // Ou naviguer vers un écran spécifique
      }, [navigation]);
      return <View style={styles.container}><Text>Chargement...</Text></View>; // Afficher un état de chargement/erreur
  }

  const [routeData, setRouteData] = useState(initialRouteData);
  const [distance, setDistance] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [editingMode, setEditingMode] = useState(null); // 'departure' or 'arrival' - mode actif pour sélectionner sur la carte
  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState(null); // Stocke les infos du marqueur tapé pour la vue d'information
  const mapRef = useRef(null);

  useEffect(() => {
    // Ne récupérer l'itinéraire que si les deux points sont définis
    if (routeData.departureCoordinates && routeData.arrivalCoordinates) {
      const calculateDistance = () => {
        const R = 6371e3; // mètres
        const lat1 = (routeData.departureCoordinates.latitude * Math.PI) / 180; // φ, λ en radians
        const lat2 = (routeData.arrivalCoordinates.latitude * Math.PI) / 180;
        const deltaLat = ((routeData.arrivalCoordinates.latitude - routeData.departureCoordinates.latitude) * Math.PI) / 180;
        const deltaLon = ((routeData.arrivalCoordinates.longitude - routeData.departureCoordinates.longitude) * Math.PI) / 180;

        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const dist = R * c; // en mètres
        return (dist / 1000).toFixed(2); // en kilomètres
      };

      setDistance(calculateDistance());

      const fetchRoute = async () => {
        try {
          // Utilisation d'une instance publique OSRM pour démonstration.
          // Pour la production, envisagez d'héberger la vôtre ou d'utiliser un service payant.
          const response = await fetch(
            `http://router.project-osrm.org/route/v1/driving/${routeData.departureCoordinates.longitude},${routeData.departureCoordinates.latitude};${routeData.arrivalCoordinates.longitude},${routeData.arrivalCoordinates.latitude}?overview=full&geometries=geojson`
          );
          if (!response.ok) {
             const errorBody = await response.text();
             console.error(`OSRM Error ${response.status}:`, errorBody);
            throw new Error(`Erreur de l'API OSRM: ${response.status}`);
          }
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
              latitude: lat,
              longitude: lon,
            }));
            setRouteCoordinates(coords);

            // Ajuster la carte aux coordonnées de l'itinéraire
             if (mapRef.current) {
                 const allCoords = [routeData.departureCoordinates, routeData.arrivalCoordinates, ...coords];
                 if(allCoords.length > 1){
                    mapRef.current.fitToCoordinates(allCoords, {
                      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                      animated: true,
                    });
                 } else if (allCoords.length === 1) { // Si un seul point, animer vers ce point
                     mapRef.current.animateToRegion({
                         latitude: allCoords[0].latitude,
                         longitude: allCoords[0].longitude,
                         latitudeDelta: 0.05,
                         longitudeDelta: 0.05,
                     });
                 }
             }

          } else {
               Alert.alert('Erreur', 'Aucun itinéraire trouvé pour les points sélectionnés.');
               setRouteCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean)); // Afficher une ligne droite si pas d'itinéraire
               if (mapRef.current) {
                   const fallbackCoords = [routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean);
                    if(fallbackCoords.length > 1){
                        mapRef.current.fitToCoordinates(fallbackCoords, {
                           edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                           animated: true,
                       });
                    } else if (fallbackCoords.length === 1) {
                        mapRef.current.animateToRegion({
                            latitude: fallbackCoords[0].latitude,
                            longitude: fallbackCoords[0].longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        });
                    }
               }
          }
        } catch (error) {
          console.error("Fetch route error:", error);
          Alert.alert('Erreur', `Impossible de récupérer le trajet: ${error.message}`);
           setRouteCoordinates([routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean)); // Afficher une ligne droite en cas d'erreur
           if (mapRef.current) {
               const fallbackCoords = [routeData.departureCoordinates, routeData.arrivalCoordinates].filter(Boolean);
               if(fallbackCoords.length > 1){
                   mapRef.current.fitToCoordinates(fallbackCoords, {
                       edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                       animated: true,
                   });
               } else if (fallbackCoords.length === 1) {
                    mapRef.current.animateToRegion({
                       latitude: fallbackCoords[0].latitude,
                       longitude: fallbackCoords[0].longitude,
                       latitudeDelta: 0.05,
                       longitudeDelta: 0.05,
                   });
               }
           }
        }
      };

      fetchRoute();
    } else if (routeData.departureCoordinates || routeData.arrivalCoordinates) {
        // Si un seul point est défini, définir ce point comme itinéraire et centrer la carte
         const singlePoint = routeData.departureCoordinates || routeData.arrivalCoordinates;
         setRouteCoordinates([singlePoint]);
         setDistance(null); // Effacer la distance s'il n'y a qu'un point
         if (mapRef.current && singlePoint) {
              mapRef.current.animateToRegion({
                  latitude: singlePoint.latitude,
                  longitude: singlePoint.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
              });
         }
    } else {
        // Si aucun point n'est défini, effacer l'itinéraire et la distance
        setRouteCoordinates([]);
        setDistance(null);
    }
     // Fonction de nettoyage si nécessaire
     return () => {
        // Tout nettoyage comme l'annulation des requêtes fetch en cours
     };
  }, [routeData]); // Dépend de routeData pour re-fetcher l'itinéraire quand les coordonnées changent

   // Fonction pour gérer le clic sur le marqueur - afficher la vue d'information
   const handleMarkerPress = (type) => {
       if (editingMode) return; // Ne rien faire si déjà en mode édition

       if (type === 'departure' && routeData.departureCoordinates) {
           setSelectedMarkerInfo({
               type: 'Départ', // Type pour l'affichage dans la vue d'info
               name: routeData.departure,
               coordinates: routeData.departureCoordinates,
               markerType: 'departure' // Type original du marqueur ('departure' ou 'arrival')
           });
       } else if (type === 'arrival' && routeData.arrivalCoordinates) {
           setSelectedMarkerInfo({
               type: 'Destination', // Type pour l'affichage dans la vue d'info
               name: routeData.arrival,
               coordinates: routeData.arrivalCoordinates,
               markerType: 'arrival' // Type original du marqueur
           });
       }
   };

    // Fonction pour démarrer l'édition après avoir cliqué sur 'Modifier la position' dans la vue d'info
    const startEditing = () => {
        if(selectedMarkerInfo) {
            setEditingMode(selectedMarkerInfo.markerType); // Définir le mode édition basé sur le type de marqueur
            setSelectedMarkerInfo(null); // Fermer la vue d'information
             // L'affichage de l'overlay d'instruction est géré par l'état editingMode dans le JSX
        }
    };

    // Fonction pour fermer la vue d'information
    const closeInfoView = () => {
        setSelectedMarkerInfo(null);
        // Optionnel: s'assurer que le mode édition est également désactivé si la vue d'info est fermée (dépend du workflow souhaité)
        // setEditingMode(null);
    };


  const handleMapPress = async (event) => {
    if (!editingMode) return; // Procéder uniquement si en mode édition

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const editingPointType = editingMode; // Stocker le type avant de désactiver le mode

    // Désactiver le mode édition immédiatement pour éviter les clics multiples
    setEditingMode(null);

    try {
      // Utilisation de Nominatim pour le géocodage inverse.
      // Fournir un User-Agent clair est recommandé.
      // Soyez attentif à la politique d'utilisation de Nominatim.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (yourcontact@example.com)', // !!! IMPORTANT: Remplacez par le nom et contact de votre application
          },
        }
      );
      if (!response.ok) {
         const errorBody = await response.text();
          console.error(`Nominatim Error ${response.status}:`, errorBody);
        throw new Error(`Erreur de l'API Nominatim: ${response.status}`);
      }
      const data = await response.json();
      const displayName = data.display_name || 'Lieu inconnu';

      if (editingPointType === 'departure') {
        setRouteData({
          ...routeData,
          departure: displayName,
          departureCoordinates: { latitude, longitude },
        });
         // Afficher l'alerte de confirmation après modification réussie
         Alert.alert('Point modifié', `Le point de départ a été défini sur : ${displayName}`);
      } else if (editingPointType === 'arrival') {
        setRouteData({
          ...routeData,
          arrival: displayName,
          arrivalCoordinates: { latitude, longitude },
        });
         // Afficher l'alerte de confirmation après modification réussie
        Alert.alert('Point modifié', `Le point de destination a été défini sur : ${displayName}`);
      }

    } catch (error) {
       console.error("Reverse geocoding error:", error);
      Alert.alert('Erreur', `Impossible de récupérer le nom du lieu: ${error.message}.`);
       // En cas d'erreur après la sélection, l'utilisateur n'est plus en mode édition
    }
  };

  const handleSave = () => {
      // Vérifier que le départ et l'arrivée sont définis avant de sauvegarder
      if (!routeData.departureCoordinates || !routeData.arrivalCoordinates) {
          Alert.alert('Attention', 'Veuillez définir le point de départ et d\'arrivée.');
          return;
      }
    navigation.navigate('MainTabs', {
      screen: 'Accueil', // S'assurer que c'est le bon nom d'écran dans votre navigateur MainTabs
      params: {
        savedRoute: {
          ...routeData,
          distance,
          routeCoordinates, // Passer les coordonnées de l'itinéraire calculées
        },
      },
    });
  };

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
            // Revenir à l'écran Itinéraire ou approprié
            navigation.navigate('MainTabs', { screen: 'Itinéraire' });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
         initialRegion={routeData.departureCoordinates ? {
          latitude: routeData.departureCoordinates.latitude,
          longitude: routeData.departureCoordinates.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : undefined}
        onPress={handleMapPress}
         mapType="standard"
         showsCompass={true}
         showsScale={true}
         showsUserLocation={true} // Afficher la position actuelle de l'utilisateur
      >
        {/* Afficher le marqueur de départ uniquement si les coordonnées existent */}
        {routeData.departureCoordinates && (
          <Marker
            coordinate={routeData.departureCoordinates}
            title="Départ"
            description={routeData.departure}
            pinColor="green"
             onPress={() => handleMarkerPress('departure')} // Utiliser le nouveau gestionnaire
          />
        )}
        {/* Afficher le marqueur d'arrivée uniquement si les coordonnées existent */}
        {routeData.arrivalCoordinates && (
          <Marker
            coordinate={routeData.arrivalCoordinates}
            title="Arrivée"
            description={routeData.arrival}
            pinColor="#F44336"
            onPress={() => handleMarkerPress('arrival')} // Utiliser le nouveau gestionnaire
          />
        )}
        {/* Afficher la polyligne uniquement si les coordonnées sont disponibles et PAS en mode édition ou vue d'info ouverte */}
        {routeCoordinates.length > 0 && !editingMode && !selectedMarkerInfo && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#1e90ff" // Utiliser le bleu de surbrillance
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Vue d'information (Modale) */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={selectedMarkerInfo !== null} // Visible si selectedMarkerInfo est non null
          onRequestClose={closeInfoView} // Gérer la fermeture de la modale (ex: bouton retour Android)
      >
          <View style={styles.modalOverlay}>
              <View style={styles.infoView}>
                  {/* Icône de fermeture */}
                  <TouchableOpacity style={styles.closeIcon} onPress={closeInfoView}>
                      <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                  {/* Contenu de la vue d'info si un marqueur est sélectionné */}
                  {selectedMarkerInfo && (
                      <>
                          <Text style={styles.infoViewTitle}>Point de {selectedMarkerInfo.type}</Text>
                          <Text style={styles.infoViewAddress}>{selectedMarkerInfo.name}</Text>
                          {/* Bouton pour modifier la position */}
                          <TouchableOpacity style={styles.modifyButton} onPress={startEditing}>
                              <Icon name="edit-location" size={20} color="#fff" style={styles.buttonIcon} />
                              <Text style={styles.buttonText}>Modifier la position</Text>
                          </TouchableOpacity>
                      </>
                  )}
              </View>
          </View>
      </Modal>

      {/* Conteneur de distance */}
      {distance && !editingMode && !selectedMarkerInfo && ( // Cacher la distance en mode édition ou vue d'info ouverte
        <View style={styles.distanceContainer}>
          <Icon name="straighten" size={20} color="#1e90ff" style={styles.distanceIcon} /> {/* Utiliser le bleu de surbrillance */}
          <Text style={styles.distanceText}>Distance: {distance} km</Text>
        </View>
      )}

       {/* Overlay pour instruire l'utilisateur pendant le mode édition */}
      {editingMode && (
          <View style={styles.editingOverlay}>
              <Text style={styles.editingText}>
                  Tapez sur la carte pour sélectionner le nouveau point de {editingMode === 'departure' ? 'départ' : 'destination'}.
              </Text>
          </View>
      )}

      {/* Conteneur des boutons (bouton Enregistrer) */}
      <View style={styles.buttonContainer}>
        {/* Afficher le bouton Enregistrer uniquement si PAS en mode édition et PAS de vue d'info ouverte */}
        {!editingMode && !selectedMarkerInfo && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Enregistrer</Text>
            </TouchableOpacity>
        )}
      </View>

       {/* Bouton Annuler */}
       {!editingMode && !selectedMarkerInfo && ( // Afficher le bouton Annuler uniquement si PAS en mode édition et PAS de vue d'info ouverte
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Icon name="close" size={20} color="#60a5fa" style={styles.buttonIcon} />
                <Text style={styles.buttonCancleText}>Annuler</Text>
            </TouchableOpacity>
       )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)', // Fond semi-transparent
      justifyContent: 'center',
      alignItems: 'center',
  },
  infoView: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '90%', // Largeur de la vue d'info
      alignItems: 'center',
      elevation: 10, // Ombre plus forte pour la modale
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      position: 'relative', // Nécessaire pour le positionnement absolu de l'icône de fermeture
  },
  closeIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1, // S'assurer que l'icône de fermeture est cliquable
      padding: 5, // Ajouter un peu de padding pour faciliter le clic
  },
  infoViewTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#333',
      textAlign: 'center', // Centrer le texte
  },
  infoViewAddress: {
      fontSize: 16,
      textAlign: 'center', // Centrer l'adresse
      marginBottom: 20,
      color: '#555',
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa', // Utiliser le bleu principal
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 170, // Position ajustée
    left: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1, // S'assurer qu'il est au-dessus de la carte
  },
  distanceIcon: {
    marginRight: 8,
    color: '#1e90ff', // Utiliser le bleu de surbrillance
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editingOverlay: {
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - 50,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Overlay légèrement plus sombre
      padding: 20, // Padding augmenté
      borderRadius: 10, // Plus arrondi
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10, // S'assurer qu'il est au-dessus de tous les autres éléments
      // Ajouter une subtile ombre à l'overlay
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
  },
  editingText: {
      color: '#fff',
      fontSize: 18, // Taille de police plus grande
      fontWeight: 'bold', // Texte en gras
      textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 5, // S'assurer que les boutons sont au-dessus de la carte mais sous l'overlay d'édition
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#60a5fa', // Utiliser le bleu principal
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#fff', // Rouge consistant
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 5, // S'assurer qu'il est au-dessus de la carte
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  buttonCancleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#60a5fa',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default MapScreen;