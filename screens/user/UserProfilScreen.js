import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome, Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserRides } from './../../services/ride.service';

const UserProfileScreen = () => {
  const [showAll, setShowAll] = useState(false);
  const { user,userToken, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [historique,setHistorique] = useState(null)
  useEffect(() => {
    (async() => {
      const data = await getUserRides(userToken)
      setHistorique(data)})()
  })
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
          {/* Header avec avatar */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/driver-avatar.jpg')}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editIcon}>
                <Feather name="edit-2" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.subtitle}>Membre depuis 2023 {user._id}</Text>
          </View>

          {/* Carte de fidélité */}
          <View style={styles.loyaltyCard}>
            <LinearGradient
              colors={['#60a5fa', '#3b82f6']}
              style={styles.loyaltyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.loyaltyContent}>
                <View>
                  <Text style={styles.loyaltyTitle}>Votre carte de fidélité</Text>
                  <Text style={styles.loyaltyPoints}>125 points</Text>
                </View>
                <View style={styles.loyaltyProgress}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '65%' }]} />
                  </View>
                  <Text style={styles.progressText}>65% vers votre prochaine récompense</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Informations personnelles */}
          {user && (
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={20} color="#60a5fa" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Feather name="phone" size={20} color="#60a5fa" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoValue}>{user.phone || '+33 6 12 34 56 78'}</Text>
                </View>
              </View>

            
            </View>
          )}

          {/* Historique des courses */}
          <View style={styles.profileCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vos dernières courses</Text>
              <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                <Text style={styles.seeAll}>{showAll ? "Réduire" : "Tout voir"}</Text>
              </TouchableOpacity>
            </View>
            
            {historique ? (
                 (showAll ? historique : historique.slice(0, 2)).map((histo, index) => (
                  <View key={index} style={styles.rideItem}>
                    <View style={styles.rideIcon}>
                      <Ionicons name="car-sport" size={20} color="#60a5fa" />
                    </View>
                    <View style={styles.rideDetails}>
                      <Text style={styles.rideRoute}>
                        {histo.startLocation.destination} → {histo.endLocation.destination}
                      </Text>
                      <Text style={styles.rideDate}>12 juin 2024 - 14:30</Text>
                    </View>
                    <Text style={styles.ridePrice}>{histo.price}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.sectionTitle}>tsy mbola nisy</Text>
              )}

          </View>
          {/* Préférences */}
          <View style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Préférences</Text>
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIcon}>
                <Feather name="music" size={20} color="#60a5fa" />
              </View>
              <Text style={styles.preferenceText}>Musique pendant le trajet</Text>
              <AntDesign name="right" size={18} color="#94a3b8" />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIcon}>
                <Feather name="message-square" size={20} color="#60a5fa" />
              </View>
              <Text style={styles.preferenceText}>Conversation avec le chauffeur</Text>
              <AntDesign name="right" size={18} color="#94a3b8" />
            </View>

           
          </View>

          {/* Bouton de déconnexion */}
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
    marginBottom: 25,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#60a5fa',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  loyaltyCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
  },
  loyaltyGradient: {
    padding: 20,
  },
  loyaltyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loyaltyTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  loyaltyPoints: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  loyaltyProgress: {
    width: '60%',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 10,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 15,
  },
  seeAll: {
    color: '#60a5fa',
    fontSize: 14,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  changeText: {
    color: '#60a5fa',
    fontSize: 12,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rideIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rideDetails: {
    flex: 1,
  },
  rideRoute: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 2,
  },
  rideDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  ridePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
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

export default UserProfileScreen;