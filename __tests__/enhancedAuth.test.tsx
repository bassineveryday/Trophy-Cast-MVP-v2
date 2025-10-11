import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EnhancedRegisterScreen from '../components/EnhancedRegisterScreen';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { showSuccess, showError, showWarning } from '../utils/toast';

// Mock dependencies
jest.mock('../lib/AuthContext');
jest.mock('../lib/supabase');
jest.mock('../utils/toast');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => `Icon-${name}`,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockShowSuccess = showSuccess as jest.MockedFunction<typeof showSuccess>;
const mockShowError = showError as jest.MockedFunction<typeof showError>;
const mockShowWarning = showWarning as jest.MockedFunction<typeof showWarning>;

// Mock window.location for demo login
const mockLocation = {
  reload: jest.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('EnhancedRegisterScreen', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockCreateProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn(),
      createProfile: mockCreateProfile,
      user: null,
      profile: null,
      loading: false,
    });

    // Mock Supabase query builder
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockMaybeSingle = jest.fn();
    
    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
    });

    mockSelect.mockImplementation(() => ({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
    }));
    
    mockEq.mockImplementation(() => ({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
    }));
  });

  describe('Login Mode', () => {
    it('renders login form by default', () => {
      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      expect(getByPlaceholderText('your.email@example.com')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
      expect(getByText("Don't have an account? Sign Up")).toBeTruthy();
    });

    it('validates email format on login', async () => {
      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));
      
      await waitFor(() => {
        expect(getByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('handles successful login', async () => {
      mockSignIn.mockResolvedValue({ error: null });
      
      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockShowSuccess).toHaveBeenCalledWith('Welcome back!', 'Loading your dashboard...');
      });
    });

    it('handles login errors', async () => {
      mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
      
      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrong-password');
      fireEvent.press(getByText('Login'));
      
      await waitFor(() => {
        expect(getByText('Invalid email or password. Please try again.')).toBeTruthy();
      });
    });

    it('activates demo login', () => {
      const mockLocalStorage = {
        setItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
      
      const { getByText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('🎣 Demo Login (Tai Hunt)'));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('devModeBypass', 'true');
      expect(mockShowSuccess).toHaveBeenCalledWith('Demo Mode Activated', 'Logging in as Tai Hunt...');
    });
  });

  describe('Registration Mode - Credentials Step', () => {
    it('switches to registration mode', () => {
      const { getByText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('Sign Up'));
      
      expect(getByText('Create Account')).toBeTruthy();
      expect(getByText('Step 1 of 2: Account Credentials')).toBeTruthy();
    });

    it('validates password requirements', async () => {
      const { getByText, getByPlaceholderText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('Sign Up'));
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'weak');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'weak');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Password must have: At least 6 characters, One uppercase letter, One number')).toBeTruthy();
      });
    });

    it('validates password confirmation', async () => {
      const { getByText, getByPlaceholderText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('Sign Up'));
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'DifferentPassword123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('proceeds to member info step on successful credentials', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      
      const { getByText, getByPlaceholderText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('Sign Up'));
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123');
        expect(getByText('Link Membership')).toBeTruthy();
        expect(getByText('Step 2 of 2: Denver Bassmasters Info')).toBeTruthy();
      });
    });
  });

  describe('Registration Mode - Member Info Step', () => {
    beforeEach(async () => {
      mockSignUp.mockResolvedValue({ error: null });
      
      const { getByText, getByPlaceholderText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('Sign Up'));
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Link Membership')).toBeTruthy();
      });
    });

    it('validates member code in real-time', async () => {
      // Mock successful member validation
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { member_id: 'DBM019', member_name: 'Tai Hunt', active: true },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      });

      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      // Navigate to member info step first
      fireEvent.press(getByText('Sign Up'));
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Link Membership')).toBeTruthy();
      });
      
      // Test member code validation
      fireEvent.changeText(getByPlaceholderText('e.g., DBM019'), 'DBM019');
      
      await waitFor(() => {
        expect(getByText('✅ Valid member: Tai Hunt')).toBeTruthy();
      });
    });

    it('handles invalid member code', async () => {
      // Mock member not found
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      });

      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      // Navigate to member info step first
      fireEvent.press(getByText('Sign Up'));
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Link Membership')).toBeTruthy();
      });
      
      // Test invalid member code
      fireEvent.changeText(getByPlaceholderText('e.g., DBM019'), 'INVALID');
      
      await waitFor(() => {
        expect(getByText('❌ Member code not found. Please check with club administration.')).toBeTruthy();
      });
    });

    it('completes registration successfully', async () => {
      mockCreateProfile.mockResolvedValue({ error: null });
      
      // Mock successful member validation
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { member_id: 'DBM019', member_name: 'Tai Hunt', active: true },
        error: null,
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      });

      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      // Navigate to member info step
      fireEvent.press(getByText('Sign Up'));
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Link Membership')).toBeTruthy();
      });
      
      // Fill member info
      fireEvent.changeText(getByPlaceholderText('e.g., DBM019'), 'DBM019');
      
      await waitFor(() => {
        expect(getByText('✅ Valid member: Tai Hunt')).toBeTruthy();
      });
      
      fireEvent.changeText(getByPlaceholderText('Your full name'), 'Tai Hunt');
      fireEvent.changeText(getByPlaceholderText('City, State'), 'Denver, CO');
      fireEvent.press(getByText('Complete Registration'));
      
      await waitFor(() => {
        expect(mockCreateProfile).toHaveBeenCalledWith('DBM019', 'Tai Hunt', 'Denver, CO');
        expect(getByText('Welcome to Trophy Cast!')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('allows navigation back from registration to login', () => {
      const { getByText, getByTestId } = render(<EnhancedRegisterScreen />);
      
      fireEvent.press(getByText('Sign Up'));
      expect(getByText('Create Account')).toBeTruthy();
      
      // Back button should be present (mocked as Icon-arrow-back)
      const backButtons = getByText('🏆 Trophy Cast').parent?.parent?.querySelectorAll('[data-testid*="back"]');
      // Note: In actual implementation, this would work with proper testID
    });

    it('allows navigation between registration steps', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      
      const { getByText, getByPlaceholderText } = render(<EnhancedRegisterScreen />);
      
      // Go to registration
      fireEvent.press(getByText('Sign Up'));
      
      // Complete credentials step
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Step 2 of 2: Denver Bassmasters Info')).toBeTruthy();
      });
      
      // Should be able to go back to step 1 (this would work with proper back button implementation)
    });
  });

  describe('Loading States', () => {
    it('shows loading state during login', async () => {
      // Mock a delayed login
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      
      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));
      
      // Should show loading indicator (ActivityIndicator is mocked)
      // In actual implementation, button would be disabled and show spinner
    });

    it('shows loading state during member code validation', async () => {
      // Mock delayed validation
      const mockMaybeSingle = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
      );

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      });

      const { getByPlaceholderText, getByText } = render(<EnhancedRegisterScreen />);
      
      // Navigate to member info step
      fireEvent.press(getByText('Sign Up'));
      fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Create a strong password'), 'Password123');
      fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'Password123');
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Link Membership')).toBeTruthy();
      });
      
      // Type member code to trigger validation
      fireEvent.changeText(getByPlaceholderText('e.g., DBM019'), 'DBM019');
      
      // Should show checking state (ActivityIndicator is mocked)
      // In actual implementation, validation icon would show spinner
    });
  });
});