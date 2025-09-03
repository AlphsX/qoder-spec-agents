"use client";

import { Moon, SunDim } from "lucide-react";
import { useState } from "react";

type Props = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  className?: string;
};

export const AnimatedThemeToggler = ({ isDarkMode, toggleDarkMode, className }: Props) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop propagation to prevent parent click handlers from firing
    e.stopPropagation();
    // Prevent default to avoid any default browser behavior
    e.preventDefault();
    
    // Show visual feedback with smoother animation
    setIsClicked(true);
    // Use a shorter timeout for a more responsive feel
    setTimeout(() => setIsClicked(false), 150);
    
    toggleDarkMode();
  };
  
  // Use a more sophisticated animation that doesn't cause flickering
  const buttonClasses = `${className} ${
    isClicked 
      ? 'scale-95 opacity-90' 
      : 'scale-100 opacity-100'
  } transform transition-all duration-150 ease-out`;
  
  return (
    <button 
      onClick={handleClick} 
      className={buttonClasses}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="transition-all duration-150 ease-out">
        {isDarkMode ? <SunDim size={20} /> : <Moon size={20} />}
      </div>
    </button>
  );
};