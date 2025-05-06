import React, { useState, useRef } from 'react';
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
  Dimensions,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
const API_BASE_URL = "http://192.168.0.59:5000"
const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureEntry, setSecureEntry] = useState(true);
  const [confSecure, setConfSecure] = useState(true);
  
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
      alert("Veuillez entrer une adresse email.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/password/forgotPassword`, {
        email: email
      });
  
      if (response.data.message === "Code envoyé") {
        alert("Code envoyé à votre email.");
        setStep(2);
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      
      if (error.response) {
        alert(error.response.data.message || error.response.data.error || "Une erreur s'est produite");
      } else if (error.request) {
        alert("Pas de réponse du serveur. Vérifiez votre connexion.");
      } else {
        alert("Erreur de configuration de la requête: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      alert("Veuillez entrer le code de vérification.");
      return;
    }
  
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/password/verify-code`, {
        email: email,
        code: code
      });
  
      if (response.data.message === "Code vérifié") {
        setStep(3);
      }
    } catch (error) {
      console.error("Erreur de vérification:", error);
      
      if (error.response) {
        alert(error.response.data.error || "Code invalide ou expiré");
      } else if (error.request) {
        alert("Pas de réponse du serveur. Vérifiez votre connexion.");
      } else {
        alert("Erreur de configuration de la requête: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
  
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Le mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial.");
      return;
    }
  
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/password/reset-password`, {
        email: email,
        newPassword: newPassword
      });
  
      if (response.data.message === "Mot de passe mis à jour") {
        alert("Mot de passe mis à jour avec succès !");
        navigation.navigate('Login', { 
          success: true,
          message: 'Mot de passe mis à jour avec succès ! Veuillez vous connecter avec votre nouveau mot de passe.'
        });
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      
      if (error.response) {
        alert(error.response.data.error || "Erreur lors de la mise à jour du mot de passe");
      } else if (error.request) {
        alert("Pas de réponse du serveur. Vérifiez votre connexion.");
      } else {
        alert("Erreur de configuration de la requête: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/password/forgotPassword`, {
        email: email
      });

      if (response.data.message === "Code envoyé") {
        alert("Nouveau code envoyé à votre email.");
      }
    } catch (error) {
      console.error("Erreur de renvoi:", error);
      
      if (error.response) {
        alert(error.response.data.message || error.response.data.error || "Erreur lors du renvoi du code");
      } else if (error.request) {
        alert("Pas de réponse du serveur. Vérifiez votre connexion.");
      } else {
        alert("Erreur de configuration de la requête: " + error.message);
      }
    } finally {
      setIsLoading(false);
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
            showsVerticalScrollIndicator={false}
          >
            {step === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse email"
                    placeholderTextColor='rgb(100, 100, 100)'
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Envoyer le code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="key" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Code de vérification"
                    placeholderTextColor='rgb(100, 100, 100)'
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Vous n'avez pas reçu de code?</Text>
                  <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                    <Text style={styles.resendLink}>Renvoyer</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Vérifier le code</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nouveau mot de passe"
                    placeholderTextColor='rgb(100, 100, 100)'
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={secureEntry}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setSecureEntry(!secureEntry)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={secureEntry ? "eye-off" : "eye"}
                      size={22}
                      color='rgb(80, 78, 78)'
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={22} color="rgb(44, 44, 44)" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmer le mot de passe"
                    placeholderTextColor='rgb(100, 100, 100)'
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={confSecure}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setConfSecure(!confSecure)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={confSecure ? "eye-off" : "eye"}
                      size={22}
                      color='rgb(80, 78, 78)'
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordRules}>
                  <Text style={styles.ruleText}>• 8 caractères minimum</Text>
                  <Text style={styles.ruleText}>• Au moins un chiffre</Text>
                  <Text style={styles.ruleText}>• Au moins un caractère spécial</Text>
                </View>

                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handlePasswordUpdate}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Mettre à jour</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => step === 1 ? navigation.goBack() : setStep(step - 1)}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'rgb(0, 0, 0)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
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
    paddingVertical: 18,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#e2e8f0',
    fontSize: 14,
    marginRight: 5,
  },
  resendLink: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  passwordRules: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  ruleText: {
    color: '#e2e8f0',
    fontSize: 13,
    marginBottom: 5,
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