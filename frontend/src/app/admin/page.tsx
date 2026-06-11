'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPackage, FiShoppingBag, FiUsers, FiMapPin, FiUpload, FiLogOut } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminLocations from './components/AdminLocations';
import AdminImport from './components/AdminImport';
import toast from 'react-hot-toast';

type AdminTab = 'products' | 'orders' | 'locations' | 'import';

const TABS = [
  { id: 'products' as AdminTab, label: 'Products', icon: FiPackage },
  { id: 'orders' as AdminTab, label: 'Orders', icon: FiShoppingBag },
  { id: 'locations' as AdminTab, label: 'Locations', icon: FiMapPin },
  { id: 'import' as AdminTab, label: 'Import', icon: FiUpload },
];

// Simple admin check — in production use Firebase custom claims
const ADMIN_EMAILS = ['admin@rrrfoods.in', 'ramu@rexplore.tech'];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('products');

  if (loading) {
    return <div className="pt-32 text-center"><div className="skeleton h-8 w-48 mx-auto rounded-xl" /></div>;
  }
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="pt-32 max-w-md mx-auto px-4 text-center">
        <h1 className="font-display font-bold text-3xl mb-4" style={{ color: 'var(--text-primary)' }}>Access Denied</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>You don't have admin privileges.</p>
        <button onClick={() => router.push('/')} className="btn-primary">Go Home</button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <div className="pt-20 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r p-4 sticky top-20 h-[calc(100vh-80px)] flex flex-col"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-mid)' }}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-ochre">Admin Panel</p>
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`admin-tab-${id}`}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-clay text-cream shadow-glow-clay'
                  : 'hover:bg-white/5'
              }`}
              style={{ color: tab === id ? undefined : 'var(--text-secondary)' }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-clay hover:text-clay-dark transition-colors mt-4"
        >
          <FiLogOut size={14} /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'products' && <AdminProducts />}
          {tab === 'orders' && <AdminOrders />}
          {tab === 'locations' && <AdminLocations />}
          {tab === 'import' && <AdminImport />}
        </motion.div>
      </main>
    </div>
  );
}
