import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

const DriverProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 30 }}>
        <Text style={styles.title}>Profil du Conducteur</Text>

        {user && (
          <View style={styles.profileCard}>
            <Image
              source={require('../../assets/driver-avatar.jpg')}
              style={styles.avatar}
            />
            <Text style={styles.label}>Nom : <Text style={styles.value}>{user.firstName} {user.lastName}</Text> </Text>
            <Text style={styles.label}>Email : <Text style={styles.value}>{user.email}</Text></Text>

            {user.licenseNumber && (
              <Text style={styles.label}>Numéro de permis : <Text style={styles.value}>{user.licenseNumber}</Text></Text>
            )}
            {user.carModel && (
              <Text style={styles.label}>Modèle de voiture : <Text style={styles.value}>{user.carModel}</Text></Text>
            )}
            {user.carPlate && (
              <Text style={styles.label}>Plaque d'immatriculation : <Text style={styles.value}>{user.carPlate}</Text></Text>
            )}
          </View>
        )}

        <View style={styles.stats}>
          <Text style={styles.label}>Statistiques</Text>
          <View style={styles.driverStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="directions-car" size={24} color="#007AFF" />
              <Text style={styles.statText}>9 courses</Text>
            </View>
            <View style={styles.statItem}>
              <FontAwesome name="star" size={24} color="#FFD700" />
              <Text style={styles.statText}>3/5</Text>
            </View>
            <View style={styles.statItem}>
              <FontAwesome name="money" size={24} color="#4CAF50" />
              <Text style={styles.statText}>€</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#9C27B0" />
              <Text style={styles.statText}>h en ligne</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
  stats: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  driverStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  statText: {
    color: 'rgba(0, 0, 0, 0.64)',
    marginLeft: 10,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DriverProfileScreen;
