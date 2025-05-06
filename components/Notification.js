import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Vibration, Image } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationScreen = () => {
  const [notification, setNotification] = useState(null);
  const [slideAnim] = useState(new Animated.Value(-100)); // Commence caché

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
      animateNotification();
      Vibration.vibrate(500);
    });

    return () => subscription.remove();
  }, []);

  const animateNotification = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!notification) return null;

  return (
    <Animated.View style={[styles.notificationContainer, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.innerContainer}>
        {/* Icône Taxi */}
        <Image source={require('../assets/logo-taxi.png')} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.request.content.title || 'Notification'}</Text>
          <Text style={styles.body}>{notification.request.content.body || ''}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#ffeb3b',
    borderRadius: 16,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    zIndex: 999,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#555',
  },
});

export default NotificationScreen;
