import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const register = async(user) => {
    const res = await api.post('/auth/register', user);
    return res.data;
};

export const loginUser = async(credentials) => {
    const res = await api.post(`/auth/login`, credentials);
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

export const verifyOtps = async(email, otp) => {
    try {
        const response = await api.post(`/verifi-otp`, { email, otp });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
}
export const resendOtps = async(email) => {
  try {
    return await api.post('password/forgotPassword', { email });
  } catch (error) {
    throw new Error('Impossible de renvoyer le code pour le moment');
  }
}
export const verifyResetCode = async (email, code) => {
  try {
    return await api.post('/password/verify-code', { email, code });
  } catch (error) {
    throw error;
  }
}

export const updatePassword = async (email, newPassword) => {
  try {
    return await api.post('/password/reset-password', { email, newPassword });
  } catch (error) {
    throw error;
  }
}
const handleError = (error) => {
    console.error("API Error:", error);
    if (error.response) {
      // Vous pouvez personnaliser les messages d'erreur ici
      if (error.response.status === 400) {
        return new Error(error.response.data.error || "Requête invalide");
      }
      if (error.response.status === 401) {
        return new Error("Non autorisé");
      }
      if (error.response.status === 500) {
        return new Error("Erreur serveur");
      }
    } else if (error.request) {
      return new Error("Pas de réponse du serveur");
    }
    return new Error(error.message || "Erreur réseau");
}

