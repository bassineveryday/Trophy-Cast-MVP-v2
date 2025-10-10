/**
 * Tests for Toast notification utilities
 * Critical paths: success, error, info, warning toasts
 */

import Toast from 'react-native-toast-message';
import { showSuccess, showError, showInfo, showWarning, hideToast } from '../utils/toast';

jest.mock('react-native-toast-message');

describe('Toast Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('showSuccess', () => {
    it('should display success toast with title only', () => {
      showSuccess('Success!');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Success!',
        text2: undefined,
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
      });
    });

    it('should display success toast with title and message', () => {
      showSuccess('Tournament Saved', 'Your results have been recorded');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Tournament Saved',
        text2: 'Your results have been recorded',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
      });
    });
  });

  describe('showError', () => {
    it('should display error toast with title only', () => {
      showError('Error occurred');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error occurred',
        text2: undefined,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 50,
      });
    });

    it('should display error toast with title and message', () => {
      showError('Login Failed', 'Invalid credentials');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid credentials',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 50,
      });
    });

    it('should show error toast for longer duration than success', () => {
      showSuccess('Success');
      const successCall = (Toast.show as jest.Mock).mock.calls[0][0];

      showError('Error');
      const errorCall = (Toast.show as jest.Mock).mock.calls[1][0];

      expect(errorCall.visibilityTime).toBeGreaterThan(successCall.visibilityTime);
    });
  });

  describe('showInfo', () => {
    it('should display info toast', () => {
      showInfo('New Feature', 'Check out the updated rules');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: 'New Feature',
        text2: 'Check out the updated rules',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
      });
    });
  });

  describe('showWarning', () => {
    it('should display warning toast with warning emoji', () => {
      showWarning('Slow Connection', 'Data may take longer to load');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'info',
        text1: '⚠️ Slow Connection',
        text2: 'Data may take longer to load',
        position: 'top',
        visibilityTime: 3500,
        topOffset: 50,
      });
    });

    it('should prepend warning emoji to title', () => {
      showWarning('Important Notice');

      const call = (Toast.show as jest.Mock).mock.calls[0][0];
      expect(call.text1).toContain('⚠️');
    });
  });

  describe('hideToast', () => {
    it('should hide currently displayed toast', () => {
      hideToast();

      expect(Toast.hide).toHaveBeenCalled();
    });
  });

  describe('Toast positioning and timing', () => {
    it('should display all toasts at the top', () => {
      showSuccess('Test');
      showError('Test');
      showInfo('Test');
      showWarning('Test');

      const calls = (Toast.show as jest.Mock).mock.calls;
      calls.forEach(call => {
        expect(call[0].position).toBe('top');
      });
    });

    it('should have consistent top offset', () => {
      showSuccess('Test');
      showError('Test');

      const calls = (Toast.show as jest.Mock).mock.calls;
      calls.forEach(call => {
        expect(call[0].topOffset).toBe(50);
      });
    });
  });
});
