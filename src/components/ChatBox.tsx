import React, { useState } from 'react';
import { ArrowUp, Sparkles, User, Search } from 'lucide-react';
// 🔥 ІМПОРТУЄМО ПАКЕТ ДЛЯ КРАСИВОГО МАРКДАУНУ
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};


type ChatBoxProps = {
  fileAttached: boolean; 
  isFileUploading: boolean;
  apiUrl?: string;  
};

export const ChatBox: React.FC<ChatBoxProps> = ({ fileAttached, isFileUploading, apiUrl }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  // Визначаємо фінальний URL для запитів: беремо з пропсів, або фолбекаємось на localhost
  const currentApiUrl = apiUrl || 'http://localhost:8000';

  const suggestedprompts = ['Зроби короткий висновок', 'Знайди помилки ERROR', 'Згенеруй QA-тест'];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || isFileUploading) return; 

    const currentInput = inputValue;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // ✅ ЗАМІНИЛИ ЛОКАЛЬНИЙ ШЛЯХ НА УНІВЕРСАЛЬНИЙ ЗМІННИЙ ШЛЯХ
      const response = await fetch(`${currentApiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentInput }),
      });

      if (!response.ok) {
        throw new Error('Помилка сервера під час отримання відповіді');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.text
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Помилка з\'єднання з бекендом:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: '❌ Не вдалося зв\'язатися з Python-бекендом. Переконайся, що сервер розгорнутий на Render або запущений локально.'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleSuggestedClick = (prompt: string) => {
    setInputValue(prompt);
  };

  if (isFileUploading) {
    return (
      <div className="chat-box chat-box--empty">
        <div className="chat-box__empty-visual">
          <Sparkles size={32} className="chat-box__spark-icon animate-spin" />
        </div>
        <h2 className="chat-box__empty-title">Обробка вашого документа...</h2>
        <p className="chat-box__empty-text">
          Зачекайте будь ласка. SmartDoc AI аналізує структуру файлу та створює приватну базу знань.
        </p>
      </div>
    );
  }

  if (!fileAttached) {
    return (
      <div className="chat-box chat-box--empty">
        <div className="chat-box__empty-visual">
          <Sparkles size={32} className="chat-box__spark-icon" />
        </div>
        <h2 className="chat-box__empty-title">Що досліджуємо сегодня?</h2>
        <p className="chat-box__empty-text">
          Завантажте документ ліворуч, щоб створити приватну базу знань. Штучний інтелект допоможе знайти відповіді, зробити саммарі чи витягти аналітику.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-box__history">
        {messages.length === 0 ? (
          <div className="chat-box__start-state">
            <Sparkles size={24} style={{ color: 'var(--accent-color)', marginBottom: '8px' }} />
            <p>Документ успішно підключено. Задайте будь-яке питання нижче або скористайтеся підказками.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message__avatar">
                {msg.role === 'assistant' ? <Sparkles size={16} /> : <User size={16} />}
              </div>
              <div className="chat-message__content">
                <span className="chat-message__author">
                  {msg.role === 'assistant' ? 'SmartDoc AI' : 'Ви'}
                </span>
                
                <div className="chat-message__text chat-markdown-content">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="chat-message chat-message--assistant chat-message--loading">
            <div className="chat-message__avatar">
              <Sparkles size={16} className="animate-spin" />
            </div>
            <div className="chat-message__content">
              <span className="chat-message__author">SmartDoc AI</span>
              <p className="chat-message__text">Думаю...</p>
            </div>
          </div>
        )}
      </div>

      <div className="chat-box__controls">
        <div className="chat-box__suggested">
          {suggestedprompts.map((prompt, index) => (
            <button 
              key={index} 
              className="chat-box__badge"
              onClick={() => handleSuggestedClick(prompt)}
              disabled={isLoading}
            >
              <Search size={12} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        <form className="chat-box__form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-box__input"
            placeholder={isLoading ? "Очікуйте відповіді..." : "Запитайте щось про цей документ..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`chat-box__send-btn ${inputValue.trim() && !isLoading ? 'chat-box__send-btn--active' : ''}`}
            disabled={!inputValue.trim() || isLoading}
          >
            <ArrowUp size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};