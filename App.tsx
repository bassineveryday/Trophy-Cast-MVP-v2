import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Import screens
import HomeScreen from './screens/HomeScreen';
import TournamentsScreen from './screens/TournamentsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AOYScreen from './screens/AOYScreen';
import RegisterScreen from './screens/RegisterScreen';
import ClubScreen from './screens/ClubScreen';

// Navigation types
type TabParamList = {
  Home: undefined;
  Tournaments: undefined;
  AOY: undefined;
  Club: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  Main: undefined;
  Register: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const { profile } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconText = '';
          
          if (route.name === 'Home') {
            iconText = '🏠';
          } else if (route.name === 'Tournaments') {
            iconText = '🎣';
          } else if (route.name === 'AOY') {
            iconText = '🏆';
          } else if (route.name === 'Club') {
            iconText = '🎯';
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
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen}
        options={{ title: 'Tournaments' }}
      />
      <Tab.Screen 
        name="AOY" 
        options={{ title: 'AOY' }}
        component={AOYScreen}
      />
      <Tab.Screen 
        name="Club" 
        options={{ title: 'Denver BM' }}
        component={ClubScreen}
      />
      <Tab.Screen 
        name="Profile" 
        options={{ title: 'Profile' }}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user || !profile ? (
          <Stack.Screen name="Register" component={RegisterScreen} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ErrorBoundary>
  );
}
