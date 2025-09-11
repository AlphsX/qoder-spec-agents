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

  // Determine if this is a sidebar notification based on the message
  const isSidebarNotification = message.includes('Sidebar');
  
  // Select appropriate icon based on notification type
  const renderIcon = () => {
    if (isSidebarNotification) {
      // Custom icon for sidebar notifications
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="w-full h-full animate-luxury-pulse"
        >
          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 5a1 1 0 011-1h14a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7zm2 2a1 1 0 000 2h2a1 1 0 000-2H6zm0 4a1 1 0 000 2h2a1 1 0 000-2H6zm4-4a1 1 0 000 2h6a1 1 0 000-2h-6zm0 4a1 1 0 000 2h6a1 1 0 000-2h-6z" />
          <path d="M19 5h2v14h-2a1 1 0 01-1-1V6a1 1 0 011-1z" />
        </svg>
      );
    } else if (theme === 'dark') {
      // Moon icon for dark mode
      return (
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
      );
    } else {
      // Sun icon for light mode
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className="w-full h-full animate-luxury-pulse"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      );
    }
  };

  return (
    <div 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md
        border transition-all duration-500
        animate-notification-enter
        ${theme === 'dark' 
          ? isSidebarNotification 
            ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-gray-700/50 shadow-[0_0_25px_rgba(55,65,81,0.7)]' 
            : 'bg-gradient-to-r from-gray-900 to-indigo-900 text-white border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
          : isSidebarNotification
            ? 'bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-900 border-gray-300/50 shadow-[0_0_25px_rgba(209,213,219,0.7)]'
            : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-900 border-amber-300/50 shadow-[0_0_15px_rgba(251,191,36,0.5)]'}
        flex items-center space-x-3
        ${isSidebarNotification ? 'min-w-[300px]' : ''}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={`flex-shrink-0 w-6 h-6 ${theme === 'dark' 
        ? isSidebarNotification ? 'text-cyan-400' : 'text-purple-300' 
        : isSidebarNotification ? 'text-blue-500' : 'text-amber-500'}`}>
        {renderIcon()}
      </div>
      <div className={`font-medium ${isSidebarNotification ? 'text-lg' : ''}`}>
        {message}
      </div>
      <button 
        onClick={onClose}
        className="ml-2 text-sm opacity-70 hover:opacity-100 focus:outline-none transition-opacity duration-200"
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