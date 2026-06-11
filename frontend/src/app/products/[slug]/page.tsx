'use client';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import HeatSlider from '@/components/HeatSlider';
import ReviewSection from '@/components/ReviewSection';
import { useCart } from '@/context/CartContext';
import { FiShoppingCart, FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .single();
      if (error) throw error;
      if (data) {
        setProduct({
          id: data.id,
          sku: data.sku,
          name: data.name,
          nameTeluguScript: data.name_telugu_script || '',
          slug: data.slug,
          category: data.category as 'pickles' | 'sweets' | 'meals',
          dietType: (data.diet_type as 'veg' | 'nonveg') || undefined,
          description: data.description || '',
          ingredients: data.ingredients || [],
          imageUrl: data.image_url || '',
          images: data.images || [],
          actualPrice: Number(data.actual_price),
          sellingPrice: Number(data.selling_price),
          rating: Number(data.rating || 0),
          reviewCount: Number(data.review_count || 0),
          inStock: Boolean(data.in_stock),
          availableLocations: data.available_locations || [],
          heatLevel: Number(data.heat_level || 5),
          featured: Boolean(data.featured),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      } else {
        const local = PRODUCTS.find((p) => p.slug === params.slug);
        if (local) setProduct(local);
        else notFound();
      }
    } catch (err) {
      console.warn('DB error, loading static product details:', err);
      const local = PRODUCTS.find((p) => p.slug === params.slug);
      if (local) setProduct(local);
      else notFound();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="skeleton h-8 w-48 mx-auto rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      sellingPrice: product.sellingPrice,
      quantity: qty,
      sku: product.sku,
    });
    toast.success(`${qty}× ${product.name} added to cart!`);
  };

  const discount = Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100);

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-3xl overflow-hidden shadow-card-hover"
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-clay text-cream font-bold text-sm px-3 py-1.5 rounded-xl shadow">
              {discount}% OFF
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Category + SKU */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-semibold text-ochre bg-ochre/10 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>SKU: {product.sku}</span>
          </div>

          {/* Name */}
          <div>
            <h1 className="font-display font-black text-4xl sm:text-5xl leading-tight" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h1>
            <p className="font-telugu text-2xl text-ochre/80 mt-1">{product.nameTeluguScript}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={16}
                className={i < Math.round(product.rating) ? 'text-ochre' : 'text-gray-600'}
                fill={i < Math.round(product.rating) ? '#E5A93C' : 'none'}
              />
            ))}
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{product.rating}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display font-black text-4xl text-ochre">₹{product.sellingPrice}</span>
            {product.actualPrice > product.sellingPrice && (
              <span className="text-xl line-through" style={{ color: 'var(--text-secondary)' }}>₹{product.actualPrice}</span>
            )}
          </div>

          {/* Heat Slider */}
          <div className="glass rounded-2xl p-4">
            <HeatSlider level={product.heatLevel} category={product.category} readOnly />
          </div>

          {/* Description */}
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {product.description}
          </p>

          {/* Ingredients */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider mb-2 text-ochre">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span
                  key={ing}
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity + CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 glass rounded-xl px-3 py-2">
              <button
                id="product-qty-dec"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-6 text-center font-semibold" style={{ color: 'var(--text-primary)' }}>{qty}</span>
              <button
                id="product-qty-inc"
                onClick={() => setQty(qty + 1)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <FiPlus size={14} />
              </button>
            </div>
            <button
              id="product-add-to-cart-btn"
              onClick={handleAddToCart}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-base py-3.5"
            >
              <FiShoppingCart size={18} /> Add to Cart · ₹{product.sellingPrice * qty}
            </button>
          </div>

          {/* Availability */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
              Delivered to
            </p>
            <div className="flex flex-wrap gap-2">
              {product.availableLocations.map((loc) => (
                <span key={loc} className="text-xs px-2.5 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/40">
                  ✓ {loc}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Review Section */}
      <ReviewSection product={product} onReviewSubmitted={loadProduct} />
    </div>
  );
}
