import React, { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'react-markdown';
import api from '../api/api';

const QUICK_REPLIES = [
  '🎓 Which scholarships suit me?',
  '📅 Deadlines this month?',
  '📄 Documents needed?',
  '💡 Application tips',
  '🌍 International scholarships',
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm **ScholarBot** — your AI scholarship assistant powered by Google Gemini.\n\nAsk me anything about scholarships, eligibility, deadlines, or applications!",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(scrollToBottom, 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, scrollToBottom]);

  const handleSend = async (text) => {
    const msgText = text || input;
    if (!msgText.trim() || loading) return;

    const userMessage = { type: 'user', text: msgText, time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/chatbot', { message: msgText });
      const botMessage = {
        type: 'bot',
        text: response.data.response || "I'm not sure about that. Try asking about eligibility, deadlines, or application steps!",
        time: new Date(),
        isAI: response.data.isAI,
      };
      setMessages(prev => [...prev, botMessage]);
      if (!isOpen) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '⚠️ Something went wrong. Please try again.',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete('/api/chatbot/clear');
    } catch {
      // ignore
    }
    setMessages([
      {
        type: 'bot',
        text: "🔄 Chat cleared! I'm ready to help again. What would you like to know about scholarships?",
        time: new Date(),
      }
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden"
          style={{
            height: '550px',
            animation: 'chatSlideIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg backdrop-blur-sm">
              🤖
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">ScholarBot</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-xs opacity-90">Powered by Gemini AI</span>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-sm"
              title="Clear chat"
            >
              🗑️
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.type === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-1 shadow-sm">
                    🤖
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className={msg.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                    {msg.type === 'bot' ? (
                      <div className="chatbot-markdown">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span className={`text-[10px] text-slate-400 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.time)}
                    {msg.isAI && <span className="ml-1 opacity-60">· AI</span>}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-sm">
                  🤖
                </div>
                <div className="chat-bubble-bot flex items-center gap-1.5 py-3">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies — show only at start */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
              {QUICK_REPLIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200 dark:border-blue-800 hover:scale-105 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex gap-2 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about scholarships..."
              className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:scale-105 transition-all active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-2xl z-50 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Open chatbot"
        id="chatbot-toggle"
        style={{
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
        }}
      >
        {isOpen ? '✕' : '💬'}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
            {unread}
          </span>
        )}
      </button>
    </>
  );
};

export default Chatbot;