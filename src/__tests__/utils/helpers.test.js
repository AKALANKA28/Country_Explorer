import { formatNumber, debounce, formatDate } from '../../utils/helpers';

describe('Helper functions', () => {
  test('formatNumber adds commas to large numbers', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(1234567890)).toBe('1,234,567,890');
  });

  test('formatNumber handles edge cases', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
    expect(formatNumber('not a number')).toBe('0');
  });

  test('debounce delays function execution', () => {
    jest.useFakeTimers();
    
    const mockFunction = jest.fn();
    const debouncedFn = debounce(mockFunction, 300);
    
    // Call the debounced function
    debouncedFn('test');
    
    // Function should not be called immediately
    expect(mockFunction).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Function should be called after the delay
    expect(mockFunction).toHaveBeenCalledWith('test');
    
    jest.useRealTimers();
  });

  test('debounce cancels previous calls', () => {
    jest.useFakeTimers();
    
    const mockFunction = jest.fn();
    const debouncedFn = debounce(mockFunction, 300);
    
    // Call the debounced function multiple times
    debouncedFn('test1');
    debouncedFn('test2');
    debouncedFn('test3');
    
    // Function should not be called yet
    expect(mockFunction).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Function should be called once with the last argument
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('test3');
    
    jest.useRealTimers();
  });

  test('formatDate formats date correctly', () => {
    const date = new Date('2025-05-03T12:00:00Z');
    expect(formatDate(date)).toBe('May 3, 2025');
  });

  test('formatDate handles invalid inputs', () => {
    expect(formatDate(null)).toBe('Invalid Date');
    expect(formatDate(undefined)).toBe('Invalid Date');
    expect(formatDate('not a date')).toBe('Invalid Date');
  });
});