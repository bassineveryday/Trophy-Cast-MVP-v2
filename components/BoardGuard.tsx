/**
 * BoardGuard.tsx
 * 
 * Wrapper component that protects board-only screens
 * Shows loading spinner while checking access
 * Shows "Not authorized" message if user is not a board member
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useBoardAccess } from '../hooks/useBoardAccess';

const COLORS = {
  navy: '#0B1A2F',
  gold: '#C9A646',
  error: '#FF6B6B',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
};

interface BoardGuardProps {
  children: React.ReactNode;
}

export const BoardGuard: React.FC<BoardGuardProps> = ({ children }) => {
  const { loading, isBoard } = useBoardAccess();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.navy,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text
          style={{
            marginTop: 12,
            color: COLORS.textGray,
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          Checking access…
        </Text>
      </View>
    );
  }

  if (!isBoard) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backgroundColor: COLORS.navy,
        }}
      >
        <Text
          style={{
            color: COLORS.error,
            fontWeight: '700',
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          Not Authorized
        </Text>
        <Text
          style={{
            color: COLORS.textGray,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          This area is for DBM Board members only.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};
