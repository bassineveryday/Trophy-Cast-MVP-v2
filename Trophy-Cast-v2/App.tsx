import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase, AuthCredentials } from './lib/supabase';
import HomeScreen from './screens/HomeScreen';
import TournamentsScreen from './screens/TournamentsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Navigation types
type TabParamList = {
  Home: undefined;
  Tournaments: undefined;
  Profile: undefined;
};

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

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  userEmail: string | null;
  onLogout: () => void;
}

function TabNavigator({ userEmail, onLogout }: TabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconText = '';
          
          if (route.name === 'Home') {
            iconText = '🏠';
          } else if (route.name === 'Tournaments') {
            iconText = '🎣';
          } else if (route.name === 'Profile') {
            iconText = '👤';
          }
          
          return <Text style={{ fontSize: size }}>{iconText}</Text>;
        },
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#7f8c8d',
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ title: 'Trophy Cast' }}
      >
        {() => <HomeScreen userEmail={userEmail} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen}
        options={{ title: 'Tournaments' }}
      />
      <Tab.Screen 
        name="Profile"
        options={{ title: 'Profile' }}
      >
        {() => <ProfileScreen userEmail={userEmail} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
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

  // Show tab navigation if logged in
  if (state.isLoggedIn) {
    return (
      <NavigationContainer>
        <TabNavigator userEmail={state.userEmail} onLogout={handleLogout} />
        <StatusBar style="auto" />
      </NavigationContainer>
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
