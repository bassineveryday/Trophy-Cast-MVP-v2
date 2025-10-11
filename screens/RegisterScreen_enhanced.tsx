import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { useAuth } from '../lib/AuthContext';
import { showSuccess, showError, showWarning } from '../utils/toast';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';

type RegistrationStep = 'credentials' | 'memberInfo';
type AuthMode = 'login' | 'register';
type ValidationState = 'idle' | 'checking' | 'valid' | 'invalid';

interface MemberValidation {
  isValid: boolean;
  memberName?: string;
  error?: string;
}

export default function RegisterScreen() {
  const { signIn, signUp, createProfile } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<RegistrationStep>('credentials');
  const [loading, setLoading] = useState(false);
  
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
  
  // New validation states
  const [memberValidation, setMemberValidation] = useState<ValidationState>('idle');
  const [memberData, setMemberData] = useState<MemberValidation>({ isValid: false });

  // Real-time member code validation
  useEffect(() => {
    if (memberCode.length >= 3) {
      validateMemberCode(memberCode);
    } else {
      setMemberValidation('idle');
      setMemberData({ isValid: false });
    }
  }, [memberCode]);

  const validateMemberCode = async (code: string) => {
    setMemberValidation('checking');
    
    try {
      const { data, error } = await supabase
        .from('tournament_members')
        .select('member_id, member_name, active')
        .eq('member_id', code.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Member validation error:', error);
        setMemberValidation('invalid');
        setMemberData({ 
          isValid: false, 
          error: 'Unable to validate member code. Please try again.' 
        });
        return;
      }

      if (data) {
        setMemberValidation('valid');
        setMemberData({ 
          isValid: true, 
          memberName: data.member_name 
        });
        // Auto-fill name if available
        if (data.member_name && !name) {
          setName(data.member_name);
        }
      } else {
        setMemberValidation('invalid');
        setMemberData({ 
          isValid: false, 
          error: 'Member code not found. Please check with club administration.' 
        });
      }
    } catch (error) {
      console.error('Member validation error:', error);
      setMemberValidation('invalid');
      setMemberData({ 
        isValid: false, 
        error: 'Network error. Please check your connection and try again.' 
      });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 6) errors.push('At least 6 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  const handleLogin = async () => {
    setCredentialsError('');
    setLoading(true);
    
    if (!email || !password) {
      setCredentialsError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setCredentialsError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        const errorMsg = error.message || '';
        if (errorMsg.includes('Email not confirmed') || errorMsg.includes('verify')) {
          setCredentialsError('Signing in... (Email verification bypassed for development)');
          showWarning('Email Not Verified', 'Attempting to sign in anyway...');
        } else if (errorMsg.includes('Invalid login credentials')) {
          setCredentialsError('Invalid email or password. Please try again.');
        } else {
          setCredentialsError(errorMsg);
        }
      } else {
        showSuccess('Welcome back!', 'Loading your dashboard...');
      }
    } catch (error) {
      setCredentialsError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async () => {
    setCredentialsError('');
    setLoading(true);
    
    if (!email || !password || !confirmPassword) {
      setCredentialsError('All fields are required');
      setLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setCredentialsError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setCredentialsError(`Password must have: ${passwordErrors.join(', ')}`);
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setCredentialsError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setCredentialsError('This email is already registered. Try logging in instead.');
        } else {
          setCredentialsError(error.message);
        }
      } else {
        showSuccess('Account Created!', 'Now let\'s link your member information...');
        setStep('memberInfo');
      }
    } catch (error) {
      setCredentialsError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberInfoSubmit = async () => {
    setMemberInfoError('');
    setLoading(true);
    
    if (!memberCode || !name || !hometown) {
      setMemberInfoError('All fields are required');
      setLoading(false);
      return;
    }

    if (!memberData.isValid) {
      setMemberInfoError('Please enter a valid member code');
      setLoading(false);
      return;
    }

    try {
      const { error } = await createProfile(memberCode.toUpperCase(), name, hometown);
      
      if (error) {
        if (error.message.includes('already exists')) {
          setMemberInfoError('This member code is already linked to another account.');
        } else {
          setMemberInfoError(error.message);
        }
      } else {
        showSuccess('Registration Complete!', 'Welcome to Trophy Cast!');
      }
    } catch (error) {
      setMemberInfoError('An unexpected error occurred. Please try again.');
      console.error('Profile creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devModeBypass', 'true');
      showSuccess('Demo Mode Activated', 'Logging in as Tai Hunt...');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const getMemberValidationIcon = () => {
    switch (memberValidation) {
      case 'checking': 
        return <ActivityIndicator size="small" color="#007bff" style={styles.validationIcon} />;
      case 'valid': 
        return <Ionicons name="checkmark-circle" size={20} color="#28a745" style={styles.validationIcon} />;
      case 'invalid': 
        return <Ionicons name="close-circle" size={20} color="#dc3545" style={styles.validationIcon} />;
      default: 
        return null;
    }
  };

  const getMemberValidationMessage = () => {
    if (memberValidation === 'valid' && memberData.memberName) {
      return `✅ Valid member: ${memberData.memberName}`;
    }
    if (memberValidation === 'invalid' && memberData.error) {
      return `❌ ${memberData.error}`;
    }
    return null;
  };

  // Login Screen
  if (authMode === 'login') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TopBar title="Trophy Cast" subtitle="Welcome back to Denver Bassmasters" />
        
        <View style={styles.formContainer}>
          <Input
            label="Email Address"
            icon="mail-outline"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          
          {credentialsError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#dc3545" />
              <Text style={styles.errorText}>{credentialsError}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.secondaryButton, loading && styles.disabledButton]}
              onPress={handleDemoLogin}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>🎣 Demo Login (Tai Hunt)</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={() => setAuthMode('register')} disabled={loading}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Registration Step 1: Credentials
  if (step === 'credentials') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TopBar showBack title="Create Account" subtitle="Step 1 of 2: Account Credentials" />
        
        <View style={styles.formContainer}>
          <Input
            label="Email Address"
            icon="mail-outline"
            placeholder="your.email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          
          <Input
            label="Confirm Password"
            icon="lock-closed-outline"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />
          
          <View style={styles.passwordHints}>
            <Text style={styles.hintText}>Password must contain:</Text>
            <Text style={[styles.hintItem, password.length >= 6 && styles.hintValid]}>
              • At least 6 characters
            </Text>
            <Text style={[styles.hintItem, /[A-Z]/.test(password) && styles.hintValid]}>
              • One uppercase letter
            </Text>
            <Text style={[styles.hintItem, /[0-9]/.test(password) && styles.hintValid]}>
              • One number
            </Text>
          </View>
          
          {credentialsError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#dc3545" />
              <Text style={styles.errorText}>{credentialsError}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleCredentialsSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Registration Step 2: Member Info
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setStep('credentials')}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.title}>Link Membership</Text>
        <Text style={styles.subtitle}>Step 2 of 2: Denver Bassmasters Info</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.memberCodeContainer}>
          <Input
            label="Member Code"
            icon="card-outline"
            placeholder="e.g., DBM019"
            value={memberCode}
            onChangeText={setMemberCode}
            autoCapitalize="characters"
            editable={!loading}
          />
          {getMemberValidationIcon()}
        </View>
        
        {getMemberValidationMessage() && (
          <Text style={[
            styles.validationMessage,
            memberValidation === 'valid' ? styles.validMessage : styles.invalidMessage
          ]}>
            {getMemberValidationMessage()}
          </Text>
        )}
        
        <Input
          label="Full Name"
          icon="person-outline"
          placeholder="Your full name"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
        
        <Input
          label="Hometown"
          icon="location-outline"
          placeholder="City, State"
          value={hometown}
          onChangeText={setHometown}
          editable={!loading}
        />
        
        {memberInfoError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#dc3545" />
            <Text style={styles.errorText}>{memberInfoError}</Text>
          </View>
        ) : null}
        
        <TouchableOpacity
          style={[
            styles.primaryButton, 
            (!memberData.isValid || loading) && styles.disabledButton
          ]}
          onPress={handleMemberInfoSubmit}
          disabled={!memberData.isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Complete Registration</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#007bff" />
          <Text style={styles.infoText}>
            Your member code links your account to Denver Bassmasters records. 
            Contact club administration if you don't know your code.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  secondaryButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#7f8c8d',
  },
  switchLink: {
    color: '#3498db',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  errorText: {
    color: '#721c24',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  passwordHints: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    fontWeight: '600',
  },
  hintItem: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  hintValid: {
    color: '#28a745',
  },
  memberCodeContainer: {
    position: 'relative',
  },
  validationIcon: {
    position: 'absolute',
    right: 12,
    top: 45,
  },
  validationMessage: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  validMessage: {
    color: '#28a745',
  },
  invalidMessage: {
    color: '#dc3545',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  infoText: {
    color: '#1565c0',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});