'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Globe, TrendingUp, User, Bot, Mic, Paperclip, Moon, Sun } from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant inspired by Grok. I can help you with web search, crypto data, and general conversation. What would you like to know?',
      role: 'assistant',
      timestamp: new Date(),
      model: 'groq-llama-3.1-70b'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-1000 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-850 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">AI Agent</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inspired by Grok</p>
              </div>
            </div>
            
            {/* Model Selector */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-850 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                className="rounded-lg bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-50 focus:border-blue-500 focus:outline-none transition-colors"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Messages */}
        <div className="space-y-6 pb-32">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                
                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 transition-colors ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 border border-gray-200 dark:border-gray-800'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.role === 'assistant' && message.model && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      via {availableModels.find(m => m.id === message.model)?.name || message.model}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 transition-colors">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-850 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            {/* Attachment button */}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... I can search the web, get crypto data, and more!"
                className="w-full resize-none rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              {/* Quick action buttons */}
              <div className="absolute right-2 top-2 flex space-x-1">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                  title="Search web"
                >
                  <Globe className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                  title="Get crypto data"
                >
                  <TrendingUp className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Voice input button */}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
            >
              <Mic className="h-5 w-5" />
            </button>
            
            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-500 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          
          {/* Footer info */}
          <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-500">
            AI Agent can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}
