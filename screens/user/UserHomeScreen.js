import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

const UserHomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.centeredText}>Accueil Utilisateur</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  centeredText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default UserHomeScreen;