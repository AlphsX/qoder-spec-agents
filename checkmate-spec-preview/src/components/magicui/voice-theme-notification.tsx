'use client';

import { useEffect } from 'react';

interface VoiceThemeNotificationProps {
  message: string;
  theme: 'dark' | 'light';
  isVisible: boolean;
  onClose: () => void;
}

export function VoiceThemeNotification({ 
  message, 
  theme, 
  isVisible, 
  onClose 
}: VoiceThemeNotificationProps) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md
        border transition-all duration-500
        animate-notification-enter
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-900 to-indigo-900 text-white border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
          : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-900 border-amber-300/50 shadow-[0_0_15px_rgba(251,191,36,0.5)]'}
        flex items-center space-x-3
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={`flex-shrink-0 w-6 h-6 ${theme === 'dark' ? 'text-purple-300' : 'text-amber-500'}`}>
        {theme === 'dark' ? (
          // Moon icon for dark mode
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="w-full h-full animate-luxury-pulse"
          >
            <path 
              fillRule="evenodd" 
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="w-full h-full animate-luxury-pulse"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        )}
      </div>
      <div className="font-medium">{message}</div>
      <button 
        onClick={onClose}
        className="ml-2 text-sm opacity-70 hover:opacity-100 focus:outline-none"
        aria-label="Close notification"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </div>
  );
}