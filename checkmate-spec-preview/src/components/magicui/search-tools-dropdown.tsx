"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Globe, TrendingUp, Sparkles } from "lucide-react";

type SearchTool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

type Props = {
  onToolSelect: (toolId: string) => void;
  selectedTool: string | null;
  isDarkMode: boolean;
  className?: string;
};

const searchTools: SearchTool[] = [
  { 
    id: 'web', 
    name: 'Search web', 
    icon: <Globe className="h-5 w-5" />, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  { 
    id: 'crypto', 
    name: 'Get crypto data', 
    icon: <TrendingUp className="h-5 w-5" />, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  { 
    id: 'ai', 
    name: 'AI Chat', 
    icon: <Sparkles className="h-5 w-5" />, 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
];

export const SearchToolsDropdown = ({ onToolSelect, selectedTool, isDarkMode, className = "" }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          plusButtonRef.current && !plusButtonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Plus Button */}
      <button
        ref={plusButtonRef}
        type="button"
        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out transform ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: selectedTool === 'web' ? '#3b82f6' : 
                 selectedTool === 'crypto' ? '#10b981' : 
                 selectedTool === 'ai' ? '#8b5cf6' : 
                 isDarkMode ? '#9ca3af' : '#6b7280'
        }}
      >
        <Plus className="h-5 w-5" />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute bottom-full mb-2 w-48 rounded-2xl shadow-lg border border-gray-200/40 dark:border-gray-700/40 py-2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl animate-fadeInUp"
          style={{ 
            right: '1.5rem',
            bottom: 'calc(100% + 0.5rem)',
            animationDuration: '0.3s'
          }}
        >
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Select Tools
          </div>
          {searchTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:${tool.bgColor} dark:hover:${tool.bgColor} flex items-center transition-all duration-200 group rounded-xl mx-1`}
              onClick={() => handleToolSelect(tool.id)}
            >
              <div className={`${tool.color} mr-3 group-hover:scale-110 transition-transform duration-200`}>
                {tool.icon}
              </div>
              <span className="group-hover:translate-x-1 transition-transform duration-200 font-medium">
                {tool.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};