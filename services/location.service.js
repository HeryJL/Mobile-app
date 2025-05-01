import axios from 'axios';
import api from './api';
export const getNearbyTaxis = async (lat, lng, radius = 2) => {
  const response = await api.get(`/location/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  return response.data;
};

export const updateTaxiLocation = async (taxiId, latitude, longitude) => {
  const response = await api.post('/location', { taxiId, latitude, longitude });
  return response.data;
};

export const getTaxiLocation = async (taxiId) => {
  const response = await api.get(`/location/${taxiId}`);
  return response.data;
};

export const deleteTaxiLocation = async (taxiId) => {
  const response = await api.delete(`/location/${taxiId}`);
  return response.data;
};


export const getLocationSuggestions = async (query) => {
  if (query.length < 3) {
    return [];
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5, // Nombre de résultats à renvoyer
      },
    });
    return response.data; // Retourne les suggestions
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions de lieu:', error);
    throw error;
  }
};
