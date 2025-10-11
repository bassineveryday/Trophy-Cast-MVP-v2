import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClubOfficer } from '../lib/types/club';

interface OfficerCardProps {
  officer: Partial<ClubOfficer & { name?: string }>;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ officer }) => {
  const handleEmailPress = () => {
    if (officer.email) {
      Linking.openURL(`mailto:${officer.email}`);
    }
  };

  const handlePhonePress = () => {
    if (officer.phone) {
      Linking.openURL(`tel:${officer.phone}`);
    }
  };

  return (
    <View style={styles.officerCard}>
      <View style={styles.officerContent}>
        <View style={styles.officerInfo}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(officer.name || 'DBM') }}
            style={styles.officerImage} 
          />
          <View>
            <Text style={styles.role}>{officer.role}</Text>
            <Text style={styles.name}>{officer.name || 'TBA'}</Text>
          </View>
        </View>
        <View style={styles.contactButtons}>
          {officer.email && (
            <TouchableOpacity onPress={handleEmailPress} style={styles.contactButton}>
              <Ionicons name="mail" size={20} color="#0066cc" />
            </TouchableOpacity>
          )}
          {officer.phone && (
            <TouchableOpacity onPress={handlePhonePress} style={styles.contactButton}>
              <Ionicons name="call" size={20} color="#0066cc" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  officerCard: {
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },
  officerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  role: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  name: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default OfficerCard;