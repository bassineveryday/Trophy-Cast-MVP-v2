import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import TournamentCard from '../components/TournamentCard';
import TournamentSearch from '../components/TournamentSearch';

describe('Tournament UI components', () => {
  it('TournamentCard renders basic info and is pressable', () => {
    const onPress = jest.fn();
    const { toJSON, getByTestId } = render(
      <TournamentCard
        id="evt-1"
        title="Norton Lake Bash"
        lake="Norton"
        date="Sat, Sep 13, 2025"
        attending={24}
        onPress={onPress}
        testID="card.norton"
      />
    );
    expect(toJSON()).toMatchSnapshot();
    fireEvent.press(getByTestId('card.norton'));
    expect(onPress).toHaveBeenCalledWith('evt-1');
  });

  it('TournamentSearch debounces calls to onChange', () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    const { getByTestId } = render(
      <TournamentSearch value="" onChange={onChange} debounceMs={200} />
    );
    const input = getByTestId('tournament.search');

    act(() => {
      fireEvent.changeText(input, 'Nor');
      fireEvent.changeText(input, 'Nort');
      fireEvent.changeText(input, 'Norton');
      jest.advanceTimersByTime(199);
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Norton');

    jest.useRealTimers();
  });
});
