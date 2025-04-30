import api from './api';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
export const createUser = async (user) => {
  const response = await api.post('/users', user);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
export const registerForPushNotifications = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }
  return null;
};