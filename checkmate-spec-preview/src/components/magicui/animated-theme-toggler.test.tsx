import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedThemeToggler } from './animated-theme-toggler';

// Mock the useDarkMode hook
jest.mock('@/hooks/useDarkMode', () => ({
  useDarkMode: () => ({
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
  }),
}));

describe('AnimatedThemeToggler', () => {
  it('renders correctly', () => {
    const toggleDarkMode = jest.fn();
    render(<AnimatedThemeToggler isDarkMode={false} toggleDarkMode={toggleDarkMode} />);
    
    // Check if the component renders
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls toggleDarkMode when clicked', () => {
    const toggleDarkMode = jest.fn();
    render(<AnimatedThemeToggler isDarkMode={false} toggleDarkMode={toggleDarkMode} />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Check if toggleDarkMode was called
    expect(toggleDarkMode).toHaveBeenCalledTimes(1);
  });
});