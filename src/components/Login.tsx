import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Headset, ArrowRight, Sparkles } from 'lucide-react';
import { login } from '@/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const demoCustomer = () => {
    login('U Aung', 'customer', 'uaung@example.com');
    navigate('/customer');
  };

  const demoRM = () => {
    login('RM Theingi', 'rm', 'theingi@dai-ichi.com');
    navigate('/rm');
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('rm') || email.includes('agent')) {
      demoRM();
    } else {
      demoCustomer();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-card border border-gray-100 p-8"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow mb-4">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kizuna AI</h1>
            <p className="text-sm text-gray-500 mt-1">Family Bond Insurance</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleManualLogin} className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Demo login buttons */}
          <div className="space-y-3">
            <p className="text-center text-[11px] text-gray-400 mb-3 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Quick demo access
            </p>
            <button
              onClick={demoCustomer}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-brand-500" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Login as U Aung
                </p>
                <p className="text-[11px] text-gray-400">Customer App</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
            </button>
            <button
              onClick={demoRM}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Headset className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Login as Agent
                </p>
                <p className="text-[11px] text-gray-400">RM Dashboard</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </motion.div>
        <p className="text-center text-[11px] text-gray-400 mt-6">
          Dai-ichi Life Insurance · Hackathon Prototype
        </p>
      </div>
    </div>
  );
}
