"use client";

import { Moon, Sun } from "lucide-react";

type Props = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  className?: string;
};

export const AnimatedThemeToggler = ({ isDarkMode, toggleDarkMode, className }: Props) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    toggleDarkMode();
  };

  return (
    <button 
      onClick={handleClick} 
      className={`${className} transition-all duration-300 ease-in-out active:scale-95 relative overflow-hidden`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5">
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
          <Sun size={20} />
        </div>
        <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}>
          <Moon size={20} />
        </div>
      </div>
    </button>
  );
};