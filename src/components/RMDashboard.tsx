import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  Home,
  LogOut,
  Heart,
  Sparkles,
} from 'lucide-react';
import type { Lead, Client } from '@/types';
import { logout, getCurrentUser } from '@/auth';
import { fetchLeads, fetchClients } from '@/api';

type NavItem = 'leads' | 'clients' | 'analytics';

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof Zap }[] = [
  { id: 'leads', label: 'AI Leads', icon: Zap },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const INTENT_STYLES: Record<Lead['intent'], { label: string; bg: string; text: string; dot: string }> = {
  high: { label: 'High Intent', bg: 'bg-brand-50', text: 'text-brand-600', dot: 'bg-brand-500' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

function getCallScript(lead: Lead): string[] {
  if (lead.insight.toLowerCase().includes('education') || lead.insight.toLowerCase().includes('preschool')) {
    return [
      'Greeting: Mingalabar, [Name]. This is [RM Name] from Dai-ichi Life. How are you today?',
      "Reference: I see you've been asking about education savings for your child through our Kizuna AI app.",
      'Probe: Could you share which school level you\'re planning for — preschool, primary, or university?',
      'Recommend: Our Education Secure Plan offers guaranteed payouts aligned with school milestones. With your current savings rate, you could reach 18.95M MMK in 10 years.',
      'Close: Shall I send you a personalized illustration via the app? Would this week work for a 15-minute consultation?',
    ];
  }
  return [
    'Greeting: Mingalabar, [Name]. This is [RM Name] from Dai-ichi Life. How are you today?',
    "Reference: I noticed you've been exploring family protection options through our Kizuna AI app.",
    "Probe: May I ask, what's most important to you right now — your children's education, health coverage, or long-term savings?",
    'Recommend: Based on your interest, I\'d recommend our Family Secure Plan with an education rider.',
    'Close: Would you be available this week for a 15-minute detailed consultation?',
  ];
}

export default function RMDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeNav, setActiveNav] = useState<NavItem>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [scriptLead, setScriptLead] = useState<Lead | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadLeads = async () => {
      try {
        const data = await fetchLeads();
        if (!cancelled) setLeads(data);
      } catch (err) {
        console.error('Failed to load leads from MongoDB:', err);
        if (!cancelled) setLeads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadClients = async () => {
      try {
        const data = await fetchClients();
        if (!cancelled) setClients(data);
      } catch (err) {
        console.error('Failed to load clients from MongoDB:', err);
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setClientsLoading(false);
      }
    };

    void loadLeads();
    void loadClients();
    const interval = window.setInterval(() => {
      void loadLeads();
      void loadClients();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const highIntentCount = leads.filter((l) => l.intent === 'high').length;

  const weeklyLeadTrend = (() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Monday-based week start
    const day = startOfToday.getDay(); // 0 Sun .. 6 Sat
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(startOfToday);
    weekStart.setDate(startOfToday.getDate() + mondayOffset);

    for (const lead of leads) {
      const ts = lead.timestamp ?? Date.now();
      const d = new Date(ts);
      if (Number.isNaN(d.getTime()) || d < weekStart) continue;
      const idx = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
      counts[idx] += 1;
    }

    const max = Math.max(...counts, 1);
    return labels.map((label, i) => ({
      label,
      count: counts[i],
      percent: Math.round((counts[i] / max) * 100),
    }));
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex-col fixed h-full z-30 hidden md:flex">
        <div className="px-5 py-6 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
              <Heart className="w-4 h-4 text-white" fill="white" />
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
                  active ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-500' : ''}`} />
                {item.label}
                {item.id === 'leads' && leads.length > 0 && (
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {leads.length}
                  </span>
                )}
                {item.id === 'clients' && clients.length > 0 && (
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {clients.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
              {(user?.name ?? 'R').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name ?? 'RM Theingi'}</p>
              <p className="text-[10px] text-gray-400 truncate">Senior Advisor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-sm font-bold text-gray-900">RM Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeNav}
            onChange={(e) => setActiveNav(e.target.value as NavItem)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            {NAV_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <button onClick={handleLogout} className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-brand-500" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 mt-14 md:mt-0">
        {/* Desktop top header */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {activeNav === 'leads' ? 'AI Lead Alerts' : activeNav === 'clients' ? 'Clients' : 'Analytics'}
            </h1>
            <p className="text-xs text-gray-400">
              {activeNav === 'leads'
                ? 'High-intent customers identified by Kizuna AI'
                : activeNav === 'clients'
                ? 'Your active client portfolio'
                : 'Conversion and engagement insights'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl border border-brand-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

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
                {/* Mobile heading */}
                <div className="md:hidden flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  <h2 className="text-xl font-bold text-gray-900">AI Lead Alerts</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6 md:hidden">
                  High-intent customers identified by Kizuna AI
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
                    <p className="text-[11px] text-gray-400 font-medium mb-1">Total Leads</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{loading ? '—' : leads.length}</p>
                  </div>
                  <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
                    <p className="text-[11px] text-brand-400 font-medium mb-1">High Intent</p>
                    <p className="text-xl md:text-2xl font-bold text-brand-600">{loading ? '—' : highIntentCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
                    <p className="text-[11px] text-gray-400 font-medium mb-1">Response Rate</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">72%</p>
                  </div>
                </div>

                {/* Leads */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-sm text-gray-400">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-1">No leads yet.</p>
                    <p className="text-xs text-gray-400">
                      Leads will appear here when customers discuss insurance topics in the chat.
                    </p>
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
                                <h3 className="text-sm font-semibold text-gray-900">{lead.customerName}</h3>
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {lead.lastActive}
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${intent.bg} ${intent.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${intent.dot} ${lead.intent === 'high' ? 'animate-pulse-soft' : ''}`} />
                              {intent.label}
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Zap className="w-3.5 h-3.5 text-brand-500" />
                              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">AI Insight</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{lead.insight}</p>
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
                              Generate Call Script
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
                <h2 className="text-xl font-bold text-gray-900 mb-1 md:hidden">Clients</h2>
                <p className="text-sm text-gray-500 mb-6 md:hidden">Your active client portfolio</p>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
                    <p className="text-[11px] text-gray-400 font-medium mb-1">Total Clients</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {clientsLoading ? '—' : clients.length}
                    </p>
                  </div>
                  <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
                    <p className="text-[11px] text-brand-400 font-medium mb-1">With AI Leads</p>
                    <p className="text-xl md:text-2xl font-bold text-brand-600">
                      {clientsLoading ? '—' : clients.filter((c) => c.leadCount > 0).length}
                    </p>
                  </div>
                </div>

                {clientsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-sm text-gray-400">Loading clients...</p>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-1">No clients yet.</p>
                    <p className="text-xs text-gray-400">
                      Customers who sign up or generate AI leads will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {clients.map((client, i) => {
                      const intent = client.intent ? INTENT_STYLES[client.intent] : null;
                      return (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:border-brand-100 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-600 font-bold text-base">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">{client.name}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {client.email ?? 'No email on file'}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                              {client.source === 'registered' ? 'Registered' : 'From Lead'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                            {client.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {client.phone}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {client.lastActive}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-brand-500" />
                              {client.leadCount} lead{client.leadCount === 1 ? '' : 's'}
                            </span>
                          </div>

                          {client.latestInsight ? (
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                  Latest insight
                                </span>
                                {intent && (
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${intent.bg} ${intent.text}`}>
                                    {intent.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{client.latestInsight}</p>
                              {client.product && (
                                <p className="text-xs text-gray-400 mt-2 inline-flex items-center gap-1">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  {client.product}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                              No AI leads yet — waiting for chat activity.
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
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
                <h2 className="text-xl font-bold text-gray-900 mb-1 md:hidden">Analytics</h2>
                <p className="text-sm text-gray-500 mb-6 md:hidden">Conversion and engagement insights</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Conversion Rate', value: '34%', icon: TrendingUp },
                    { label: 'Avg. Response Time', value: '4.2m', icon: Clock },
                    { label: 'Active Clients', value: String(clients.length || 0), icon: Home },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                          <Icon className="w-4 h-4 text-brand-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Lead Trend</h3>
                  <div className="flex items-end justify-between gap-2 h-44">
                    {weeklyLeadTrend.map((day, i) => (
                      <div key={day.label} className="flex-1 h-full flex flex-col items-center gap-2 min-w-0">
                        <div className="w-full flex-1 flex items-end justify-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(day.percent, day.count > 0 ? 12 : 4)}%` }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="w-full max-w-[36px] bg-gradient-to-t from-brand-200 to-brand-400 rounded-t-md hover:from-brand-300 hover:to-brand-500 transition-colors"
                            title={`${day.count} lead${day.count === 1 ? '' : 's'}`}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">{day.label}</span>
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
                    <Phone className="w-4 h-4 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Call Script</h3>
                    <p className="text-xs text-gray-400">{scriptLead.customerName}</p>
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
                {getCallScript(scriptLead).map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {line.replace('[Name]', scriptLead.customerName).replace('[RM Name]', user?.name ?? 'Your Advisor')}
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
