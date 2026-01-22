import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  User, 
  Bot,
  Loader2,
  Calendar,
  Users,
  Wallet,
  Heart
} from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tour-planner`;

const AiTourPlanner: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    {
      icon: Calendar,
      labelBn: '২ দিনের ট্যুর',
      labelEn: '2 Day Trip',
      prompt: language === 'bn' 
        ? 'আমি ২ দিনের জন্য কুয়াকাটা ভ্রমণের পরিকল্পনা করছি। আমাকে একটি সম্পূর্ণ ভ্রমণসূচী তৈরি করে দাও।'
        : 'I\'m planning a 2-day trip to Kuakata. Create a complete itinerary for me.',
    },
    {
      icon: Users,
      labelBn: 'পরিবার সাথে',
      labelEn: 'Family Trip',
      prompt: language === 'bn'
        ? 'আমি পরিবার নিয়ে কুয়াকাটা যাচ্ছি। বাচ্চাদের জন্য উপযোগী কার্যক্রম সহ পরিকল্পনা করো।'
        : 'I\'m visiting Kuakata with family including kids. Plan activities suitable for children.',
    },
    {
      icon: Wallet,
      labelBn: 'বাজেট ট্রিপ',
      labelEn: 'Budget Trip',
      prompt: language === 'bn'
        ? 'আমি সীমিত বাজেটে কুয়াকাটা ঘুরতে চাই। সাশ্রয়ী হোটেল ও খাবারের পরামর্শ দাও।'
        : 'I want to explore Kuakata on a budget. Suggest affordable stays and food options.',
    },
    {
      icon: Heart,
      labelBn: 'রোমান্টিক ট্রিপ',
      labelEn: 'Romantic Getaway',
      prompt: language === 'bn'
        ? 'আমি সঙ্গীর সাথে কুয়াকাটায় একটি রোমান্টিক ছুটি কাটাতে চাই। সেরা স্পট ও রিসোর্ট সাজেস্ট করো।'
        : 'I want a romantic getaway in Kuakata with my partner. Suggest the best spots and resorts.',
    },
  ];

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    setShowPreferences(false);

    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, content } : m
            );
          }
          return [...prev, { role: 'assistant', content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    streamChat(prompt);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-lg font-bold font-bangla">
              {language === 'bn' ? 'এআই ট্যুর প্ল্যানার' : 'AI Tour Planner'}
            </h1>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {showPreferences && messages.length === 0 && (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="card-elevated p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-header flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-bold font-bangla mb-2">
                {language === 'bn' ? 'স্বাগতম!' : 'Welcome!'}
              </h2>
              <p className="text-sm text-muted-foreground font-bangla">
                {language === 'bn' 
                  ? 'আমি আপনার কুয়াকাটা ভ্রমণের জন্য ব্যক্তিগত পরিকল্পনা তৈরি করতে পারি। নিচের অপশন থেকে বেছে নিন বা আপনার প্রশ্ন লিখুন।'
                  : 'I can create personalized travel plans for your Kuakata trip. Choose an option below or type your question.'}
              </p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-3">
              {quickPrompts.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(item.prompt)}
                  className="card-elevated p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="w-6 h-6 text-primary mb-2" />
                  <span className="text-sm font-medium font-bangla">
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-header flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap font-bangla">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-header flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <p className="text-sm text-muted-foreground font-bangla">
                  {language === 'bn' ? 'চিন্তা করছি...' : 'Thinking...'}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Type your question...'}
            className="min-h-[44px] max-h-[120px] resize-none font-bangla"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export default AiTourPlanner;
