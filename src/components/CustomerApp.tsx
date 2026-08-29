import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Flame,
  Sparkles,
  TrendingUp,
  Heart,
  Shield,
  GraduationCap,
  Volume2,
  Square,
  LogOut,
  Globe,
  Calculator,
} from 'lucide-react';
import type { ChatMessage, Language } from '@/types';
import { logout, getCurrentUser } from '@/auth';
import { createLead, sendChatMessage } from '@/api';

const TTS_LANG: Record<Language, string> = { mm: 'my-MM', en: 'en-US' };

function getGreeting(language: Language, name: string): string {
  if (language === 'mm') {
    return `မင်္ဂလာပါ ${name}၊ မနေ့က ခြေလှမ်း ၈၀၀၀ ပြည့်တဲ့အတွက် Kizuna Points ၅၀ ရပါတယ်! ဒီနေ့ရော မိသားစုတွေ ကောင်းကြရဲ့လား။`;
  }
  return `Mingalabar ${name}! Congratulations on reaching 8,000 steps yesterday—you've earned 50 Kizuna Points! How is your family doing today?`;
}

function getWelcomeSpeech(name: string): string {
  return `Mingalabar ${name}! Welcome to Kizuna AI. How can I help you protect your family today?`;
}

const PROJECTION_YEARS = [
  { year: 'Y1', value: 18 },
  { year: 'Y2', value: 26 },
  { year: 'Y3', value: 34 },
  { year: 'Y4', value: 42 },
  { year: 'Y5', value: 50 },
  { year: 'Y6', value: 58 },
  { year: 'Y7', value: 66 },
  { year: 'Y8', value: 74 },
  { year: 'Y9', value: 82 },
  { year: 'Y10', value: 100 },
];

const FALLBACK_REPLY =
  "I'm having a little trouble connecting right now, but I am still here to help your family!";

const UI_TEXT: Record<Language, { placeholder: string; online: string; chatTitle: string; subtitle: string }> = {
  en: { placeholder: 'Ask about family protection...', online: 'Online', chatTitle: 'Chat with Kizuna', subtitle: "Your family's protection, simplified." },
  mm: { placeholder: 'မိသားစု ကာကွယ်ရေးအကြောင်း မေးပါ...', online: 'အွန်လိုင်း', chatTitle: 'Kizuna နဲ့ စကားပြော', subtitle: 'မိသားစု ကာကွယ်ရေး၊ ရိုးရှင်းပါစေ။' },
};

function saveLeadToDb(insight: string) {
  const user = getCurrentUser();
  void createLead({
    customerName: user?.name ?? 'Customer',
    insight,
    intent: 'high',
    product: 'Education Savings Plan',
    lastActive: 'Just now',
  }).catch((err) => {
    console.error('Failed to save lead to MongoDB:', err);
  });
}

