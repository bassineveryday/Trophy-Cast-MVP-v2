/**
 * BottomTabs.tsx - MVP 5-Tab Bottom Navigation
 * 
 * Structure:
 * 1. Home (Dashboard) - entry point
 * 2. Log Catch - coming soon
 * 3. AI Coach - coming soon
 * 4. Community Dock - coming soon
 * 5. Trophy Room - coming soon
 * 
 * Fully brand-themed (Navy #0B1A2F + Gold #C9A646)
 * 70px height, always-show labels for discoverability
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import FishingThemedHomeScreen from '../screens/FishingThemedHomeScreen';

const Tab = createBottomTabNavigator();

// 🚧 Placeholder component for upcoming features
function ComingSoon({ title }: { title: string }) {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0B1A2F',
    }}>
      <Text style={{
        color: '#C9A646',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      <Text style={{
        color: '#888',
        fontSize: 14,
      }}>
        Coming Soon 🚧
      </Text>
    </View>
  );
}

// Icon factory for consistent styling
const icon = (name: keyof typeof Ionicons.glyphMap) => {
  const IconComponent = ({ focused }: { focused: boolean }) => (
    <Ionicons
      name={name}
      size={24}
      color={focused ? '#C9A646' : '#888'}
    />
  );
  IconComponent.displayName = `Icon-${name}`;
  return IconComponent;
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#0B1A2F',
          borderTopColor: '#1A2A3F',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#C9A646',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      {/* 🏠 Home (Dashboard) - Entry Point */}
      <Tab.Screen
        name="Home"
        component={FishingThemedHomeScreen}
        options={{
          tabBarIcon: icon('home'),
          tabBarLabel: 'Home',
        }}
      />

      {/* 🎣 Log Catch */}
      <Tab.Screen
        name="LogCatch"
        options={{
          tabBarIcon: icon('camera'),
          tabBarLabel: 'Log Catch',
        }}
      >
        {() => <ComingSoon title="Log Catch" />}
      </Tab.Screen>

      {/* 🤖 AI Coach */}
      <Tab.Screen
        name="AICoach"
        options={{
          tabBarIcon: icon('bulb'),
          tabBarLabel: 'AI Coach',
        }}
      >
        {() => <ComingSoon title="AI Coach" />}
      </Tab.Screen>

      {/* 💬 Community Dock */}
      <Tab.Screen
        name="CommunityDock"
        options={{
          tabBarIcon: icon('people'),
          tabBarLabel: 'Community',
        }}
      >
        {() => <ComingSoon title="Community Dock" />}
      </Tab.Screen>

      {/* 🏆 Trophy Room */}
      <Tab.Screen
        name="TrophyRoom"
        options={{
          tabBarIcon: icon('fish'),
          tabBarLabel: 'Trophy Room',
        }}
      >
        {() => <ComingSoon title="Trophy Room" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
