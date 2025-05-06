// src/components/OTPVerificationForm.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const OTPVerificationForm = ({ 
  code, 
  setCode, 
  isLoading, 
  onVerify, 
  onResend 
}) => {
  return (
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
        <TouchableOpacity onPress={onResend} disabled={isLoading}>
          <Text style={styles.resendLink}>Renvoyer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={onVerify}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
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
  );
};

const styles = {
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
  },
};

export default OTPVerificationForm;