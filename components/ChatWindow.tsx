import React, { useState, useEffect, useRef } from 'react';
import { useApplication } from '../context/AppContext';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChatWindow: React.FC = () => {
  const { state, dispatch } = useApplication();
  const { chat } = state;
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chat.isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
    }
  }, [chat.messages, chat.isOpen]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || chat.isThinking) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: userInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Optimistic UI update
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_CHAT_THINKING', payload: true });
    setUserInput('');

    try {
      const responseText = await sendMessageToGemini(chat.messages.concat(userMessage), userMessage.text);
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        aiModel: chat.currentModel,
      };
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: aiMessage });
    } catch (err) {
      console.error(err);
      // Handle error gracefully in UI if needed
    } finally {
      dispatch({ type: 'SET_CHAT_THINKING', payload: false });
    }
  };

  if (!chat.isOpen) {
      return (
        <button
            onClick={() => dispatch({type: 'TOGGLE_CHAT'})}
            className="fixed bottom-8 right-8 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 z-40 group"
            aria-label="Open AI Assistant"
        >
             <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                AI Analyst
            </span>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </button>
      );
  }

  return (
    <div className="fixed bottom-24 right-8 w-96 h-[600px] max-h-[70vh] bg-white dark:bg-slate-800 shadow-2xl rounded-xl flex flex-col z-50 border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
      <header className="px-4 py-3 bg-indigo-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="font-semibold text-sm">Chaos Theorist AI</h3>
        </div>
        <div className="flex items-center space-x-2">
            <select
                value={chat.currentModel}
                onChange={(e) => dispatch({ type: 'SET_CHAT_MODEL', payload: e.target.value as any })}
                className="text-xs bg-indigo-700 border-none rounded text-white px-2 py-0.5 focus:ring-0 cursor-pointer"
            >
                <option value="Gemini">Gemini 3 Flash</option>
                <option value="ChatGPT">ChatGPT (Sim)</option>
            </select>
            <button onClick={() => dispatch({ type: 'TOGGLE_CHAT' })} className="text-indigo-200 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar">
        <div className="space-y-4">
            {chat.messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-10">
                    <p>Hello! I am your AI Analyst.</p>
                    <p>Ask me about market risks, system parameters, or intervention strategies.</p>
                </div>
            )}
            
            {chat.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm ${
                    msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sender === 'ai' && <p className="text-[10px] mt-1 opacity-50 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                </div>
            </div>
            ))}
            
            {chat.isThinking && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="relative">
            <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your query..."
            className="w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            disabled={chat.isThinking}
            />
            <button 
                type="submit" 
                disabled={!userInput.trim() || chat.isThinking}
                className="absolute right-1 top-1 bottom-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
        </div>
      </form>
    </div>
  );
};