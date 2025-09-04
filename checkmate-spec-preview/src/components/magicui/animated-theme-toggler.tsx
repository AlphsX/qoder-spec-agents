"use client";

import { Moon, SunDim } from "lucide-react";

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
      className={`${className} transition-transform duration-200 active:scale-95`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <SunDim size={20} /> : <Moon size={20} />}
    </button>
  );
};
