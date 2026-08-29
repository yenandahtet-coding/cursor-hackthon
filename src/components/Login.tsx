import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, User, Headset, ArrowRight, Sparkles, Phone } from 'lucide-react';
import { login, setSession } from '@/auth';
import { loginUser, signupUser } from '@/api';

type AuthMode = 'login' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goToApp = (role: 'customer' | 'rm') => {
    if (role === 'rm') {
      navigate('/rm');
      return;
    }
    navigate('/customer', { state: { playWelcomeSpeech: true } });
  };

  const demoCustomer = () => {
    login('U Aung', 'customer', 'uaung@example.com');
    navigate('/customer', { state: { playWelcomeSpeech: true } });
  };

  const demoRM = () => {
    login('RM Theingi', 'rm', 'theingi@dai-ichi.com');
    navigate('/rm');
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name');
          return;
        }
        const { user } = await signupUser({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role: 'customer',
        });
        setSession({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        });
        goToApp(user.role);
        return;
      }

      const { user } = await loginUser({
        email: email.trim(),
        password,
      });
      setSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      });
      goToApp(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
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
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow mb-4">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kizuna AI</h1>
            <p className="text-sm text-gray-500 mt-1">Family Bond Insurance</p>
          </div>

          <div className="flex p-1 mb-6 rounded-xl bg-gray-50 border border-gray-100">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-soft' : 'text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-white text-gray-900 shadow-soft' : 'text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <AnimatePresence mode="wait" initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="U Aung"
                        required={mode === 'signup'}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone (optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09xxxxxxxxx"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

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
                <p className="text-sm font-semibold text-gray-900">Login as U Aung</p>
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
                <p className="text-sm font-semibold text-gray-900">Login as Agent</p>
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
