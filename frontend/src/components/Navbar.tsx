'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/lib/store';
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiHeart } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Pickles', href: '/products?category=pickles' },
  { label: 'Sweets', href: '/products?category=sweets' },
  { label: 'Heritage Box', href: '/sampler' },
  { label: 'B2B Portal', href: '/b2b' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const wishlistCount = useStore((state) => state.wishlist.length);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    setUserMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-card py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-clay-gradient flex items-center justify-center shadow-glow-clay group-hover:scale-110 transition-transform duration-200">
              <span className="text-cream font-display font-black text-lg leading-none">R</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                RRR Foods
              </p>
              <p className="text-xs font-telugu" style={{ color: 'var(--text-secondary)' }}>
                ఆర్ఆర్ఆర్ ఫుడ్స్
              </p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors duration-150 hover:text-ochre"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              id="nav-wishlist-btn"
              className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors"
              title="Wishlist"
            >
              <FiHeart size={20} style={{ color: 'var(--text-primary)' }} />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-clay text-cream text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              id="nav-cart-btn"
              className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <FiShoppingCart size={20} style={{ color: 'var(--text-primary)' }} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-clay text-cream text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  id="nav-user-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full" />
                  ) : (
                    <FiUser size={20} style={{ color: 'var(--text-primary)' }} />
                  )}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute right-0 mt-2 w-48 glass rounded-xl py-1 shadow-card-hover"
                    >
                      <p className="px-4 py-2 text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                        {user.displayName || user.email}
                      </p>
                      <hr style={{ borderColor: 'var(--border)' }} />
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:text-ochre transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-clay hover:text-clay-dark transition-colors"
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => setAuthOpen(true)}
                className="btn-primary text-sm py-2 px-4"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              id="nav-mobile-menu-btn"
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass border-t mt-2 px-4 pb-4"
              style={{ borderColor: 'var(--border)' }}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm font-medium border-b hover:text-ochre transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
