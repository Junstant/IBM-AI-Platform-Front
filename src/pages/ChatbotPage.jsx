import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import ModelSelector from '../components/ModelSelector';

const ChatbotPage = () => {
  const [selectedModel, setSelectedModel] = useState();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy Watson, tu asistente de IA de IBM. ¿En qué puedo ayudarte hoy?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Gracias por tu mensaje. Estoy procesando tu consulta con la tecnología Watson de IBM...",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-ibm-gray-10">
      {/* Header */}
      <div className="bg-white border-b border-ibm-gray-20 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-ibm rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ibm-gray-90">Chatbot de IBM Local</h1>
            <p className="text-ibm-gray-70">Chatbot inteligente con procesamiento de lenguaje natural</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary' 
                    : 'bg-gradient-ibm'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-ibm-gray-20 text-ibm-gray-90'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-ibm-gray-60'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-ibm-gray-20 p-6 relative">
        {/* Selector de modelo fijo en la esquina inferior izquierda */}
        <div className="absolute left-0 bottom-0 mb-6 ml-6 z-10">
          <ModelSelector value={selectedModel?.name} onChange={setSelectedModel} showPort={true} hideLabel={true} />
        </div>
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex justify-center items-end space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 h-12 px-4 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-ibm-gray-90 text-sm shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-6 py-3 bg-gradient-ibm text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
