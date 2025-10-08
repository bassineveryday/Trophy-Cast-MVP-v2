import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { supabase, AuthCredentials } from './lib/supabase';

interface LoginState {
  email: string;
  password: string;
}

interface AppState extends LoginState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isLoggedIn: boolean;
  userEmail: string | null;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    email: '',
    password: '',
    isLoading: false,
    error: null,
    success: null,
    isLoggedIn: false,
    userEmail: null
  });

  const handleLogin = async () => {
    console.log('🔵 Starting login...');
    // Clear previous messages
    setState(prev => ({ ...prev, error: null, success: null, isLoading: true }));

    try {
      console.log('🔵 Calling Supabase with:', state.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: state.email,
        password: state.password
      });
      console.log('🔵 Response:', { data, error });

      if (error) {
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
        return;
      }

      if (data.user) {
        setState(prev => ({ 
          ...prev, 
          success: `Successfully logged in as ${data.user.email}!`, 
          isLoading: false,
          isLoggedIn: true,
          userEmail: data.user.email || null
        }));
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'An unexpected error occurred', 
        isLoading: false 
      }));
    }
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      userEmail: null,
      success: null,
      error: null,
      email: '',
      password: ''
    }));
  };

  // Show success screen if logged in
  if (state.isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.welcomeText}>You're logged in</Text>
        <Text style={styles.emailText}>
          Email: {state.userEmail}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
          />
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trophy Cast Login</Text>
      
      {state.error && (
        <Text style={styles.errorText}>{state.error}</Text>
      )}
      
      {state.success && (
        <Text style={styles.successText}>{state.success}</Text>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={state.email}
        onChangeText={(text) => setState(prev => ({ ...prev, email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!state.isLoading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={state.password}
        onChangeText={(text) => setState(prev => ({ ...prev, password: text }))}
        secureTextEntry
        editable={!state.isLoading}
      />
      
      <Button
        title={state.isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={state.isLoading}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#008000',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  emailText: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});
