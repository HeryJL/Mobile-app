import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DriverProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = () => {
    logout();
  };

  return (
    <LinearGradient
    colors={['#74c7ec', '#60a5fa']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView 
          contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top }]}
          style={{ opacity: fadeAnim }}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/driver-avatar.jpg')}
                style={styles.avatar}
              />
              <View style={styles.avatarBorder} />
            </View>
            <Text style={styles.title}>{user?.firstName || 'Profil'} {user?.lastName}</Text>
            
          </View>

          {user && (
            <View style={styles.profileCard}>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={22} color="#60a5fa" style={styles.infoIcon} />
                <View>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              {user.licenseNumber && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="card-membership" size={22} color="#60a5fa" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Permis de conduire</Text>
                    <Text style={styles.infoValue}>{user.licenseNumber}</Text>
                  </View>
                </View>
              )}

              {user.carModel && (
                <View style={styles.infoItem}>
                  <Ionicons name="car-sport" size={22} color="#60a5fa" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Véhicule</Text>
                    <Text style={styles.infoValue}>{user.carModel}</Text>
                  </View>
                </View>
              )}

              {user.carPlate && (
                <View style={styles.infoItem}>
                  <MaterialIcons name="confirmation-number" size={22} color="#60a5fa" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Plaque d'immatriculation</Text>
                    <Text style={styles.infoValue}>{user.carPlate}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                  <MaterialIcons name="directions-car" size={24} color="#007AFF" />
                </View>
                <Text style={styles.statNumber}>9</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                  <FontAwesome name="star" size={24} color="#FFD700" />
                </View>
                <Text style={styles.statNumber}>3.5</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                  <FontAwesome name="money" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.statNumber}>€245</Text>
                <Text style={styles.statLabel}>Gains</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                  <Ionicons name="time" size={24} color="#9C27B0" />
                </View>
                <Text style={styles.statNumber}>12h</Text>
                <Text style={styles.statLabel}>En ligne</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out" size={20} color="#FF4D4F" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  avatarBorder: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 2,
    borderColor: '#60a5fa',
    top: -3,
    left: -3,
    zIndex: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  profileCard: {
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.71)',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.71)',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgb(255, 255, 255)',
    
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.93)',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.93)',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4D4F',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default DriverProfileScreen;
