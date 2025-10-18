import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, toNavigationTheme, useTheme } from './lib/ThemeContext';
import { AuthProvider } from './lib/AuthContext';
import FishingThemedHomeScreen from './screens/FishingThemedHomeScreen';
import TournamentsScreen from './screens/TournamentsScreen';
import TournamentDetailScreen from './screens/TournamentDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import AOYScreen from './screens/AOYScreen';

// App entry: make sure no stray SQL or debug text ends up in this TSX file.
const Stack = createNativeStackNavigator();

function AppNavigator() {
	const { theme } = useTheme();
	return (
		<NavigationContainer theme={toNavigationTheme(theme)}>
			<Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Home" component={FishingThemedHomeScreen} />
				<Stack.Screen name="Tournaments" component={TournamentsScreen} />
				<Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="AOY" component={AOYScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	const queryClient = React.useMemo(() => new QueryClient(), []);
	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<ThemeProvider>
						<AppNavigator />
					</ThemeProvider>
				</AuthProvider>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}