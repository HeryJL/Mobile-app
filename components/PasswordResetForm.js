// src/components/PasswordResetForm.js
import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PasswordResetForm = ({ email, setEmail, isLoading, onSubmit }) => {
  return (
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
        />
      </View>

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
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

export default PasswordResetForm;