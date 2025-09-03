'use client';

import { useDarkMode } from '@/hooks';
import { AnimatedThemeToggler } from "@/components/magicui";

export default function TestThemePage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Theme Toggler Test
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Current mode: {isDarkMode ? 'Dark' : 'Light'}
      </p>
      
      <div className="flex items-center space-x-4">
        <AnimatedThemeToggler 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        />
        
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Toggle Dark Mode (Standard Button)
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="text-gray-800 dark:text-gray-200">
          This text should change color when dark mode is toggled.
        </p>
      </div>
    </div>
  );
}