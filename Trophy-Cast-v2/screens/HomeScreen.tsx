import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HomeScreenProps {
  userEmail: string | null;
}

export default function HomeScreen({ userEmail }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Trophy Cast</Text>
      <Text style={styles.welcomeText}>Welcome back!</Text>
      <Text style={styles.emailText}>
        Logged in as: {userEmail}
      </Text>
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>Ready to track your fishing achievements?</Text>
        <Text style={styles.description}>
          Use the tabs below to navigate between tournaments and your profile.
        </Text>
      </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 15,
    color: '#34495e',
  },
  emailText: {
    fontSize: 16,
    marginBottom: 30,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#34495e',
  },
});