import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Paperclip,
  Image as ImageIcon,
  File,
  Smile,
} from 'lucide-react';

export default function ChatSuportePage() {
  const { loading } = useProtectedRoute([
    'PROPRIETARIO',
    'FUNCIONARIO',
    'ADMIN',
  ]);
  const [mensagem, setMensagem] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Olá! Sou o assistente virtual da Buffs. Como posso ajudar você hoje?',
      time: '14:32',
      date: 'hoje',
    },
    {
      id: 2,
      sender: 'bot',
      text: 'Você pode tirar dúvidas sobre o sistema, relatar problemas ou solicitar ajuda com funcionalidades.',
      time: '14:32',
      date: 'hoje',
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!mensagem.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: mensagem,
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: 'hoje',
    };

    setMessages([...messages, newMessage]);
    setMensagem('');

    // Simula resposta do bot
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: 'Recebi sua mensagem! Um agente de suporte irá responder em breve. Geralmente respondemos em até 5 minutos.',
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: 'hoje',
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <Loading text="Carregando chat..." />;
  }

  return (
    <>
      <Head>
        <title>Chat de Suporte | Buffs</title>
        <meta name="description" content="Fale com o suporte em tempo real" />
      </Head>

      <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] animate-in fade-in duration-500">
        {/* Header */}
        <DashboardContainer className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#404040]">
                  Chat de Suporte
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Equipe online
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Tempo médio de resposta</p>
              <p className="text-sm font-bold text-[#ce7d0a]">~5 minutos</p>
            </div>
          </div>
        </DashboardContainer>

        {/* Chat Area */}
        <DashboardContainer className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender === 'user' ? 'bg-[#ffcf78]' : 'bg-green-100'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User size={16} className="text-[#ce7d0a]" />
                  ) : (
                    <Bot size={16} className="text-green-600" />
                  )}
                </div>

                <div
                  className={`max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-[#ffcf78] text-[#404040]'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-end gap-2">
              <div className="flex gap-2 pb-2">
                <button className="p-2 text-gray-400 hover:text-[#ce7d0a] hover:bg-gray-50 rounded-lg transition-colors">
                  <Paperclip size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#ce7d0a] hover:bg-gray-50 rounded-lg transition-colors">
                  <ImageIcon size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-[#ce7d0a] hover:bg-gray-50 rounded-lg transition-colors">
                  <Smile size={18} />
                </button>
              </div>

              <div className="flex-1 flex gap-2">
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] focus:border-transparent resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!mensagem.trim()}
                  className="px-6 py-3 bg-[#ce7d0a] text-white rounded-lg hover:bg-[#b36d09] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  <Send size={18} />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </DashboardContainer>

        {/* Quick Actions */}
        <DashboardContainer className="shrink-0">
          <h3 className="text-sm font-bold text-gray-600 mb-3">
            Ações Rápidas
          </h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-[#ce7d0a] rounded-full text-xs font-medium transition-colors">
              Como cadastrar búfalos?
            </button>
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-[#ce7d0a] rounded-full text-xs font-medium transition-colors">
              Problemas com relatórios
            </button>
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-[#ce7d0a] rounded-full text-xs font-medium transition-colors">
              Solicitar nova funcionalidade
            </button>
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-[#ce7d0a] rounded-full text-xs font-medium transition-colors">
              Falar com supervisor
            </button>
          </div>
        </DashboardContainer>
      </div>
    </>
  );
}
