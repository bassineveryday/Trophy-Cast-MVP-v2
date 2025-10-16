import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Raleway_400Regular } from '@expo-google-fonts/raleway';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider, useTheme, toNavigationTheme } from './lib/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';

// Import screens
import HomeScreen from './screens/HomeScreen';
import EnhancedHomeScreen from './screens/EnhancedHomeScreen';
import FishingThemedHomeScreen from './screens/FishingThemedHomeScreen';
import EnhancedTournamentsScreen from './components/EnhancedTournamentsScreen';
import EnhancedProfileScreen from './components/EnhancedProfileScreen';
import ComprehensiveMemberProfile from './screens/ComprehensiveMemberProfile';
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
  MemberProfile: { memberId?: string };
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
  const { theme } = useTheme();
  
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
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        options={{ headerShown: false, title: '' }}
        component={FishingThemedHomeScreen}
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user || !profile ? (
        <Stack.Screen name="Register" component={RegisterScreen} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
      {/* Standalone member profile route for deep-linked member dashboards */}
      <Stack.Screen
        name="MemberProfile"
        component={ComprehensiveMemberProfile}
        options={{ headerShown: true, title: 'Member Profile' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Wait for fonts to load before rendering
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemedNavigation />
            <Toast />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function ThemedNavigation() {
  const { theme } = useTheme();
  const navTheme = toNavigationTheme(theme);
  
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.background} />
      <Navigation />
    </NavigationContainer>
  );
}
