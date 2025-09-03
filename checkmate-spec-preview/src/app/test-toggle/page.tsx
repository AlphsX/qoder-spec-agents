'use client';

import { useState, useEffect } from 'react';

export default function TestTogglePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Theme Toggle Test
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Current mode: {isDarkMode ? 'Dark' : 'Light'}
      </p>
      
      <button
        onClick={toggleDarkMode}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Toggle Dark Mode
      </button>
      
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="text-gray-800 dark:text-gray-200">
          This text should change color when dark mode is toggled.
        </p>
      </div>
    </div>
  );
}