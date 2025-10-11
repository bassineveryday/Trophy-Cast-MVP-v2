import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';

// Import screens
import HomeScreen from './screens/HomeScreen';
import EnhancedHomeScreen from './screens/EnhancedHomeScreen';
import EnhancedTournamentsScreen from './components/EnhancedTournamentsScreen';
import EnhancedProfileScreen from './components/EnhancedProfileScreen';
import EnhancedAOYScreen from './components/EnhancedAOYScreen';
import RegisterScreen from './screens/RegisterScreen';
import ClubScreen from './screens/ClubScreen';
import TournamentDetailScreen from './screens/TournamentDetailScreen';

// Navigation types
type TabParamList = {
  Home: undefined;
  Tournaments: undefined;
  AOY: undefined;
  Club: undefined;
  Profile: undefined;
};

type TournamentStackParamList = {
  TournamentsList: undefined;
  TournamentDetail: { tournamentId: string };
};

type RootStackParamList = {
  Main: undefined;
  Register: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const TournamentStack = createNativeStackNavigator<TournamentStackParamList>();

function TournamentStackNavigator() {
  return (
    <TournamentStack.Navigator screenOptions={{ headerShown: false }}>
      <TournamentStack.Screen 
        name="TournamentsList" 
        component={EnhancedTournamentsScreen} 
      />
      <TournamentStack.Screen 
        name="TournamentDetail" 
        component={TournamentDetailScreen} 
      />
    </TournamentStack.Navigator>
  );
}

function TabNavigator() {
  const { profile } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          let accessibilityLabel = 'Home';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            accessibilityLabel = 'Home tab';
          } else if (route.name === 'Tournaments') {
            iconName = focused ? 'fish' : 'fish-outline';
            accessibilityLabel = 'Tournaments tab';
          } else if (route.name === 'AOY') {
            iconName = focused ? 'trophy' : 'trophy-outline';
            accessibilityLabel = 'Angler of the Year standings tab';
          } else if (route.name === 'Club') {
            iconName = focused ? 'people' : 'people-outline';
            accessibilityLabel = 'Club information tab';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            accessibilityLabel = 'Profile tab';
          }
          
          return <Ionicons name={iconName} size={size} color={color} accessibilityLabel={accessibilityLabel} />;
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
        component={EnhancedHomeScreen}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentStackNavigator}
        options={{ title: 'Tournaments' }}
      />
      <Tab.Screen 
        name="AOY" 
        options={{ title: 'AOY' }}
        component={EnhancedAOYScreen}
      />
      <Tab.Screen 
        name="Club" 
        options={{ title: 'Denver BM' }}
        component={ClubScreen}
      />
      <Tab.Screen 
        name="Profile" 
        options={{ title: 'Profile' }}
        component={EnhancedProfileScreen}
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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navigation />
          <Toast />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
