'use client'; // cd /Users/linkalphx/Sync-AI/checkmate-spec-preview && npm run dev

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Globe, TrendingUp, User, Bot, Mic, Paperclip, Plus, Settings, MoreHorizontal, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDarkMode } from '@/hooks';
import { AnimatedThemeToggler } from "@/components/magicui";

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
}

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState('groq-llama-3.1-70b');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Most capable GPT-4 model' },
    { id: 'groq-llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Groq', description: 'Ultra-fast inference' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Latest Claude model' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

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
          <div className="relative w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-col animate-slide-in z-10">
            {/* Mobile Sidebar Header */}
            <div className="p-6 border-b border-gray-200/60 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-gray-600 dark:bg-gray-300 rounded-full border-2 border-white dark:border-gray-950"></div>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Grok AI</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Always curious</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </button>
              </div>
            </div>

            {/* Mobile New Chat Button */}
            <div className="p-4">
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 dark:from-gray-100 dark:to-gray-200 dark:hover:from-gray-50 dark:hover:to-gray-100 text-white dark:text-gray-900 rounded-xl py-3 px-4 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Mobile Chat History */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                  <p className="text-sm font-medium truncate">Web search capabilities</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <p className="text-sm font-medium truncate">Crypto market analysis</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yesterday</p>
                </div>
                <div className="p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <p className="text-sm font-medium truncate">General AI conversation</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 days ago</p>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar Footer */}
            <div className="p-4 border-t border-gray-200/60 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-gray-600 to-gray-500 dark:from-gray-300 dark:to-gray-400 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">User</span>
                </div>
                <div className="flex items-center space-x-1">
                <AnimatedThemeToggler 
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                />
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarOpen(false);
                  }}
                  title="Hide sidebar"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-800/60 flex-col transition-all duration-300 ${isDesktopSidebarCollapsed ? 'w-16 cursor-e-resize hover:bg-gray-50/80 dark:hover:bg-gray-900/80' : 'w-64 cursor-w-resize hover:bg-gray-50/80 dark:hover:bg-gray-900/80'}`}
        onClick={isDesktopSidebarCollapsed ? () => setIsDesktopSidebarCollapsed(false) : () => setIsDesktopSidebarCollapsed(true)}
        title={isDesktopSidebarCollapsed ? 'Click anywhere to expand sidebar' : 'Click anywhere to collapse sidebar'}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center justify-center">
            <div className={`flex items-center space-x-3 ${isDesktopSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-gray-600 dark:bg-gray-300 rounded-full border-2 border-white dark:border-gray-950"></div>
              </div>
              {!isDesktopSidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Grok AI</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Always curious</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          {isDesktopSidebarCollapsed ? (
            <button 
              className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 dark:from-gray-100 dark:to-gray-200 dark:hover:from-gray-50 dark:hover:to-gray-100 text-white dark:text-gray-900 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="New Chat"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : (
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 dark:from-gray-100 dark:to-gray-200 dark:hover:from-gray-50 dark:hover:to-gray-100 text-white dark:text-gray-900 rounded-xl py-3 px-4 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4">
          {!isDesktopSidebarCollapsed ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm font-medium truncate">Web search capabilities</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
              </div>
              <div className="p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm font-medium truncate">Crypto market analysis</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yesterday</p>
              </div>
              <div className="p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm font-medium truncate">General AI conversation</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors flex items-center justify-center" title="Web search capabilities" onClick={(e) => e.stopPropagation()}>
                <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="h-10 w-10 mx-auto rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex items-center justify-center" title="Crypto market analysis" onClick={(e) => e.stopPropagation()}>
                <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="h-10 w-10 mx-auto rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex items-center justify-center" title="General AI conversation" onClick={(e) => e.stopPropagation()}>
                <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200/60 dark:border-gray-800/60">
          {!isDesktopSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-gray-600 to-gray-500 dark:from-gray-300 dark:to-gray-400 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">User</span>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                  onClick={(e) => {e.stopPropagation(); setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);}}
                  title={isDesktopSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                >
                  {isDesktopSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 bg-gradient-to-r from-gray-600 to-gray-500 dark:from-gray-300 dark:to-gray-400 rounded-full flex items-center justify-center" title="User">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-center space-y-1">
                <button 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                  onClick={(e) => {e.stopPropagation(); setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);}}
                  title={isDesktopSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                >
                  {isDesktopSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
        <header className="relative overflow-hidden">
          {/* Background with liquid glass effect */}
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-2xl saturate-150 brightness-105"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-gray-50/10 to-white/20 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-900/20"></div>
          <div className="absolute inset-0 border-b border-white/20 dark:border-gray-800/30 shadow-lg shadow-gray-500/5 dark:shadow-black/20"></div>
          
          {/* Content */}
          <div className="relative z-10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle */}
                <button 
                  className="md:hidden p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent drop-shadow-sm">New Conversation</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Powered by {availableModels.find(m => m.id === selectedModel)?.name || 'AI'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 px-4 py-2.5 text-sm font-medium focus:border-gray-400/50 dark:focus:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-300 shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-300"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id} className="bg-white dark:bg-gray-800">
                      {model.name}
                    </option>
                  ))}
                </select>
                <AnimatedThemeToggler 
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  className="p-2.5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 1 ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-8 animate-fade-in-up">
              <div className="text-center max-w-2xl">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 shadow-2xl mb-6 animate-pulse">
                    <Zap className="h-10 w-10 text-white animate-bounce" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-gray-100 dark:via-gray-300 dark:to-gray-400 bg-clip-text text-transparent mb-4 animate-gradient">
                    Hey there, I&apos;m Grok!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 animate-fade-in">
                    I&apos;m here to help you with anything you need. I can search the web, analyze crypto markets, 
                    have deep conversations, or just chat about whatever interests you.
                  </p>
                </div>
                
                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700/30 cursor-pointer hover:scale-105 transition-all duration-300 group hover:shadow-lg">
                    <Globe className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Web Search</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get real-time information from across the internet</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700/30 cursor-pointer hover:scale-105 transition-all duration-300 group hover:shadow-lg">
                    <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Crypto Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Live cryptocurrency prices and market analysis</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700/30 cursor-pointer hover:scale-105 transition-all duration-300 group hover:shadow-lg">
                    <Sparkles className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">AI Chat</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent conversations about any topic</p>
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
                        onClick={() => setInputText(prompt)}
                        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
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
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.slice(1).map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[85%] space-x-4 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${message.role === 'user'
                          ? 'bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-300 dark:to-gray-400'
                          : 'bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-200 dark:to-gray-300'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Zap className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                      
                      {/* Message Content */}
                      <div className={`${message.role === 'user' ? 'order-1' : 'order-2'} flex-1`}>
                        <div className={`rounded-2xl px-6 py-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-300 dark:to-gray-400 text-white dark:text-gray-900 border-gray-500/20 dark:border-gray-400/20'
                            : 'bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700/50 backdrop-blur-sm'
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
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-200 dark:to-gray-300 flex items-center justify-center shadow-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-900/50 rounded-2xl px-6 py-4 border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-300 dark:to-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-400 dark:to-gray-500 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-500 dark:to-gray-600 animate-bounce"></div>
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
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                {/* Enhanced Input Container with floating effect */}
                <div className="relative p-0.5 rounded-2xl">
                  <div className="flex items-end space-x-3 bg-white dark:bg-gray-900 rounded-2xl p-3">
                    {/* Enhanced Attachment button */}
                    <button
                      type="button"
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-700/90 dark:to-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-600/30 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                    >
                      <Paperclip className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                    
                    {/* Enhanced Text input */}
                    <div className="flex-1 relative">
                      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <textarea
                          ref={inputRef}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask me anything... I can search the web, analyze crypto, or just chat!"
                          className="w-full resize-none bg-transparent px-4 py-3 pr-20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm leading-relaxed font-medium"
                          rows={1}
                          style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                        
                        {/* Enhanced quick action buttons */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-md border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                            title="Search web"
                          >
                            <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-white/60 dark:bg-gray-700/60 backdrop-blur-md border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                            title="Get crypto data"
                          >
                            <TrendingUp className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Voice input button */}
                    <button
                      type="button"
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-700/90 dark:to-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-600/30 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                    >
                      <Mic className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </button>
                    
                    {/* Enhanced Send button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isLoading}
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 dark:from-gray-100 dark:to-gray-200 dark:hover:from-gray-50 dark:hover:to-gray-100 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 text-white dark:text-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-lg transform hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed border border-gray-600/20 dark:border-gray-300/20 backdrop-blur-md group"
                    >
                      <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
                

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
