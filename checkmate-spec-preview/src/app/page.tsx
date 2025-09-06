'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Globe, TrendingUp, User, Mic, Plus, Settings, MoreHorizontal, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDarkMode } from '@/hooks';
import { AnimatedThemeToggler, VoiceThemeNotification, AuroraText } from "@/components/magicui";
import { AIModelDropdown } from "@/components/magicui/ai-model-dropdown";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  features?: string[];
  recommended?: boolean;
}

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added for dropdown functionality
  const [availableModels, setAvailableModels] = useState<AIModel[]>([
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS-120B', provider: 'OpenAI', description: 'Open source 120B parameter model' },
    { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama-4 Maverick 17B', provider: 'Meta', description: '17B parameter model with 128 experts' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', provider: 'DeepSeek', description: 'Distilled version of DeepSeek R1 with 70B parameters' },
    { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', provider: 'Qwen', description: 'Latest Qwen model with 32B parameters' },
    { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2 Instruct', provider: 'Moonshot AI', description: 'Kimi K2 instruction-following model' }
  ]);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickedPrompt, setLastClickedPrompt] = useState<string>('');
  
  // Voice recognition state variables
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceThemeNotification, setVoiceThemeNotification] = useState<{
    isVisible: boolean;
    message: string;
    theme: 'dark' | 'light';
  }>({ isVisible: false, message: '', theme: 'dark' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // Added for dropdown click outside detection
  const sidebarRef = useRef<HTMLDivElement>(null); // Added for sidebar click outside detection

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // Hide welcome screen after first prompt submission
    setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${userMessage.content}". This is a mock response. In the full implementation, I would process this through the selected AI model (${selectedModel}) and provide intelligent responses with access to real-time web search and crypto data.`,
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sidebar toggle when clicking on sidebar background
  useEffect(() => {
    const handleSidebarToggle = (event: MouseEvent) => {
      // Skip if already handled by the container's onClick
      if (event.defaultPrevented) return;
    };

    document.addEventListener('mousedown', handleSidebarToggle);
    return () => {
      document.removeEventListener('mousedown', handleSidebarToggle);
    };
  }, []);

  const handleSearchWeb = () => {
    setInputText('Search the web for latest information');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleGetCryptoData = () => {
    setInputText('Get current cryptocurrency market data');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handlePromptClick = (prompt: string) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    // If the same prompt was clicked within 300ms, treat it as a double-click
    if (prompt === lastClickedPrompt && timeDiff < 300) {
      // Double-click detected - submit the prompt directly
      setInputText(prompt);
      // Use setTimeout to ensure state is updated before submitting
      setTimeout(() => {
        // Directly call the submit handler with a minimal mock event
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }, 0);
      // Reset click tracking
      setLastClickTime(0);
      setLastClickedPrompt('');
    } else {
      // Single click - populate input field
      setInputText(prompt);
      // Auto-focus the input field
      inputRef.current?.focus();
      // Update click tracking
      setLastClickTime(now);
      setLastClickedPrompt(prompt);
    }
  };

  // Auto-focus the input field when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize SpeechRecognition API
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser');
      return;
    }

    // Create new SpeechRecognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Set up event handlers
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map(result => result.transcript)
        .join('');
      
      // Check for voice commands to switch theme
      const lowerTranscript = transcript.toLowerCase().trim();
      if (lowerTranscript === 'system switch dark mode') {
        // Switch to dark mode if not already in dark mode
        if (!isDarkMode) {
          toggleDarkMode();
          setVoiceThemeNotification({
            isVisible: true,
            message: 'Switched to dark mode',
            theme: 'dark'
          });
        } else {
          setVoiceThemeNotification({
            isVisible: true,
            message: 'Already in dark mode',
            theme: 'dark'
          });
        }
        setIsListening(false);
        return; // Don't set input text for voice commands
      } else if (lowerTranscript === 'system switch light mode') {
        // Switch to light mode if not already in light mode
        if (isDarkMode) {
          toggleDarkMode();
          setVoiceThemeNotification({
            isVisible: true,
            message: 'Switched to light mode',
            theme: 'light'
          });
        } else {
          setVoiceThemeNotification({
            isVisible: true,
            message: 'Already in light mode',
            theme: 'light'
          });
        }
        setIsListening(false);
        return; // Don't set input text for voice commands
      }
      
      setInputText(transcript);
      setIsListening(false);
      
      // Auto-focus the input field after speech recognition
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    recognition.onerror = (event: any) => {
      // console.error('Speech recognition error', event.error);
      setIsListening(false);
      
      let errorMessage = '';
      switch (event.error) {
        case 'no-speech':
          errorMessage = ''; // 'No speech was detected. Please try again.'
          break;
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during recognition.';
          break;
        case 'aborted':
          // User aborted, no need to show error
          return;
        // default:
        //   errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setVoiceError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setVoiceError(null);
      }, 5000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    // Store reference to recognition instance
    speechRecognitionRef.current = recognition;

    // Cleanup function
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping speech recognition:', e);
        }
        speechRecognitionRef.current = null;
      }
    };
  }, [isDarkMode, toggleDarkMode]);

  const toggleVoiceRecognition = () => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (!speechRecognitionRef.current) {
      setVoiceError('Speech recognition not initialized properly');
      return;
    }

    if (isListening) {
      // Stop listening
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Start listening
      try {
        speechRecognitionRef.current.start();
        // isListening state will be set by the onstart event handler
        setVoiceError(null);
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        let errorMessage = 'Error starting speech recognition';
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        setVoiceError(errorMessage);
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setVoiceError(null);
        }, 5000);
      }
    }
  };

  // Keyboard shortcut to focus input field (⌘+J on Mac, Ctrl+J on Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed along with 'J'
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-1000 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50 transition-all duration-500">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={(e) => {
              // Only close sidebar if clicking directly on the overlay, not on child elements
              if (e.target === e.currentTarget) {
                setIsSidebarOpen(false);
              }
            }}
          ></div>
          <div className="relative w-64 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/30 dark:border-gray-700/30 flex-col animate-slide-in z-10">
            {/* Mobile Sidebar Header */}
            <div className="p-6 border-b border-gray-200/60 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={(e) => {
                      e.stopPropagation(); // Prevent sidebar toggle when clicking logo
                      setMessages([]);
                      setShowWelcome(true);
                    }}
                      data-sidebar-element="logo"
                    >
                      <Zap className="h-5 w-5 text-white mx-auto" />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                  data-sidebar-element="mobile-close"
                >
                  <Plus className="h-4 w-4 rotate-45 mx-auto" />
                </button>
              </div>
            </div>

            {/* Mobile New Chat Button */}
            <div className="p-4 pt-2 pb-2">
              <button className="w-full flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800 text-white rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 shadow hover:shadow-md transform hover:scale-105" onClick={(e) => {
                e.stopPropagation();
                setMessages([]);
                setShowWelcome(true);
              }}>
                <Plus className="h-5 w-5 flex-shrink-0" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Mobile Chat History */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
              <div className="space-y-2">
                <button className="w-full h-10 flex items-center space-x-2 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40" onClick={(e) => e.stopPropagation()}>
                  <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">Web search capabilities</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                  </div>
                </button>
                <button className="w-full h-10 flex items-center space-x-2 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40" onClick={(e) => e.stopPropagation()}>
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">Crypto market analysis</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                  </div>
                </button>
                <button className="w-full h-10 flex items-center space-x-2 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 rounded-xl py-2 px-3 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40" onClick={(e) => e.stopPropagation()}>
                  <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">General AI conversation</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white mx-auto" />
                    </div>
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <span className="text-sm font-medium">𝕏</span>
                </div>
                <div className="flex items-center space-x-1">
                <AnimatedThemeToggler 
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                />
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarOpen(false);
                  }}
                  title="Hide sidebar"
                  data-sidebar-element="mobile-sidebar-toggle"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 mx-auto" />
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div 
        ref={sidebarRef}
        className={`hidden md:flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r 
          border-gray-200/30 dark:border-gray-700/30 flex-col transition-all duration-300 
          ${isDesktopSidebarCollapsed ? 'w-16 cursor-e-resize' : 'w-64 cursor-w-resize'} overflow-hidden`}
          data-sidebar-element="desktop-sidebar"
          onClick={(e) => {
            // Prevent toggle when clicking on interactive elements
            const target = e.target as HTMLElement;
            const isInteractiveElement = target.closest('button, a, input, textarea, select');
            
            if (!isInteractiveElement) {
              e.stopPropagation();
              setIsDesktopSidebarCollapsed(prev => !prev);
            }
          }}
        >
        {/* Sidebar Header */}
        <div className="p-4">
          <div className="flex items-center justify-center">
            <div className={`flex items-center w-full ${isDesktopSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
              <div className="relative">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-2xl 
                  bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent sidebar toggle when clicking logo
                    setMessages([]);
                    setShowWelcome(true);
                  }}
                  data-sidebar-element="logo"
                >
                  <Zap className="h-5 w-5 text-white mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pt-4 pb-2 flex flex-col items-center justify-center">
          {isDesktopSidebarCollapsed ? (
            <button 
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow hover:shadow-md transform hover:scale-105"
              title="New Chat"
              onClick={(e) => {
                e.stopPropagation();
                setMessages([]);
                setShowWelcome(true);
              }}
              data-sidebar-element="new-chat-button"
            >
              <Plus className="h-5 w-5 mx-auto" />
            </button>
          ) : (
            <button 
              className="w-full flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800 text-white rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 shadow hover:shadow-md transform hover:scale-[1.02]"
              onClick={(e) => {
                e.stopPropagation();
                setMessages([]);
                setShowWelcome(true);
              }}
              data-sidebar-element="new-chat-button"
            >
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold">New Chat</span>
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
          {!isDesktopSidebarCollapsed ? (
            <div className="space-y-2">
              <button 
                className="w-full h-12 flex items-center space-x-3 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40"
                onClick={(e) => e.stopPropagation()}
                data-sidebar-element="chat-history-item"
              >
                <Globe className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium truncate">Web search capabilities</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </button>
              <button 
                className="w-full h-12 flex items-center space-x-3 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40"
                onClick={(e) => e.stopPropagation()}
                data-sidebar-element="chat-history-item"
              >
                <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium truncate">Crypto market analysis</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                </div>
              </button>
              <button 
                className="w-full h-12 flex items-center space-x-3 bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40"
                onClick={(e) => e.stopPropagation()}
                data-sidebar-element="chat-history-item"
              >
                <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium truncate">General AI conversation</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center justify-center w-full">
              <button 
                className="w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 flex items-center justify-center shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40 transition-all duration-200 transform hover:scale-105"
                title="Web search capabilities" 
                onClick={(e) => e.stopPropagation()}
                data-sidebar-element="chat-history-item"
              >
                <Globe className="h-5 w-5 text-blue-500 mx-auto" />
              </button>
              <button 
                className="w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 flex items-center justify-center shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40 transition-all duration-200 transform hover:scale-105"
                title="Crypto market analysis" 
                onClick={(e) => e.stopPropagation()}
                data-sidebar-element="chat-history-item"
              >
                <TrendingUp className="h-5 w-5 text-green-500 mx-auto" />
              </button>
              <button 
                className="w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/40 text-gray-800 dark:text-gray-200 flex items-center justify-center shadow-sm hover:shadow border border-gray-200/40 dark:border-gray-700/40 transition-all duration-200 transform hover:scale-105"
                title="General AI conversation" 
                onClick={(e) => e.stopPropagation()}
                data-sidebar-element="chat-history-item"
              >
                <Sparkles className="h-5 w-5 text-purple-500 mx-auto" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4">
          {!isDesktopSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-9 w-9 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">𝕏</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors flex items-center justify-center" // hide sidebar toggle button
                  onClick={(e) => {e.stopPropagation(); setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);}}
                  title={isDesktopSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                  data-sidebar-element="desktop-sidebar-toggle"
                >
                  {isDesktopSidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto" />
                  ) : (
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="relative" title="𝕏">
                <div className="h-9 w-9 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white mx-auto" />
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <button 
                  className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors flex items-center justify-center" // show sidebar toggle button
                  onClick={(e) => {e.stopPropagation(); setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);}}
                  title={isDesktopSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                  data-sidebar-element="desktop-sidebar-toggle"
                >
                  {isDesktopSidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto" />
                  ) : (
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 mx-auto" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Apple Liquid Glass Effect */}
        <header className="relative">
          {/* Content */}
          <div className="relative z-10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle */}
                <button 
                  className="md:hidden p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 mx-auto" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 mx-auto" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <AIModelDropdown 
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                />
                <AnimatedThemeToggler 
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/40 dark:border-gray-700/40 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 shadow hover:shadow-md flex items-center justify-center"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Voice Theme Notification */}
          <VoiceThemeNotification
            message={voiceThemeNotification.message}
            theme={voiceThemeNotification.theme}
            isVisible={voiceThemeNotification.isVisible}
            onClose={() => setVoiceThemeNotification(prev => ({ ...prev, isVisible: false }))}
          />
          
          {/* Notification Toast */}
          {/* Old notification system removed, using VoiceThemeNotification instead */}
          
          {showWelcome ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-8 animate-fade-in-up">
              <div className="text-center max-w-2xl">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 shadow-xl mb-6">
                    <Zap className="h-10 w-10 text-white mx-auto" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4">
                    <AuroraText>Hey there, I&apos;m Sync!</AuroraText>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 animate-fade-in">
                    How can I help you?
                  </p>
                </div>
                
                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/40 border border-gray-200/40 dark:border-gray-700/40 cursor-pointer hover:scale-[1.02] transition-all duration-200 group hover:shadow-md flex flex-col items-center">
                    <Globe className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 mx-auto" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors text-center">Web Search</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Get real-time information from across the internet</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/40 border border-gray-200/40 dark:border-gray-700/40 cursor-pointer hover:scale-[1.02] transition-all duration-200 group hover:shadow-md flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 mx-auto" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors text-center">Crypto Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Live cryptocurrency prices and market analysis</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/40 border border-gray-200/40 dark:border-gray-700/40 cursor-pointer hover:scale-[1.02] transition-all duration-200 group hover:shadow-md flex flex-col items-center">
                    <Sparkles className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 mx-auto" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors text-center">AI Chat</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Intelligent conversations about any topic</p>
                  </div>
                </div>
                
                {/* Example Prompts */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "What's trending on the internet today?",
                      "Explain quantum computing simply",
                      "What's the current Bitcoin price?",
                      "Latest news in AI development"
                    ].map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/40 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 border border-gray-200/40 dark:border-gray-700/40 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex max-w-full space-x-4">
                      {/* Message Content */}
                      <div className="flex-1">
                        <div className={`rounded-2xl px-6 py-4 shadow-sm border transition-all duration-200 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white border-blue-500/20'
                            : 'bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 border-gray-200/40 dark:border-gray-700/40'
                        }`}>
                          <p className="text-[15px] leading-relaxed">{message.content}</p>
                          {message.role === 'assistant' && message.model && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {availableModels.find(m => m.id === message.model)?.name || message.model}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-4">
                      <div className="bg-transparent rounded-2xl px-6 py-4 border border-gray-900/20 dark:border-gray-100/20">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Enhanced Input Area - Premium UX - Compact */}
        <div className="relative overflow-hidden">
          {/* Content */}
          <div className="relative z-10 p-3">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                {/* Enhanced Input Container with floating effect - Removed outer container */}
                <div className="flex items-end space-x-2 bg-transparent rounded-3xl p-2">
                  {/* Enhanced Text input */}
                  <div className="flex-1 relative">
                    <div className="relative bg-transparent rounded-3xl overflow-hidden border border-gray-900/20 dark:border-gray-100/20">
                      {/* Plus button with dropdown for search web and crypto data - moved inside the input container */}
                      <div className="absolute left-2 bottom-2 flex-shrink-0 w-10 h-10" ref={dropdownRef}>
                        <button
                          type="button"
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        {/* Dropdown menu for search options */}
                        {isDropdownOpen && (
                          <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl shadow-lg border border-gray-200/40 dark:border-gray-700/40 py-2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40 flex items-center"
                              onClick={handleSearchWeb}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Search web
                            </button>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40 flex items-center"
                              onClick={handleGetCryptoData}
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Get crypto data
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className="w-full resize-none bg-transparent px-14 py-3 pr-14 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm leading-relaxed font-medium"
                        rows={1}
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                      />
                      
                      {/* Voice input and Send buttons - moved inside the input container on the right side */}
                      <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                        {/* Enhanced Voice input button */}
                        <button
                          type="button"
                          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
                            isListening 
                              ? 'text-red-500 hover:bg-red-500/10' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={toggleVoiceRecognition}
                          disabled={!!voiceError}
                          title={voiceError || (isListening ? 'Stop listening' : 'Start voice input')}
                        >
                          {isListening ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                          ) : (
                            <Mic className={`h-5 w-5`} />
                          )}
                        </button>
                        
                        {/* Enhanced Send button with upward arrow icon */}
                        <button
                          type="submit"
                          disabled={!inputText.trim() || isLoading}
                          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 disabled:from-gray-100 disabled:to-gray-100 dark:disabled:from-gray-800 dark:disabled:to-gray-800 text-white transition-all duration-200 shadow hover:shadow-md disabled:shadow transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-gray-900/20 dark:border-gray-100/20 group"
                        >
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 group-hover:-translate-y-0.5 transition-transform duration-200 mx-auto ${(!inputText.trim() || isLoading) ? "text-gray-900 dark:text-gray-100" : "text-white"}`}
                          >
                            <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
              {/* Voice error message */}
              {voiceError && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-red-500 dark:text-red-400">{voiceError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}