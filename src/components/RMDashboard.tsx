import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Zap,
  BarChart3,
  Phone,
  GraduationCap,
  X,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
  FileText,
  Home,
} from 'lucide-react';
import type { Lead } from '@/types';

const API_BASE = 'http://localhost:5000/api';

type NavItem = 'leads' | 'clients' | 'analytics';

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof Zap }[] = [
  { id: 'leads', label: 'AI Leads', icon: Zap },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const INTENT_STYLES: Record<
  Lead['intent'],
  { label: string; bg: string; text: string; dot: string }
> = {
  high: {
    label: 'High Intent',
    bg: 'bg-brand-50',
    text: 'text-brand-600',
    dot: 'bg-brand-500',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  },
};

const CALL_SCRIPTS: Record<string, string[]> = {
  default: [
    "Greeting: Mingalabar, [Name]. This is [RM Name] from Dai-ichi Life. How are you today?",
    "Reference: I noticed you've been exploring family protection options through our Kizuna AI app.",
    "Probe: May I ask, what's most important to you right now — your children's education, health coverage, or long-term savings?",
    "Recommend: Based on your interest, I'd recommend our Family Secure Plan with education rider.",
    "Close: Would you be available this week for a 15-minute detailed consultation?",
  ],
  education: [
    "Greeting: Mingalabar, [Name]. This is [RM Name] from Dai-ichi Life.",
    "Reference: I see you've been asking about education savings for your child.",
    "Probe: Could you share which school level you're planning for — preschool, primary, or university?",
    "Recommend: Our Education Secure Plan offers guaranteed payouts aligned with school milestones.",
    "Close: Shall I send you a personalized illustration via the app?",
  ],
};

export default function RMDashboard() {
  const [activeNav, setActiveNav] = useState<NavItem>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLead, setScriptLead] = useState<Lead | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/leads`);
        if (!res.ok) throw new Error('Failed to fetch leads');
        const data = await res.json();
        if (!active) return;
        const normalized: Lead[] = (Array.isArray(data) ? data : data.leads ?? []).map(
          (l: Record<string, unknown>, i: number) => ({
            id: String(l.id ?? i),
            customerName: String(l.customerName ?? l.name ?? 'Unknown'),
            insight: String(l.insight ?? l.aiInsight ?? 'No insight available'),
            intent: (l.intent as Lead['intent']) ?? 'high',
            product: String(l.product ?? 'Family Protection'),
            lastActive: String(l.lastActive ?? 'Recently'),
            phone: l.phone ? String(l.phone) : undefined,
          })
        );
        setLeads(normalized);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Unable to load leads');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const getScript = (lead: Lead): string[] => {
    if (lead.insight.toLowerCase().includes('education') || lead.insight.toLowerCase().includes('preschool')) {
      return CALL_SCRIPTS.education;
    }
    return CALL_SCRIPTS.default;
  };

  const highIntentCount = leads.filter((l) => l.intent === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30 hidden md:flex">
        <div className="px-5 py-6 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Kizuna AI</p>
              <p className="text-[10px] text-gray-400">RM Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-brand-500' : ''}`} />
                {item.label}
                {item.id === 'leads' && leads.length > 0 && (
                  <span
                    className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      active
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {leads.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                RM Theingi
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Senior Advisor
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-sm font-bold text-gray-900">RM Dashboard</span>
        </div>
        <select
          value={activeNav}
          onChange={(e) => setActiveNav(e.target.value as NavItem)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
        >
          {NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 mt-14 md:mt-0">
        <div className="p-6 md:p-8 max-w-6xl">
          <AnimatePresence mode="wait">
            {activeNav === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-brand-500" />
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    AI Lead Alerts
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  High-intent customers identified by Kizuna AI — reach out before
                  interest cools.
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
                    <p className="text-[11px] text-gray-400 font-medium mb-1">
                      Total Leads
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {loading ? '—' : leads.length}
                    </p>
                  </div>
                  <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
                    <p className="text-[11px] text-brand-400 font-medium mb-1">
                      High Intent
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-brand-600">
                      {loading ? '—' : highIntentCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
                    <p className="text-[11px] text-gray-400 font-medium mb-1">
                      Response Rate
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      72%
                    </p>
                  </div>
                </div>

                {/* Leads */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                    <p className="text-sm text-gray-400">Loading leads...</p>
                  </div>
                ) : error ? (
                  <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                    <p className="text-sm text-brand-600 font-medium">
                      {error}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Make sure the API server is running on localhost:5000
                    </p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No leads yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {leads.map((lead, i) => {
                      const intent = INTENT_STYLES[lead.intent];
                      return (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-glow hover:border-brand-100 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-600 font-bold text-base">
                                {lead.customerName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {lead.customerName}
                                </h3>
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {lead.lastActive}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${intent.bg} ${intent.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${intent.dot} ${lead.intent === 'high' ? 'animate-pulse-soft' : ''}`} />
                              {intent.label}
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Zap className="w-3.5 h-3.5 text-brand-500" />
                              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                AI Insight
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {lead.insight}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {lead.product}
                            </div>
                            <button
                              onClick={() => setScriptLead(lead)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 px-3.5 py-2 rounded-xl transition-all active:scale-95"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Call Script
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeNav === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Clients
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  Your active client portfolio.
                </p>
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    Client management module — connect the clients API to populate.
                  </p>
                </div>
              </motion.div>
            )}

            {activeNav === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Analytics
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                  Conversion and engagement insights.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Conversion Rate', value: '34%', icon: TrendingUp },
                    { label: 'Avg. Response Time', value: '4.2m', icon: Clock },
                    { label: 'Active Clients', value: '128', icon: Home },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                          <Icon className="w-4.5 h-4.5 text-brand-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Weekly Lead Trend
                  </h3>
                  <div className="flex items-end justify-between gap-2 h-40">
                    {[40, 65, 50, 80, 72, 90, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.5, delay: i * 0.08 }}
                          className="w-full bg-gradient-to-t from-brand-200 to-brand-400 rounded-t-md hover:from-brand-300 hover:to-brand-500 transition-colors"
                        />
                        <span className="text-[10px] text-gray-400">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Call Script Modal */}
      <AnimatePresence>
        {scriptLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setScriptLead(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Phone className="w-4.5 h-4.5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Call Script
                    </h3>
                    <p className="text-xs text-gray-400">
                      {scriptLead.customerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setScriptLead(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[60vh] space-y-3">
                {getScript(scriptLead).map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {line.replace('[Name]', scriptLead.customerName)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-50 flex gap-2">
                <button
                  onClick={() => setScriptLead(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Start Call
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
