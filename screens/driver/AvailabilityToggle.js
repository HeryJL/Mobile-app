import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
// import { LinearGradient } from 'expo-linear-gradient'; // Optional: uncomment if you want to use LinearGradient here
// 
const AvailabilityToggle = ({ isAvailable, onToggle, loading }) => {
  const {  statut } = useContext(AuthContext)
  return (
    <View style={styles.container}>
      <Text style={styles.statusLabel}>
        Statut actuel :{' '}
        <Text style={statut === "disponible" ? styles.statusAvailable : styles.statusUnavailable}>
          {statut}
        </Text>
      </Text>
      <TouchableOpacity
        style={[
          styles.availabilityButton,
          isAvailable ? styles.available : styles.unavailable,
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.availabilityText}>
            {statut === "disponible" ? 'Passer en Indisponible' : 'Passer en Disponible'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20, // Add some space below the toggle
  },
  statusLabel: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
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
    minWidth: 200, // Give it a minimum width
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default AvailabilityToggle;