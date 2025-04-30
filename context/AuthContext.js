import React, { createContext, useState, useEffect } from 'react';
import mockUsers from '../data/mockUsers';
import mockDrivers from '../data/mockDrivers';
import { loginUser, register } from '../services/authService';
import { getTaxiById } from '../services/taxi.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState(null); // Peut être null initialement

    useEffect(() => {
        setIsLoading(false); // Simuler la fin du chargement initial
    }, []);

    const login = async(email, password) => {
        setIsLoading(true);
        try {
            const log = await loginUser({ email, password });
            setUser(log.user)
            setUserType(log.user.role);
            if(userType === "chauffeur") {
                const taxi = await getTaxiById(log.user._id)
                setUser({...user,taxi})
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const registre = async(name, email, password,phone) => {
        setIsLoading(true);
        try {
            const log = await register({ name, email, password,phone });
            console.log(log)
            setUser(log.user)
            setUserType(log.user.role);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async() => {
        try {
            setUser(null);
            setUserType(null);
        } catch (error) {
            throw error;
        }
    };

    return ( <AuthContext.Provider value = {
            {
                user,
                isLoading,
                userType,
                login,
                registre,
                logout,
                userToken: user?._id, // Utiliser l'ID de l'utilisateur prédéfini comme token
                userTaxi: user?.taxi?._id,
            }
        } > { children } </AuthContext.Provider>
    );
};