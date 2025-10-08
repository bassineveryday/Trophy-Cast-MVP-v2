import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../services/auth';
import { LoginScreen } from '../screens/LoginScreen';
import { TournamentStatsScreen } from '../screens/TournamentStatsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Loading } from '../components/Loading';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#0066CC',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Tournaments"
        component={TournamentStatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="🏆" color={color} />,
          title: 'Tournaments',
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="📊" color={color} />,
          title: 'Leaderboard',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <TabIcon name="👤" color={color} />,
          title: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const TabIcon: React.FC<{ name: string; color: string }> = ({ name, color }) => {
  return <span style={{ fontSize: 24, filter: color === '#0066CC' ? 'none' : 'grayscale(1)' }}>{name}</span>;
};

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
