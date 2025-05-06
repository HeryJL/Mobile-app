// src/screens/ForgotPasswordScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PasswordResetForm from './../../components/PasswordResetForm';
import OTPVerificationForm from './../../components/OTPVerificationForm';
import NewPasswordForm from './../../components/NewPasswordForm';
import { resendOtps, verifyResetCode } from './../../services/authService';
import { updatePassword } from './../../services/authService';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      await resendOtps (email);
      Alert.alert("Succès", "Code envoyé à votre email.");
      setStep(2);
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert("Erreur", "Veuillez entrer le code de vérification.");
      return;
    }
  
    setIsLoading(true);
    
    try {
      await verifyResetCode(email, code);
      setStep(3);
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
  
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        "Erreur", 
        "Le mot de passe doit contenir:\n• 8 caractères minimum\n• Un chiffre\n• Un caractère spécial"
      );
      return;
    }
  
    setIsLoading(true);
    
    try {
      await updatePassword(email, newPassword);
      Alert.alert(
        "Succès", 
        "Mot de passe mis à jour avec succès!",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      await resendOtps(email);
      Alert.alert("Succès", "Nouveau code envoyé à votre email.");
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(step - 1);
    }
  };

  return (
    <LinearGradient
      colors={['#74c7ec', '#60a5fa']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <Animated.View style={[styles.header, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={72} color="#ffffff" />
            <View style={styles.logoPulse} />
          </View>
          <Text style={styles.title}>Réinitialiser le mot de passe</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? "Entrez votre email pour recevoir un code de vérification" : 
             step === 2 ? "Entrez le code envoyé à votre email" : 
             "Créez un nouveau mot de passe"}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.form, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && (
              <PasswordResetForm
                email={email}
                setEmail={setEmail}
                isLoading={isLoading}
                onSubmit={handleResetPassword}
              />
            )}

            {step === 2 && (
              <OTPVerificationForm
                code={code}
                setCode={setCode}
                isLoading={isLoading}
                onVerify={handleVerifyCode}
                onResend={handleResendCode}
              />
            )}

            {step === 3 && (
              <NewPasswordForm
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                isLoading={isLoading}
                onSubmit={handlePasswordUpdate}
              />
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  logoPulse: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    top: -9,
    left: -9,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  backText: {
    color: '#ffffff',
    marginLeft: 5,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;