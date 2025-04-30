import React, { useContext,useState,useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DriverHomeScreen = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    console.log('Statut du conducteur:', isAvailable ? 'Indisponible' : 'Disponible');
  };

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <LinearGradient
      colors={['#fff', '#fff']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top }]}
          style={{ opacity: fadeAnim }}
        >
          <Text style={styles.title}>Bienvenue {user.firstName} </Text>

          <Text style={styles.subtitle}>
            Statut actuel :
            <Text style={isAvailable ? styles.statusAvailable : styles.statusUnavailable}>
              {' '}{isAvailable ? 'Disponible' : 'Indisponible'}
            </Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.availabilityButton,
              isAvailable ? styles.available : styles.unavailable,
            ]}
            onPress={toggleAvailability}
            activeOpacity={0.8}
          >
            <Text style={styles.availabilityText}>
              {isAvailable ? 'Passer en Indisponible' : 'Passer en Disponible'}
            </Text>
          </TouchableOpacity>
          <View style={styles.cours}>
            <Text style={styles.courseLabel}> Course en cours</Text>
            <View style={styles.map}></View>
            <TouchableOpacity
              style={[
                styles.cancelButton,
              ]}
              activeOpacity={0.8}
            ><Text style={styles.cancelText}>Terminer</Text></TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgb(0, 0, 0)',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  statusAvailable: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusUnavailable: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  availabilityButton: {
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#F44336',
  },
  availabilityText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  cours: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    width: '100%',
    elevation: 6,
  },
  courseLabel: {
    marginTop: 5,
    fontSize: 18,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  map: {
    width: '100%',
    height: '400',
    backgroundColor: 'rgba(46, 161, 81, 0.88)',
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DriverHomeScreen;
