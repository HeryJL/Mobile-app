import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import { updateTaxiLocation } from '../services/location.service';

const SendLocation = ({ taxiId }) => {
  useEffect(() => {
    let intervalId;

    const updateLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission refusée');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        await updateTaxiLocation(taxiId, latitude, longitude);
        console.log('Position envoyée');
      } catch (err) {
        console.error('Erreur envoi position:', err.message);
      }
    };

    updateLocation(); // appel initial
    intervalId = setInterval(updateLocation, 10000); // toutes les 10s

    return () => clearInterval(intervalId);
  }, [taxiId]);

  return null;
};

export default SendLocation;