export default function CustomerApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const displayName = user?.name?.trim() || 'Friend';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [educationTriggered, setEducationTriggered] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const greeting = getGreeting(language, displayName);
  const t = UI_TEXT[language];

  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        sender: 'ai',
        text: greeting,
        timestamp: Date.now(),
      },
    ]);
  }, [greeting]);

  useEffect(() => {
    const shouldPlay = Boolean(
      (location.state as { playWelcomeSpeech?: boolean } | null)?.playWelcomeSpeech
    );
    if (!shouldPlay || !('speechSynthesis' in window)) return;

    const timer = window.setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(getWelcomeSpeech(displayName));
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      window.history.replaceState({}, '');
    }, 800);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [location.state, displayName]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'mm' : 'en'));
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = TTS_LANG[language];
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const { reply, educationLead } = await sendChatMessage({
        message: text,
        history,
        language,
      });

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'ai', text: reply, timestamp: Date.now() },
      ]);

      if (educationLead) {
        saveLeadToDb('Interested in Education Plan');
        setEducationTriggered(true);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'ai', text: FALLBACK_REPLY, timestamp: Date.now() },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-soft">
        <div className="max-w-md mx-auto px-5 pt-5 pb-5">
          {/* Top row: logo + controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
                  Kizuna AI
                </p>
                <p className="text-sm font-semibold text-gray-800">Family Bond</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-100 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                {language === 'en' ? 'EN' : 'MM'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl border border-brand-100 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Log Out</span>
              </button>
            </div>
          </div>

          {/* Greeting */}
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {language === 'en' ? `Mingalabar, ${displayName}!` : `မင်္ဂလာပါ၊ ${displayName}!`}
          </h1>
          <p className="text-sm text-gray-500 mb-4">{t.subtitle}</p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white shadow-glow relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="flex items-center gap-1.5 mb-1 relative">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium opacity-90">Kizuna Points</span>
              </div>
              <p className="text-2xl font-bold relative">1,300</p>
              <p className="text-[10px] opacity-80 mt-0.5 relative">+50 earned today</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-orange-50" />
              <div className="flex items-center gap-1.5 mb-1 relative">
                <Flame className="w-3.5 h-3.5 text-orange-500" fill="currentColor" />
                <span className="text-[11px] font-medium text-gray-500">Daily Streak</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 relative">
                3 <span className="text-sm font-medium text-gray-400">Days</span>
              </p>
              <p className="text-[10px] text-orange-500 mt-0.5 relative font-medium">Keep it going!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-5 mt-5 space-y-5">
        {/* AI Greeting with TTS */}
        <section className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-4 border border-brand-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-relaxed" dir={language === 'mm' ? 'rtl' : 'ltr'}>
                {greeting}
              </p>
            </div>
            <button
              onClick={handleSpeak}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-brand-500 hover:bg-brand-50 border border-brand-100'
              }`}
              aria-label="Play audio"
            >
              {isSpeaking ? <Square className="w-4 h-4" fill="currentColor" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </section>

        {/* Chat Card */}
        <section className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t.chatTitle}</h2>
                <p className="text-[11px] text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
                  {t.online}
                </p>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="h-72 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                      <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-500 text-white rounded-br-md'
                        : 'bg-white text-gray-700 rounded-bl-md border border-gray-100 shadow-soft'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isSending && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                  <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-soft text-sm text-gray-400">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-50 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-200 transition">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={isSending}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-600 active:scale-95 transition-all"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Education Savings Simulator / Chart */}
        <section
          className={`bg-white rounded-3xl shadow-card border p-5 transition-all ${
            educationTriggered ? 'border-brand-200 ring-2 ring-brand-100' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {language === 'en' ? 'Education Savings' : 'ပညာရေး ငွေစု'}
                </h2>
                <p className="text-[11px] text-gray-400">
                  {language === 'en' ? '10-Year Projection' : '၁၀ နှစ် ခန့်မှန်းချက်'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-brand-500 text-xs font-semibold bg-brand-50 px-2.5 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              +58%
            </div>
          </div>

          {educationTriggered && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 mb-2 text-[11px] font-medium text-brand-600 bg-brand-50 rounded-lg px-3 py-2"
            >
              <Calculator className="w-3.5 h-3.5" />
              {language === 'en'
                ? 'Simulator activated based on your conversation'
                : 'စကားပြောဆိုမှုအပေါ် အခြေခံ၍ Simulator ဖွင့်ထားပါသည်'}
            </motion.div>
          )}

          <div className="mt-4 mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">18.95M</span>
            <span className="text-xs text-gray-400 font-medium">MMK target</span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-1.5 h-32 pt-2">
            {PROJECTION_YEARS.map((d, i) => (
              <div key={d.year} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex flex-col justify-end h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.value}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-t-md ${
                      i === PROJECTION_YEARS.length - 1
                        ? 'bg-gradient-to-t from-brand-600 to-brand-400'
                        : 'bg-gradient-to-t from-brand-200 to-brand-300 group-hover:from-brand-300 group-hover:to-brand-400'
                    } transition-colors`}
                  />
                </div>
                <span className="text-[9px] text-gray-400 font-medium">{d.year}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400">{language === 'en' ? 'Monthly' : 'လစဉ်'}</p>
              <p className="text-sm font-bold text-gray-800">150K</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400">{language === 'en' ? 'Returns' : 'အမြတ်'}</p>
              <p className="text-sm font-bold text-gray-800">6.5%</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-brand-400">{language === 'en' ? 'Bonus' : 'ပိုစား'}</p>
              <p className="text-sm font-bold text-brand-600">+250K</p>
            </div>
          </div>
        </section>

        {/* Protection status */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-brand-500/20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-brand-400" />
              <h2 className="text-sm font-semibold">
                {language === 'en' ? 'Family Protection' : 'မိသားစု ကာကွယ်မှု'}
              </h2>
            </div>
            <p className="text-2xl font-bold mb-1">84%</p>
            <p className="text-xs text-gray-400 mb-3">
              {language === 'en' ? 'Coverage score — good progress!' : 'ဖုံးဆွတ် အမှတ် — ကောင်းမွန်ပါသည်!'}
            </p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
