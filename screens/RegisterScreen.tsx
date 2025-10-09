import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useAuth } from '../lib/AuthContext';

type RegistrationStep = 'credentials' | 'memberInfo';

export default function RegisterScreen() {
  const { signUp, createProfile } = useAuth();
  const [step, setStep] = useState<RegistrationStep>('credentials');
  
  // Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState('');
  
  // Member info state
  const [memberCode, setMemberCode] = useState('');
  const [name, setName] = useState('');
  const [hometown, setHometown] = useState('');
  const [memberInfoError, setMemberInfoError] = useState('');

  const handleCredentialsSubmit = async () => {
    setCredentialsError('');
    
    if (!email || !password || !confirmPassword) {
      setCredentialsError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setCredentialsError('Passwords do not match');
      return;
    }

    const { error } = await signUp(email, password);
    
    if (error) {
      setCredentialsError(error.message);
      return;
    }
    
    setStep('memberInfo');
  };

  const handleMemberInfoSubmit = async () => {
    setMemberInfoError('');
    
    if (!memberCode || !name || !hometown) {
      setMemberInfoError('All fields are required');
      return;
    }

    const { error } = await createProfile(memberCode, name, hometown);
    
    if (error) {
      setMemberInfoError(error.message);
      return;
    }
  };

  if (step === 'credentials') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        {credentialsError ? <Text style={styles.error}>{credentialsError}</Text> : null}
        
        <Button title="Next" onPress={handleCredentialsSubmit} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Member Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Member Code"
        value={memberCode}
        onChangeText={setMemberCode}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Hometown"
        value={hometown}
        onChangeText={setHometown}
      />
      
      {memberInfoError ? <Text style={styles.error}>{memberInfoError}</Text> : null}
      
      <Button title="Complete Registration" onPress={handleMemberInfoSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
});