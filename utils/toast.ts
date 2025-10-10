import Toast from 'react-native-toast-message';

/**
 * Utility functions for displaying toast notifications
 * Provides consistent, user-friendly feedback for actions throughout the app
 */

/**
 * Show a success toast message
 * @param title - The main message to display
 * @param message - Optional detailed message
 * 
 * @example
 * showSuccess('Tournament Saved', 'Your results have been recorded');
 */
export const showSuccess = (title: string, message?: string) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 50,
  });
};

/**
 * Show an error toast message
 * @param title - The main error message
 * @param message - Optional detailed error information
 * 
 * @example
 * showError('Save Failed', 'Please check your connection and try again');
 */
export const showError = (title: string, message?: string) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    topOffset: 50,
  });
};

/**
 * Show an info toast message
 * @param title - The main info message
 * @param message - Optional detailed information
 * 
 * @example
 * showInfo('New Feature', 'Check out the updated tournament rules');
 */
export const showInfo = (title: string, message?: string) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 50,
  });
};

/**
 * Show a warning toast message
 * @param title - The main warning message
 * @param message - Optional detailed warning information
 * 
 * @example
 * showWarning('Slow Connection', 'Data may take longer to load');
 */
export const showWarning = (title: string, message?: string) => {
  Toast.show({
    type: 'info', // Using 'info' type for warnings (no built-in warning type)
    text1: `⚠️ ${title}`,
    text2: message,
    position: 'top',
    visibilityTime: 3500,
    topOffset: 50,
  });
};

/**
 * Hide any currently displayed toast
 */
export const hideToast = () => {
  Toast.hide();
};
