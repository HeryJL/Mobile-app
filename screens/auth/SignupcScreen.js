import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

// Configurer l'URL de base de votre API
const API_BASE_URL = 'http://192.168.0.59:5000/users'; // Remplacez par votre adresse IP locale

const SignupScreen = ({ navigation }) => {
  // États pour le formulaire
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confpass, setConfPass] = useState('');
  const [phone, setPhone] = useState('');
  
  // États pour la vérification OTP
  const [step, setStep] = useState(1); // 1 = Formulaire, 2 = Vérification OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // États pour la visibilité des mots de passe
  const [secureEntry, setSecureEntry] = useState(true);
  const [confSecure, setConfSecure] = useState(true);
  
  // États pour le chargement et le compte à rebours
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Références pour les animations
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Compte à rebours pour le renvoi d'OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step, canResend]);

  // Valider le formulaire
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

  // Gérer l'inscription et l'envoi d'OTP
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/creerUsers`, {
        name,
        email,
        password,
        phone
      });

      if (response.data.message === "Un code de vérification a été envoyé à votre adresse email") {
        setStep(2);
        setCountdown(60); // Réinitialiser le compte à rebours
        setCanResend(false);
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      let errorMessage = "Erreur lors de l'inscription";
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Le code doit contenir 6 chiffres");
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/verifi-otp`, {
        email,
        otp
      });

      if (response.data.message === "Inscription réussie") {
        Alert.alert(
          "Succès",
          "Inscription réussie! Vous pouvez maintenant vous connecter",
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      console.error("Erreur de vérification OTP:", error);
      let errorMessage = "Erreur lors de la vérification";
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
        if (error.response.status === 400) {
          setOtpError(errorMessage);
          triggerShake();
          return;
        }
      }
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Renvoyer l'OTP
  const resendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/creerUsers`, {
        name,
        email,
        password,
        phone
      });
      setCountdown(60);
      setCanResend(false);
      Alert.alert("Succès", "Un nouveau code a été envoyé");
    } catch (error) {
      console.error("Erreur lors du renvoi de l'OTP:", error);
      Alert.alert("Erreur", "Impossible de renvoyer le code");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation de secousse pour les erreurs
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  // Animation d'apparition au chargement
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={['#74c7ec', '#60a5fa']} style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.scrollContainer, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {step === 1 ? (
              <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnimation }] }]}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="car-sport" size={72} color="#ffffff" />
                  </View>
                  <Text style={styles.title}>S'inscrire</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom complet"
                    placeholderTextColor="rgb(100, 100, 100)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="phone-portrait" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Numéro de téléphone"
                    placeholderTextColor="rgb(100, 100, 100)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse email"
                    placeholderTextColor="rgb(100, 100, 100)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="rgb(100, 100, 100)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureEntry}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)} style={styles.eyeButton}>
                    <Ionicons name={secureEntry ? "eye-off" : "eye"} size={22} color="rgb(80, 78, 78)" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmer mot de passe"
                    placeholderTextColor="rgb(100, 100, 100)"
                    value={confpass}
                    onChangeText={setConfPass}
                    secureTextEntry={confSecure}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setConfSecure(!confSecure)} style={styles.eyeButton}>
                    <Ionicons name={confSecure ? "eye-off" : "eye"} size={22} color="rgb(80, 78, 78)" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>S'inscrire</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnimation }] }]}>
                <View style={styles.header}>
                  <Ionicons name="mail-open" size={60} color="#ffffff" />
                  <Text style={styles.title}>Vérification</Text>
                </View>

                <Text style={styles.otpText}>
                  Entrez le code à 6 chiffres envoyé à {"\n"}
                  <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                </Text>

                <View style={styles.otpInputContainer}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="123456"
                    placeholderTextColor="#999"
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text);
                      setOtpError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={verifyOtp}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Vérifier</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={resendOtp} 
                  style={styles.resendButton}
                  disabled={!canResend || isLoading}
                >
                  <Text style={styles.resendText}>
                    {canResend ? (
                      <Text>Vous n'avez pas reçu de code ? <Text style={styles.resendLink}>Renvoyer</Text></Text>
                    ) : (
                      <Text>Renvoyer le code dans {countdown}s</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
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
  formContainer: {
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'rgb(0, 0, 0)',
  },
  eyeButton: {
    padding: 5,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  otpContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  otpText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  otpInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 20,
  },
  resendText: {
    color: '#fff',
    textAlign: 'center',
  },
  resendLink: {
    color: '#2563eb',
    fontWeight: '600',
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