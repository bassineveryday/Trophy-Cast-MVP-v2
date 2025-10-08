import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TournamentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎣 Tournaments</Text>
      <Text style={styles.comingSoonText}>Coming Soon!</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.description}>
          Tournament features will be available in the next update:
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Browse fishing tournaments</Text>
          <Text style={styles.featureItem}>• Register for competitions</Text>
          <Text style={styles.featureItem}>• Track your results</Text>
          <Text style={styles.featureItem}>• View leaderboards</Text>
          <Text style={styles.featureItem}>• Upload catch photos</Text>
        </View>
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
  comingSoonText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    color: '#e74c3c',
  },
  contentContainer: {
    alignItems: 'flex-start',
    maxWidth: 300,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#34495e',
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
    lineHeight: 24,
  },
});