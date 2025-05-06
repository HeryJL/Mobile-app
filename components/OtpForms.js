import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const OtpForms = ({
  email,
  otp,
  setOtp,
  otpError,
  countdown,
  canResend,
  onResend,
  onVerify,
  isLoading
}) => {
  return (
    <>
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
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
      </View>

      {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={onVerify}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Vérification...' : 'Vérifier'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onResend} 
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
    </>
  );
};

const styles = StyleSheet.create({
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
  buttonContainer: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
});

export default OtpForms;