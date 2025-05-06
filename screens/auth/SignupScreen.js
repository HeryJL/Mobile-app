// src/screens/SignupScreen.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthForm from './../../components/AuthForm';
import { AuthContext } from '../../context/AuthContext';
import OtpForms from './../../components/OtpForms';
import { register, resendOtps, verifyOtps } from '../../services/authService';

const SignupScreen = ({ navigation }) => {
  // États du formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confpass, setConfPass] = useState('');
  const [phone, setPhone] = useState('');
  const {verifyAndregistre} = useContext(AuthContext)
  // États OTP
  const [step, setStep] = useState(1); // 1 = Formulaire, 2 = OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // États UI
  const [secureEntry, setSecureEntry] = useState(true);
  const [confSecure, setConfSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Animations
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Compte à rebours OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step, canResend]);

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Validation du formulaire
  const validateForm = () => {
    if (!name || !email || !password || !confpass || !phone) {
      Alert.alert("Erreur", "Tous les champs sont requis");
      triggerShake();
      return false;
    }

    if (password !== confpass) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      triggerShake();
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
      triggerShake();
      return false;
    }

    if (password.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères");
      triggerShake();
      return false;
    }

    return true;
  };

  // Animation de secousse
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  // Soumission du formulaire
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
        await register({name, email, password, phone});
        setStep(2);
        setCountdown(60);
        setCanResend(false);
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérification OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Le code doit contenir 6 chiffres");
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      await verifyAndregistre(email, otp);
      Alert.alert(
        "Succès", 
        "Inscription réussie!",
      );
    } catch (error) {
      setOtpError(error.message);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoi OTP
  const resendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await resendOtps(email);
      setCountdown(60);
      setCanResend(false);
      Alert.alert("Succès", "Un nouveau code a été envoyé");
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#74c7ec', '#60a5fa']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.scrollContainer, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnimation }] }]}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Ionicons name={step === 1 ? "car-sport" : "mail-open"} size={72} color="#ffffff" />
                </View>
                <Text style={styles.title}>{step === 1 ? "S'inscrire" : "Vérification"}</Text>
              </View>

              {step === 1 ? (
                <AuthForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confpass={confpass}
                  setConfPass={setConfPass}
                  phone={phone}
                  setPhone={setPhone}
                  secureEntry={secureEntry}
                  setSecureEntry={setSecureEntry}
                  confSecure={confSecure}
                  setConfSecure={setConfSecure}
                />
              ) : (
                <OtpForms
                  email={email}
                  otp={otp}
                  setOtp={setOtp}
                  otpError={otpError}
                  countdown={countdown}
                  canResend={canResend}
                  onResend={resendOtp}
                  onVerify={verifyOtp}
                  isLoading={isLoading}
                />
              )}

              {step === 1 && (
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>S'inscrire</Text>
                  )}
                </TouchableOpacity>
              )}

              <View style={styles.footer}>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginText}>Déjà un compte ? Se connecter</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#334155',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default SignupScreen;