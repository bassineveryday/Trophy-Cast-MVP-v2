import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, toNavigationTheme, useTheme } from './lib/ThemeContext';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { useEntryRoute } from './hooks/useEntryRoute';
import BottomTabs from './navigation/BottomTabs';
import OnboardingSheet from './components/OnboardingSheet';
import TournamentsScreen from './screens/TournamentsScreen';
import TournamentDetailScreen from './screens/TournamentDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import AOYScreen from './screens/AOYScreen';
import { MemberProfileScreen } from './screens/MemberProfileScreen';
import { DBMMembersScreen } from './screens/DBMMembersScreen';
import { DBMAOYScreen } from './screens/DBMAOYScreen';
import { BoardBackOfficeScreen } from './screens/BoardBackOfficeScreen';

// App entry: make sure no stray SQL or debug text ends up in this TSX file.
const Stack = createNativeStackNavigator();

function AppNavigator() {
	const { theme } = useTheme();
	const { user } = useAuth();
	const { route, showOnboarding } = useEntryRoute();
	const [onboardingDismissed, setOnboardingDismissed] = useState(false);

	// If not logged in, show empty screen (or future Auth screens)
	if (!user) {
		return (
			<NavigationContainer theme={toNavigationTheme(theme)}>
				<Stack.Navigator screenOptions={{ headerShown: false }}>
					<Stack.Screen 
						name="Auth" 
						component={() => <></>} 
					/>
				</Stack.Navigator>
			</NavigationContainer>
		);
	}

	return (
		<NavigationContainer theme={toNavigationTheme(theme)}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{/* Main Tab Navigation */}
				<Stack.Screen 
					name="MainTabs" 
					component={BottomTabs}
				/>

			{/* Overlay screens (modal-style) */}
			<Stack.Group screenOptions={{ presentation: 'modal' }}>
				<Stack.Screen name="Tournaments" component={TournamentsScreen} />
				<Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="AOY" component={AOYScreen} />
				<Stack.Screen 
					name="MemberProfile" 
					component={MemberProfileScreen}
					options={{
						headerShown: true,
						headerTitle: 'Member Profile',
						headerTintColor: '#C9A646',
						headerStyle: {
							backgroundColor: '#0B1A2F',
						},
					}}
				/>
				<Stack.Screen 
					name="DBMMembers" 
					component={DBMMembersScreen}
					options={{
						headerShown: true,
						headerTitle: 'DBM Members',
						headerTintColor: '#C9A646',
						headerStyle: {
							backgroundColor: '#0B1A2F',
						},
					}}
				/>
				<Stack.Screen 
					name="DBMAOY" 
					component={DBMAOYScreen}
					options={{
						headerShown: true,
						headerTitle: 'Angler of the Year',
						headerTintColor: '#C9A646',
						headerStyle: {
							backgroundColor: '#0B1A2F',
						},
					}}
				/>
				<Stack.Screen 
					name="BoardBackOffice" 
					component={BoardBackOfficeScreen}
					options={{
						headerShown: true,
						headerTitle: 'Board Back Office',
						headerTintColor: '#C9A646',
						headerStyle: {
							backgroundColor: '#0B1A2F',
						},
					}}
				/>
			</Stack.Group>
			</Stack.Navigator>

			{/* Onboarding Sheet (overlay on top of navigation) */}
			<OnboardingSheet
				isVisible={showOnboarding && !onboardingDismissed}
				onComplete={() => setOnboardingDismissed(true)}
			/>
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