// src/services/notificationService.ts

import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';

// 1. Gérer l'affichage même en background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // Affiche la notification visuellement
    shouldPlaySound: true,   // Joue un son système
    shouldSetBadge: false,   // Pas de badge (chiffre sur l'icône)
  }),
});

// 2. Fonction pour demander les permissions
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission de notification refusée');
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token
}

// 3. Fonction pour vibration et son custom
export async function triggerVibrationAndSound() {
  try {
    // Vibration légère
    Vibration.vibrate(500);

    // Retour haptique sur iOS/Android récents
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Son personnalisé
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/notification.mp3'),
      { shouldPlay: true }
    );
    await sound.playAsync();
  } catch (error) {
    console.error('Erreur son ou vibration :', error);
  }
}
