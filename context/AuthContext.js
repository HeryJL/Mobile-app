import React, { createContext, useState, useEffect } from 'react';
import mockUsers from '../data/mockUsers';
import mockDrivers from '../data/mockDrivers';

export const AuthContext = createContext();

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
      const foundUser = mockUsers.find(
        user => user.email === email && user.password === password
      );

      if (foundUser) {
        setUser(foundUser);
        setUserType('user');
        return 'user';
      }

      const foundDriver = mockDrivers.find(
        driver => driver.email === email && driver.password === password
      );

      if (foundDriver) {
        setUser(foundDriver);
        setUserType('driver');
        return 'driver';
      }

      throw new Error('Identifiants incorrects.');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setUserType(null);
    } catch (error) {
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