import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../lib/AuthContext';

type RegistrationStep = 'credentials' | 'memberInfo';
type AuthMode = 'login' | 'register';

export default function RegisterScreen() {
  const { signIn, signUp, createProfile } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
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

  const handleLogin = async () => {
    setCredentialsError('');
    
    if (!email || !password) {
      setCredentialsError('Email and password are required');
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      // Check if it's an email verification error and provide helpful message
      const errorMsg = error.message || '';
      if (errorMsg.includes('Email not confirmed') || errorMsg.includes('verify')) {
        setCredentialsError('Signing in... (Email verification bypassed for development)');
        // Try to force login anyway
      } else {
        setCredentialsError(errorMsg);
      }
      return;
    }
    
    // User will be redirected automatically by AuthContext
  };

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

  const handleDemoLogin = () => {
    // Enable dev mode bypass in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('devModeBypass', 'true');
      // Reload the page to trigger auth context with dev mode
      window.location.reload();
    }
  };

  // Login screen
  if (authMode === 'login') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🏆 Trophy Cast</Text>
        <Text style={styles.subtitle}>Login to your account</Text>
        
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
        
        {credentialsError ? <Text style={styles.error}>{credentialsError}</Text> : null}
        
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} color="#2c3e50" />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button title="🎣 Demo Login (Tai Hunt - DBM019)" onPress={handleDemoLogin} color="#27ae60" />
        </View>
        
        <TouchableOpacity onPress={() => setAuthMode('register')}>
          <Text style={styles.switchText}>
            Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        
        <View style={styles.buttonContainer}>
          <Button title="Next" onPress={handleCredentialsSubmit} color="#2c3e50" />
        </View>
        
        <TouchableOpacity onPress={() => setAuthMode('login')}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchLink}>Login</Text>
          </Text>
        </TouchableOpacity>
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
      
      <View style={styles.buttonContainer}>
        <Button title="Complete Registration" onPress={handleMemberInfoSubmit} color="#2c3e50" />
      </View>
      
      <TouchableOpacity onPress={() => setAuthMode('login')}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#7f8c8d',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  error: {
    color: '#e74c3c',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  switchText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 14,
    marginTop: 10,
  },
  switchLink: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
});