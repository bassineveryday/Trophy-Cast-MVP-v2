import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TopBar from '../components/TopBar';
import { ThemeProvider } from '../lib/ThemeContext';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

describe('TopBar', () => {
  it('renders title and has a back control', () => {
    const api: any = render(
      <ThemeProvider>
        <TopBar showBack title="Test Title" />
      </ThemeProvider>
    );
  const getByText = api.getByText;

  expect(getByText('Test Title')).toBeTruthy();
  // TopBar uses Ionicons('arrow-back') which is mocked to render the icon name as text
  const back = getByText('arrow-back');
    fireEvent.press(back);
    expect(back).toBeTruthy();
  });
});
