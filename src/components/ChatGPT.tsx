import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatGPTProps {
  isOpen: boolean;
  onToggle: () => void;
  currentGrade?: string;
  currentDifficulty?: string;
}

const ChatGPT: React.FC<ChatGPTProps> = ({ isOpen, onToggle, currentGrade, currentDifficulty }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // System prompt
  const systemPrompt = `أنت مدرس رياضيات تونسي متخصص. قدم شروحات واضحة ومفصلة خطوة بخطوة باللغة العربية (والفرنسية عند الحاجة). 

المعلومات الحالية:
- المرحلة التعليمية: ${currentGrade || 'غير محددة'}
- مستوى الصعوبة: ${currentDifficulty || 'غير محدد'}

إرشادات:
1. استخدم اللغة العربية بشكل أساسي
2. أضف المصطلحات الفرنسية عند الضرورة
3. قدم أمثلة عملية من الحياة اليومية
4. اشرح الخطوات بوضوح
5. كن صبوراً ومشجعاً
6. استخدم الرموز الرياضية عند الحاجة`;

  // Initialize with system message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: 'مرحباً! أنا مساعدك في الرياضيات. يمكنني مساعدتك في فهم المفاهيم الرياضية وحل المسائل. ما الذي تريد أن تتعلمه اليوم؟',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for API (exclude system message from display but include in API call)
      const apiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      apiMessages.push({ role: 'user', content: userMessage.content });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من الحصول على رد.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setError('عذراً، حدث خطأ في الاتصال. تأكد من إعداد مفتاح API بشكل صحيح.');
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'عذراً، لا أستطيع الرد في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-TN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">مساعد الرياضيات</h3>
            <p className="text-xs text-green-100">متصل</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
            {messages
              .filter(msg => msg.role !== 'system')
              .map((message, index) => (
                <motion.div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="rtl">
                        {message.content}
                      </p>
                    </div>
                    <p className={`text-xs text-slate-500 mt-1 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white order-1 mr-2' 
                      : 'bg-slate-200 text-slate-600 order-2 ml-2'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                </motion.div>
              ))}
            
            {isLoading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  <span className="text-sm text-slate-600">يكتب...</span>
                </div>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-2xl p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-red-600" dir="rtl">{error}</p>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                disabled={isLoading}
                dir="rtl"
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ChatGPT;