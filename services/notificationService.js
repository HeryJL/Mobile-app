import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function requestNotificationPermission() {
  try {
    // Vérifie si l'app tourne sur un vrai appareil
    if (!Constants.isDevice) {
      throw new Error('Les notifications push ne fonctionnent que sur un vrai appareil physique');
    }

    // Demande les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission de notification refusée');
    }

    // Récupère le token Expo Push
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;
    
    console.log('Push Token:', pushToken);
    return pushToken;

  } catch (error) {
    console.error('Erreur lors de l’obtention du token de notification :', error);
    throw error;
  }
}
