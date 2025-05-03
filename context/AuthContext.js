import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const AuthContext = createContext();
const API_BASE_URL = 'http://192.168.0.181:5000/users';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null); // Peut être null initialement
  const [savedRoute, setSavedRoute] = useState(null); // État pour l'itinéraire sauvegardé

  // Charger les données persistantes au démarrage
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedRoute = await AsyncStorage.getItem('savedRoute');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserType(parsedUser.role === 'chauffeur' ? 'chauffeur' : 'user');
        }
        if (storedRoute) {
          setSavedRoute(JSON.parse(storedRoute));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identifiants incorrects.');
      }

      setUser(data.user);
      setUserType(data.user.role === 'chauffeur' ? 'chauffeur' : 'user');
      // Sauvegarder l'utilisateur dans AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data.user.role === 'chauffeur' ? 'chauffeur' : 'user';
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Appel API pour déconnexion
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la déconnexion');
      }

      // Nettoyer le state local
      setUser(null);
      setUserType(null);
      setSavedRoute(null);

      // Supprimer les données d'AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('savedRoute');

      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Nettoyer le frontend même en cas d'erreur
      setUser(null);
      setUserType(null);
      setSavedRoute(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('savedRoute');
      throw error;
    }
  };

  // Fonction pour mettre à jour l'itinéraire sauvegardé
  const updateSavedRoute = async (route) => {
    try {
      setSavedRoute(route);
      if (route) {
        await AsyncStorage.setItem('savedRoute', JSON.stringify(route));
      } else {
        await AsyncStorage.removeItem('savedRoute');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'itinéraire:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userType,
        login,
        logout,
        userToken: user?.id, // Utiliser l'ID de l'utilisateur prédéfini comme token
        savedRoute,
        updateSavedRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};