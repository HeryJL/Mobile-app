// src/components/NewPasswordForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const NewPasswordForm = ({ 
  newPassword, 
  setNewPassword, 
  confirmPassword, 
  setConfirmPassword, 
  isLoading, 
  onSubmit 
}) => {
  const [secureEntry, setSecureEntry] = useState(true);
  const [confSecure, setConfSecure] = useState(true);

  return (
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
            <Text style={styles.buttonText}>Mettre à jour</Text>
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
  eyeButton: {
    padding: 5,
    marginLeft: 10,
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

export default NewPasswordForm;