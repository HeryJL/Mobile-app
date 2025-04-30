import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { requestNotificationPermission } from './notificationService';
import { registerForPushNotifications, updateUser } from './user.service';

export const register = async(user) => {
    const res = await api.post(`/users`, user);
    await AsyncStorage.setItem('token', res.data.token);
    return res.data;
};

export const loginUser = async(credentials) => {
    const res = await api.post(`/auth/login`, credentials);
    // const pushToken = registerForPushNotifications();
    // console.log(pushToken)
    // await updateUser(res.data.user._id, { pushToken })
    await AsyncStorage.setItem('token', res.data.token);
    return res.data;
};
export const getInfo = async(token) => {
    const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data
}

export const logout = async() => {
    await AsyncStorage.removeItem('token');
};

export const getToken = async() => {
    return await AsyncStorage.getItem('token');
};