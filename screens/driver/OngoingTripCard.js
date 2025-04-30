import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Example icon usage

// Placeholder component to display ongoing trip details
const OngoingTripCard = ({ tripDetails, onEndTrip }) => {
  // Use dummy data if tripDetails is not provided
  const dummyTrip = {
    passengerName: "John Doe",
    pickupAddress: "123 Main St, Anytown",
    dropoffAddress: "456 Oak Ave, Anytown",
    estimatedTime: "15 min",
    distance: "5 km",
  };

  const trip = tripDetails || dummyTrip;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Course en cours</Text>

      <View style={styles.detailRow}>
        <MaterialIcons name="person" size={20} color="#333" />
        <Text style={styles.detailText}>Passager: {trip.passengerName}</Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialIcons name="my-location" size={20} color="#333" />
        <Text style={styles.detailText}>Départ: {trip.pickupAddress}</Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialIcons name="location-on" size={20} color="#333" />
        <Text style={styles.detailText}>Arrivée: {trip.dropoffAddress}</Text>
      </View>

      <View style={styles.infoRow}>
         <View style={styles.infoItem}>
           <MaterialIcons name="timer" size={20} color="#333" />
           <Text style={styles.infoText}>{trip.estimatedTime}</Text>
         </View>
         <View style={styles.infoItem}>
           <MaterialIcons name="turn-sharp-left" size={20} color="#333" />
           <Text style={styles.infoText}>{trip.distance}</Text>
         </View>
      </View>


      {/* Placeholder Button - In a real app, you'd have workflow buttons like "Arrived", "Start Trip", "End Trip" */}
      <TouchableOpacity style={styles.endButton} onPress={onEndTrip}>
        <Text style={styles.endButtonText}>Terminer la course</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    width: '100%',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
   infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#555',
    flexShrink: 1, // Allow text to wrap
  },
   infoText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#555',
   },
  endButton: {
    backgroundColor: '#FF4D4F', // Red color for ending a trip
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OngoingTripCard;