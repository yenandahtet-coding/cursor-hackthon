import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, LayoutDashboard } from 'lucide-react';
import type { ViewMode } from '@/types';
import CustomerApp from '@/components/CustomerApp';
import RMDashboard from '@/components/RMDashboard';

export default function App() {
  const [view, setView] = useState<ViewMode>('customer');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* View Toggle */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white rounded-full shadow-card border border-gray-100 p-1 flex items-center gap-1">
          <button
            onClick={() => setView('customer')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === 'customer'
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view === 'customer' && (
              <motion.div
                layoutId="toggle-bg"
                className="absolute inset-0 bg-brand-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Smartphone className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Customer App</span>
          </button>
          <button
            onClick={() => setView('rm')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              view === 'rm' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view === 'rm' && (
              <motion.div
                layoutId="toggle-bg"
                className="absolute inset-0 bg-brand-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <LayoutDashboard className="w-4 h-4 relative z-10" />
            <span className="relative z-10">RM Dashboard</span>
          </button>
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={view === 'customer' ? 'pt-16' : ''}
        >
          {view === 'customer' ? <CustomerApp /> : <RMDashboard />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
