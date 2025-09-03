'use client'; // cd /Users/linkalphx/Claude/checkmate-spec-preview && npm run dev

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Globe, TrendingUp, User, Bot, Mic, Paperclip, Moon, Sun, Plus, Settings, MoreHorizontal, Zap, ChevronLeft } from 'lucide-react';
import { useDarkMode } from '@/hooks';

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
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div className="relative w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-col animate-slide-in">
            {/* Mobile Sidebar Header */}
            <div className="p-6 border-b border-gray-200/60 dark:border-gray-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-950"></div>
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
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl py-3 px-4 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
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
                  <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">User</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDarkMode ? (
                      <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-950"></div>
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
              className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="New Chat"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : (
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl py-3 px-4 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
              <div className="h-10 w-10 mx-auto rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-center" title="Web search capabilities" onClick={(e) => e.stopPropagation()}>
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
                <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">User</span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center" title="User">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-center space-y-1">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Settings" onClick={(e) => e.stopPropagation()}>
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">New Conversation</h2>
                <p className="text-sm text-gray-500 dark:text-gray-500">Powered by {availableModels.find(m => m.id === selectedModel)?.name || 'AI'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl mb-6 animate-pulse">
                    <Zap className="h-10 w-10 text-white animate-bounce" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 animate-gradient">
                    Hey there, I&apos;m Grok!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 animate-fade-in">
                    I&apos;m here to help you with anything you need. I can search the web, analyze crypto markets, 
                    have deep conversations, or just chat about whatever interests you.
                  </p>
                </div>
                
                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/30 cursor-pointer hover:scale-105 transition-all duration-300 group hover:shadow-lg">
                    <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Web Search</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get real-time information from across the internet</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800/30 cursor-pointer hover:scale-105 transition-all duration-300 group hover:shadow-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Crypto Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Live cryptocurrency prices and market analysis</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800/30 cursor-pointer hover:scale-105 transition-all duration-300 group hover:shadow-lg">
                    <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">AI Chat</h3>
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
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
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
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500/20'
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
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-900/50 rounded-2xl px-6 py-4 border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 animate-bounce"></div>
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

        {/* Input Area */}
        <div className="p-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              {/* Main Input Container */}
              <div className="relative flex items-end space-x-4">
                {/* Attachment button */}
                <button
                  type="button"
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-all duration-200 hover:scale-105"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                
                {/* Text input with enhanced design */}
                <div className="flex-1 relative">
                  <div className="relative bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700/50 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200 shadow-sm hover:shadow-md">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything... I can search the web, analyze crypto, or just chat!"
                      className="w-full resize-none bg-transparent px-6 py-4 pr-20 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-[15px] leading-relaxed"
                      rows={1}
                      style={{ minHeight: '56px', maxHeight: '160px' }}
                    />
                    
                    {/* Quick action buttons inside input */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <button
                        type="button"
                        className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Search web"
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Get crypto data"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Voice input button */}
                <button
                  type="button"
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-all duration-200 hover:scale-105"
                >
                  <Mic className="h-5 w-5" />
                </button>
                
                {/* Send button with enhanced design */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              {/* Footer info */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-500">
                  <span>Grok can make mistakes. Consider checking important information.</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-600">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⏎</kbd>
                  <span>to send</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⇧⏎</kbd>
                  <span>new line</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
