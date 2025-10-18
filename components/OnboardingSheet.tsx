/**
 * OnboardingSheet.tsx - First-time user onboarding modal
 *
 * Collects:
 * - Name
 * - Hometown / Club
 * - Permissions consent
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { markFirstLoginComplete } from '../hooks/useEntryRoute';

interface OnboardingSheetProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function OnboardingSheet({
  isVisible,
  onComplete,
}: OnboardingSheetProps) {
  const { profile, createProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [hometown, setHometown] = useState(profile?.hometown || '');
  const [consentsToAnalytics, setConsentsToAnalytics] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = name.trim().length > 0 && hometown.trim().length > 0;

  const handleComplete = async () => {
    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update or create profile
      if (profile?.member_code) {
        const result = await createProfile(
          profile.member_code,
          name.trim(),
          hometown.trim()
        );

        if (result.error) {
          setError(result.error.message || 'Failed to save profile');
          setLoading(false);
          return;
        }
      }

      // Mark first login as complete
      await markFirstLoginComplete();

      // Close sheet
      onComplete();
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        // Prevent dismissing without completing (for true first-time users)
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Trophy Cast 🎣</Text>
          <Text style={styles.subtitle}>
            Let's get you set up to start logging your catches
          </Text>
        </View>

        {/* Form */}
        <ScrollView style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* Hometown Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Hometown / Club *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Denver, CO or Bass Pro Club"
              placeholderTextColor="#888"
              value={hometown}
              onChangeText={setHometown}
              editable={!loading}
            />
          </View>

          {/* Analytics Consent */}
          <View style={styles.fieldGroup}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setConsentsToAnalytics(!consentsToAnalytics)}
            >
              <View
                style={[
                  styles.checkbox,
                  consentsToAnalytics && styles.checkboxChecked,
                ]}
              >
                {consentsToAnalytics && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I consent to analytics to help improve Trophy Cast
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.completeButton,
              !isFormValid && styles.buttonDisabled,
            ]}
            onPress={handleComplete}
            disabled={!isFormValid || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Setting up...' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C9A646',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#BBB',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A2A3F',
    borderColor: '#2A3A4F',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderColor: '#C9A646',
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C9A646',
  },
  checkmark: {
    color: '#0B1A2F',
    fontWeight: '700',
    fontSize: 14,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#BBB',
    lineHeight: 20,
  },
  error: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopColor: '#1A2A3F',
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: '#C9A646',
  },
  buttonDisabled: {
    backgroundColor: '#555',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B1A2F',
  },
});
