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

export const getUserRides = async (id) => {
  const response = await api.get(`/rides/${id}`);
  return response.data
};
export const getRideLoad = async(id) => {
  const response = await api.get(`/ridesLoad/${id}`);
  return response.data
}
export const updateRide = async (id, ride) => {
  const response = await api.put(`/rides/${id}`, ride);
  return response.data;
};

export const deleteRide = async (id) => {
  const response = await api.delete(`/rides/${id}`);
  return response.data
};

export const getAddress = async (coord) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coord[1]}&lon=${coord[0]}`;
  const res = await axios.get(url, {
      headers: { 'User-Agent': 'Node.js App' }
  });

  return res.data.address.suburb || res.data.address.city_district || res.data.display_name;
}
