import React from 'react';
import {Text, StyleSheet,} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.safeArea , { paddingTop: insets.top }]}>
      <Text style={styles.centeredText}>Accueil Utilisateur</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingHorizontal: 20,
    paddingBottom: 30,
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