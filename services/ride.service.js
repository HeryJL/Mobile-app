import api from './api';
import axios from 'axios';
export const createRide = async (ride) => {
  const response = await api.post('/rides', ride);
  return response.data;
};

export const getAllRides = async () => {
  const response = await api.get('/rides');
  return response.data;
};

export const updateRide = async (id, ride) => {
  const response = await api.put(`/rides/${id}`, ride);
  return response.data;
};

export const deleteRide = async (id) => {
  const response = await api.delete(`/rides/${id}`);
  return response.data;
};

async function getAddress(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const res = await axios.get(url, {
      headers: { 'User-Agent': 'Node.js App' }
  });

  return res.data.address.suburb || res.data.address.city_district || res.data.display_name;
}
