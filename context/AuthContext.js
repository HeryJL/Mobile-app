import React, { createContext, useState, useEffect } from 'react';
import mockUsers from '../data/mockUsers';
import mockDrivers from '../data/mockDrivers';

export const AuthContext = createContext();
const API_BASE_URL = 'http://192.168.0.181:5000/users'
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null); // Peut être null initialement

  useEffect(() => {
    setIsLoading(false); // Simuler la fin du chargement initial
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Identifiants incorrects.');
      }
  
      setUser(data.user);
      setUserType(data.user.role === 'driver' ? 'driver' : 'user');
      return data.user.role === 'driver' ? 'driver' : 'user';
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 1. Appel API au backend pour déconnexion
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}` // Envoyez le token JWT
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Échec de la déconnexion');
        
      }
  
      // 2. Nettoyage du state local
      setUser(null);
      setUserType(null);
  
      // 3. Optionnel: Supprimer le token du stockage local si vous en utilisez un
      // await AsyncStorage.removeItem('authToken');
  
      return true; // Indique que la déconnexion a réussi
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur API, on nettoie le frontend
      setUser(null);
      setUserType(null);
      throw error;
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};