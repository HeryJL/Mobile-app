import api from './api';

export const createTaxi = async (taxi) => {
  const response = await api.post('/taxis', taxi);
  return response.data;
};

export const getAllTaxis = async () => {
  const response = await api.get('/taxis');
  return response.data;
};

export const getTaxiById = async (id) => {
  const response = await api.get(`/taxis/${id}`);
  return response.data;
};

export const updateTaxi = async (id, taxi) => {
  const response = await api.put(`/taxis/${id}`, taxi);
  return response.data;
};

export const deleteTaxi = async (id) => {
  const response = await api.delete(`/taxis/${id}`);
  return response.data;
};
