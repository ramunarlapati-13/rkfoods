'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { PRODUCTS, fetchProductsFromDb } from '@/lib/products';
import { Category, DietFilter, Product } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';

function ProductsGrid() {
  const params = useSearchParams();
  const initialCat = (params.get('category') as Category) || 'all';
  const [category, setCategory] = useState<Category>(initialCat);
  const [diet, setDiet] = useState<DietFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(600);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    (async () => {
      const list = await fetchProductsFromDb();
      setProducts(list);
    })();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (diet !== 'all' && p.dietType !== diet) return false;
    if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (p.sellingPrice > maxPrice) return false;
    return true;
  });

  const autocompleteMatches = search.length > 1
    ? products.filter((p) => {
        if (category !== 'all' && p.category !== category) return false;
        return p.name.toLowerCase().includes(search.toLowerCase());
      })
    : [];

  const counts = {
    all: products.length,
    pickles: products.filter((p) => p.category === 'pickles').length,
    sweets: products.filter((p) => p.category === 'sweets').length,
    meals: 0,
  };

  return (
    <div>
      {/* Search and Price Filter row */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-end justify-between">
        {/* Search Input with Autocomplete */}
        <div className="relative w-full sm:w-96">
          <label htmlFor="products-search-input" className="sr-only">Search products</label>
          <div className="flex items-center gap-2 border rounded-2xl px-4 py-2.5 focus-within:border-ochre transition-colors w-full bg-transparent"
            style={{ borderColor: 'var(--border)' }}
          >
            <FiSearch className="text-ochre" size={18} />
            <input
              id="products-search-input"
              type="search"
              placeholder="Search pickles, sweets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showAutocomplete && autocompleteMatches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-2 glass rounded-2xl shadow-card-hover z-20 max-h-60 overflow-y-auto border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-mid)' }}
              >
                {autocompleteMatches.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ochre">{p.sku}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col gap-1.5 w-full sm:w-64">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            <span>Max Price</span>
            <span className="text-ochre font-bold">₹{maxPrice}</span>
          </div>
          <input
            id="price-range-filter"
            type="range"
            min={150}
            max={600}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ochre"
          />
        </div>
      </div>

      <CategoryFilter
        activeCategory={category}
        dietFilter={diet}
        onCategoryChange={setCategory}
        onDietChange={setDiet}
        counts={counts}
      />

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 card border border-white/5" style={{ background: 'var(--bg-mid)', color: 'var(--text-secondary)' }}>
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-lg font-medium">No products match your filters.</p>
            <button
              onClick={() => {
                setSearch('');
                setDiet('all');
                setCategory('all');
                setMaxPrice(600);
              }}
              className="mt-4 btn-ghost text-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-ochre font-semibold text-sm uppercase tracking-widest mb-2">Our Catalog</p>
        <h1 className="font-display font-black text-5xl sm:text-6xl" style={{ color: 'var(--text-primary)' }}>
          All Products
        </h1>
        <p className="mt-3 text-lg max-w-lg" style={{ color: 'var(--text-secondary)' }}>
          Authentic Telugu flavours, packed with tradition. Choose your favourites.
        </p>
      </motion.div>
      <Suspense fallback={<div className="skeleton h-8 w-48 rounded-xl" />}>
        <ProductsGrid />
      </Suspense>
    </div>
  );
}
