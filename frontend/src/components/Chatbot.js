import React, { useState } from 'react';
import api from '../api/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hello! I'm your scholarship assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/api/chatbot', { message: input });

      const botMessage = {
        type: 'bot',
        text: response.data.response || "Sorry, I couldn't understand."
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, something went wrong.'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 bg-white shadow-lg rounded-lg border flex flex-col h-96 z-50">
          
          <div className="bg-blue-600 text-white p-4 flex justify-between">
            <h3>Scholarship Assistant</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={msg.type === 'user' ? "text-right mb-2" : "text-left mb-2"}>
                <span className={msg.type === 'user' ? "bg-blue-600 text-white p-2 rounded" : "bg-gray-200 p-2 rounded"}>
                  {msg.text}
                </span>
              </div>
            ))}

            {loading && <p>Thinking...</p>}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border p-2 rounded"
            />
            <button className="bg-blue-600 text-white px-4 ml-2 rounded">
              Send
            </button>
          </form>

        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full"
      >
        Chat
      </button>
    </>
  );
};

export default Chatbot;