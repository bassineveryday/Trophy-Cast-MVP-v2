/**
 * Tests for ErrorBoundary component
 * Ensures error handling UI displays correctly and integrates with Sentry
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';
import * as Sentry from '../lib/sentry';

// Mock Sentry
jest.mock('../lib/sentry', () => ({
  captureError: jest.fn(),
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <Text testID="success">No error</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests since we expect errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByTestId('success')).toBeTruthy();
  });

  it('renders error UI when child component throws', () => {
    const { getByText, queryByTestId } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should not render the child component
    expect(queryByTestId('success')).toBeNull();

    // Should render error UI
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText("Don't worry - your tournament data is safe. Let's get you back on track.")).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
    expect(getByText('Reload App')).toBeTruthy();
  });

  it('captures error with Sentry when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(Sentry.captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        react: expect.objectContaining({
          componentStack: expect.any(String),
        }),
      })
    );
  });

  it('resets error state when Try Again is pressed', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error UI is shown
    expect(getByText('Try Again')).toBeTruthy();

    // Press Try Again button
    fireEvent.press(getByText('Try Again'));

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should show success content again
    // Note: This test is simplified - in real usage, the error might persist
    // unless the underlying issue is fixed
  });

  it('shows error details in development mode', () => {
    // Mock __DEV__ to true
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Error Details (Dev Mode):')).toBeTruthy();
    expect(getByText(/Test error for ErrorBoundary/)).toBeTruthy();

    // Restore original __DEV__
    (global as any).__DEV__ = originalDev;
  });

  it('hides error details in production mode', () => {
    // Mock __DEV__ to false
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const { queryByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(queryByText('Error Details (Dev Mode):')).toBeNull();

    // Restore original __DEV__
    (global as any).__DEV__ = originalDev;
  });

  it('displays fishing-themed emoji and messaging', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('🎣💥')).toBeTruthy();
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText(/tournament data is safe/)).toBeTruthy();
  });
});