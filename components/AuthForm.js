// src/components/AuthForm.js
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthForm = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confpass,
  setConfPass,
  phone,
  setPhone,
  secureEntry,
  setSecureEntry,
  confSecure,
  setConfSecure
}) => {
  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default AuthForm;