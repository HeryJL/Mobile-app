import React, { createContext, useState, useEffect } from 'react';
import { register,loginUser, verifyOtps } from './../services/authService';
import { registerForPushNotifications, updateUser } from '../services/user.service';
import { getTaxiById, updateTaxi } from './../services/taxi.service';
import { deleteTaxiLocation } from '../services/location.service';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null); // Peut être null initialement
  const [statut, setStatut] = useState(null)
  const [savedRoute, setSavedRoute] = useState(null); 
  useEffect(() => {
    setIsLoading(false); // Simuler la fin du chargement initial
  }, []);

  const login = async(email, password) => {
    setIsLoading(true);
    try {
        const log = await loginUser({ email, password });
        setUserType(log.user.role);
        if(log.user.role === "chauffeur") {
            const taxi = await getTaxiById(log.user._id) 
            setUser({...log.user,taxi})
            setStatut(taxi.status)
        } else {
            setUser(log.user)
        }
        // const pushToken = registerForPushNotifications();
        // console.log(pushToken)
        // await updateUser(log.user._id, { pushToken })
    } catch (error) {
        throw error;
    } finally {
        setIsLoading(false);
    }
  };
  const verifyAndregistre = async(email, otp) => {
      setIsLoading(true);
      try {
          const log = await verifyOtps(email, otp);
          console.log(log)
          setUser(log.user)
          setUserType(log.user.role);
          // const pushToken = registerForPushNotifications();
          // console.log(pushToken)
          // await updateUser(log.user._id, { pushToken })
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
      // if(user.taxi._id){
      //   updateStatut("hors service")
      //   await deleteTaxiLocation(user.taxi._id)
      // }
    } catch (error) {
      throw error;
    }
  };

  const updateStatut = async (stat) => {
     const newStatus = await updateTaxi(user.taxi._id,{status:stat})
     setStatut(stat)
  }
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
        savedRoute,
        isLoading,
        userType,
        login,
        updateSavedRoute,
        verifyAndregistre,
        logout,
        statut,
        updateStatut,
        userToken: user?._id,
        Idtaxi: user?.taxi?._id
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};