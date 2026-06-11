'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart();
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const inWishlist = useStore((state) => state.inWishlist);
  const isWishlisted = inWishlist(product.id);

  const discount = Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      sellingPrice: product.sellingPrice,
      quantity: 1,
      sku: product.sku,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isWishlisted) {
      toast.success(`${product.name} saved to wishlist! ❤️`);
    } else {
      toast.success(`${product.name} removed from wishlist.`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
    >
      <Link
        href={`/products/${product.slug}`}
        id={`product-card-${product.id}`}
        className="group block card overflow-hidden hover:-translate-y-1 transition-all duration-300 relative"
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-card-gradient opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {discount > 0 && (
              <span className="bg-clay text-cream text-xs font-bold px-2 py-1 rounded-lg">
                {discount}% OFF
              </span>
            )}
            {product.featured && (
              <span className="bg-ochre text-slate-900 text-xs font-bold px-2 py-1 rounded-lg">
                ★ Featured
              </span>
            )}
          </div>

          {/* Category / diet badge & wishlist */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {product.dietType && (
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  product.dietType === 'veg'
                    ? 'bg-green-600/80 text-white'
                    : 'bg-red-700/80 text-white'
                }`}
              >
                {product.dietType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
              </span>
            )}
            <button
              id={`wishlist-toggle-${product.id}`}
              onClick={handleWishlistToggle}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
              aria-label="Toggle Wishlist"
            >
              <FiHeart
                size={16}
                className={isWishlisted ? 'text-clay fill-clay' : 'text-white'}
              />
            </button>
          </div>

          {/* Telugu name on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="font-telugu text-ochre text-xl font-semibold">{product.nameTeluguScript}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-xs mb-1 uppercase tracking-wider font-medium" style={{ color: 'var(--text-secondary)' }}>
            {product.sku}
          </p>
          <h3 className="font-display font-bold text-base mb-1 group-hover:text-ochre transition-colors line-clamp-1" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h3>
          <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
            {product.description}
          </p>

          {/* Heat / sweetness indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="heat-track h-1.5 flex-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/50 rounded-full"
                style={{ width: `${(1 - product.heatLevel / 10) * 100}%`, marginLeft: 'auto' }}
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {product.category === 'pickles' ? '🌶️' : '🍬'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <FiStar className="text-ochre" size={13} fill="#E5A93C" />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {product.rating}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              ({product.reviewCount})
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                ₹{product.sellingPrice}
              </span>
              {product.actualPrice > product.sellingPrice && (
                <span className="text-sm line-through ml-2" style={{ color: 'var(--text-secondary)' }}>
                  ₹{product.actualPrice}
                </span>
              )}
            </div>
            <motion.button
              id={`add-to-cart-${product.id}`}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="flex items-center gap-2 btn-primary text-sm py-2 px-3"
            >
              <FiShoppingCart size={14} />
              Add
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
