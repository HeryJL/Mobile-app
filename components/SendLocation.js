import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import { updateTaxiLocation } from '../services/location.service';

const SendLocation = ({ Idtaxi }) => {
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
        await updateTaxiLocation(Idtaxi, location.coords.latitude, location.coords.longitude);
      } catch (err) {
        console.error('Erreur envoi position:', Idtaxi);
      }
    };

    updateLocation(); // appel initial
    intervalId = setInterval(updateLocation, 5000); // toutes les 10s

    return () => clearInterval(intervalId);
  }, [Idtaxi]);

  return null;
};

export default SendLocation;
