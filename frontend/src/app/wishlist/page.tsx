'use client';
import { useStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const wishlist = useStore((state) => state.wishlist);

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-ochre font-semibold text-sm uppercase tracking-widest mb-2">Saved Items</p>
        <h1 className="font-display font-black text-5xl sm:text-6xl" style={{ color: 'var(--text-primary)' }}>
          My Wishlist
        </h1>
        <p className="mt-3 text-lg font-telugu" style={{ color: 'var(--text-secondary)' }}>
          మీకు నచ్చిన వస్తువుల జాబితా
        </p>
      </motion.div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 card border border-white/5" style={{ background: 'var(--bg-mid)', color: 'var(--text-secondary)' }}>
          <span className="text-5xl block mb-4">❤️</span>
          <p className="text-lg font-medium mb-6">Your wishlist is empty.</p>
          <Link href="/products" className="btn-ochre inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product, idx) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
