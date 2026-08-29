import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Flame,
  Sparkles,
  TrendingUp,
  Heart,
  Shield,
  GraduationCap,
  Loader2,
  CircleUser,
} from 'lucide-react';
import type { ChatMessage, UserData } from '@/types';

const API_BASE = 'http://localhost:5000/api';

const MOCK_WELCOME: ChatMessage = {
  id: 'welcome',
  sender: 'ai',
  text: "Mingalabar! I'm Kizuna, your family insurance companion. How can I help you protect your family's future today?",
  timestamp: Date.now(),
};

const PROJECTION_YEARS = [
  { year: 'Y1', value: 18, total: 1200000 },
  { year: 'Y2', value: 26, total: 2520000 },
  { year: 'Y3', value: 34, total: 3978000 },
  { year: 'Y4', value: 42, total: 5580000 },
  { year: 'Y5', value: 50, total: 7344000 },
  { year: 'Y6', value: 58, total: 9270000 },
  { year: 'Y7', value: 66, total: 11370000 },
  { year: 'Y8', value: 74, total: 13680000 },
  { year: 'Y9', value: 82, total: 16200000 },
  { year: 'Y10', value: 100, total: 18950000 },
];

function formatPoints(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export default function CustomerApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([MOCK_WELCOME]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user/U_Aung`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        if (!active) return;
        setUserData({
          name: data.name ?? 'U Aung',
          kizunaPoints: data.kizunaPoints ?? 1250,
          dailyStreak: data.dailyStreak ?? 3,
          avatarInitial: (data.name ?? 'U Aung').charAt(0),
        });
      } catch {
        if (!active) return;
        setUserData({
          name: 'U Aung',
          kizunaPoints: 1250,
          dailyStreak: 3,
          avatarInitial: 'U',
        });
      } finally {
        if (active) setUserLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

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
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: 'U_Aung', message: text }),
      });
      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();
      const aiText =
        data.response ??
        data.reply ??
        data.message ??
        "I understand. Let me help you find the best protection plan for your family.";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'ai',
          text: "I'm having trouble connecting right now, but I'm still here for you. Please try again in a moment.",
          timestamp: Date.now(),
        },
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
        <div className="max-w-md mx-auto px-5 pt-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
                  Kizuna AI
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  Family Bond
                </p>
              </div>
            </div>
            {userLoading ? (
              <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center">
                <CircleUser className="w-5 h-5 text-brand-500" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900">
              Mingalabar, {userData?.name ?? '...'}!
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your family's protection, simplified.
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white shadow-glow relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="flex items-center gap-1.5 mb-1 relative">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium opacity-90">
                  Kizuna Points
                </span>
              </div>
              <p className="text-2xl font-bold relative">
                {userData
                  ? formatPoints(userData.kizunaPoints)
                  : '---'}
              </p>
              <p className="text-[10px] opacity-80 mt-0.5 relative">
                +50 earned today
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-orange-50" />
              <div className="flex items-center gap-1.5 mb-1 relative">
                <Flame className="w-3.5 h-3.5 text-orange-500" fill="currentColor" />
                <span className="text-[11px] font-medium text-gray-500">
                  Daily Streak
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 relative">
                {userData?.dailyStreak ?? '—'}{' '}
                <span className="text-sm font-medium text-gray-400">
                  Days
                </span>
              </p>
              <p className="text-[10px] text-orange-500 mt-0.5 relative font-medium">
                Keep it going!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-5 mt-5 space-y-5">
        {/* Chat Card */}
        <section className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Chat with Kizuna
                </h2>
                <p className="text-[11px] text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-soft" />
                  Online
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
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
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
                <div className="bg-white rounded-2xl rounded-bl-md border border-gray-100 shadow-soft px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" />
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
                placeholder="Ask about family protection..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                disabled={isSending}
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

        {/* Savings Projection Chart */}
        <section className="bg-white rounded-3xl shadow-card border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Education Savings
                </h2>
                <p className="text-[11px] text-gray-400">
                  10-Year Projection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-brand-500 text-xs font-semibold bg-brand-50 px-2.5 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              +58% growth
            </div>
          </div>

          <div className="mt-4 mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              18.95M
            </span>
            <span className="text-xs text-gray-400 font-medium">MMK target</span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-1.5 h-32 pt-2">
            {PROJECTION_YEARS.map((d, i) => (
              <div
                key={d.year}
                className="flex-1 flex flex-col items-center gap-1.5 group"
              >
                <div className="w-full flex flex-col justify-end h-full relative">
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
                <span className="text-[9px] text-gray-400 font-medium">
                  {d.year}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-300" />
              Annual savings
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
              Goal year
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400">Monthly</p>
              <p className="text-sm font-bold text-gray-800">150K</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400">Returns</p>
              <p className="text-sm font-bold text-gray-800">6.5%</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-brand-400">Bonus</p>
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
              <h2 className="text-sm font-semibold">Family Protection</h2>
            </div>
            <p className="text-2xl font-bold mb-1">84%</p>
            <p className="text-xs text-gray-400 mb-3">
              Coverage score — good progress!
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
