'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroVideo from '@/components/HeroVideo';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import Link from 'next/link';
import { PRODUCTS, fetchProductsFromDb } from '@/lib/products';
import { Category, DietFilter, Product } from '@/lib/types';
import { FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  const [category, setCategory] = useState<Category>('all');
  const [diet, setDiet] = useState<DietFilter>('all');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    (async () => {
      const list = await fetchProductsFromDb();
      setProducts(list);
    })();
  }, []);

  const filtered = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (diet !== 'all' && p.dietType !== diet) return false;
    return true;
  });

  const featured = products.filter((p) => p.featured);

  const counts = {
    all: products.length,
    pickles: products.filter((p) => p.category === 'pickles').length,
    sweets: products.filter((p) => p.category === 'sweets').length,
    meals: 0,
  };

  return (
    <>
      {/* Hero */}
      <HeroVideo />

      {/* Trust bar */}
      <section className="py-6 border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-mid)' }}>
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {[
            { icon: '🫙', label: 'Authentic Recipes' },
            { icon: '🚚', label: 'Pan-India Delivery' },
            { icon: '🌿', label: '100% Natural Ingredients' },
            { icon: '⭐', label: '4.8 Avg. Rating' },
            { icon: '🔒', label: 'Secure Checkout' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2">
              <span className="text-lg">{t.icon}</span>
              <span className="font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-ochre font-semibold text-sm uppercase tracking-widest mb-2">Our Bestsellers</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Featured Picks
            </h2>
          </div>
          <Link href="/products" className="btn-ghost hidden sm:flex items-center gap-2 text-sm">
            View All <FiArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="btn-ghost text-sm inline-flex items-center gap-2">
            View All Products <FiArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Heritage box CTA banner */}
      <section className="relative overflow-hidden py-20 mx-4 sm:mx-8 rounded-3xl mb-16"
        style={{ background: 'linear-gradient(135deg, #6B1B14 0%, #3A1A00 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #E5A93C 0%, transparent 60%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 text-center px-4 max-w-2xl mx-auto"
        >
          <div className="text-6xl mb-6 animate-float">🎁</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-cream mb-4">
            Build Your Heritage Box
          </h2>
          <p className="text-cream/70 mb-8 text-lg">
            Curate a custom gift box with your favourite pickles and sweets.
            Perfect for gifting — mix and match 3–4 products and we'll pack them beautifully.
          </p>
          <Link id="home-heritage-cta" href="/sampler" className="btn-ochre text-base px-8 py-4 inline-block">
            Start Building →
          </Link>
        </motion.div>
      </section>

      {/* Full catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" id="catalog">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="text-ochre font-semibold text-sm uppercase tracking-widest mb-2">Complete Catalog</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6" style={{ color: 'var(--text-primary)' }}>
            All Products
          </h2>
          <CategoryFilter
            activeCategory={category}
            dietFilter={diet}
            onCategoryChange={setCategory}
            onDietChange={setDiet}
            counts={counts}
          />
        </motion.div>

        {filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-5xl">🫙</span>
            <p className="mt-4 text-lg font-medium">No products found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
