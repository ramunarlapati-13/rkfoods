import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from './types';

interface B2bSession {
  projectId: string;
  status: 'Pending' | 'Active';
  signedName?: string;
}

interface AppState {
  // Cart
  cart: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  addCartItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  inWishlist: (productId: string) => boolean;

  // B2B Portal
  b2bSession: B2bSession | null;
  setB2bSession: (session: B2bSession | null) => void;
  acceptB2bAgreement: (signedName: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart implementation
      cart: [],
      addItem: (product: Product, quantity = 1) => {
        const cart = get().cart;
        const exists = cart.find((item) => item.productId === product.id);
        if (exists) {
          set({
            cart: cart.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                productId: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                sellingPrice: product.sellingPrice,
                quantity: quantity,
                sku: product.sku,
              },
            ],
          });
        }
      },
      addCartItem: (item: CartItem) => {
        const cart = get().cart;
        const exists = cart.find((i) => i.productId === item.productId);
        if (exists) {
          set({
            cart: cart.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeItem: (productId: string) => {
        set({ cart: get().cart.filter((item) => item.productId !== productId) });
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
      },
      cartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Wishlist implementation
      wishlist: [],
      toggleWishlist: (product: Product) => {
        const wishlist = get().wishlist;
        const exists = wishlist.some((item) => item.id === product.id);
        if (exists) {
          set({ wishlist: wishlist.filter((item) => item.id !== product.id) });
        } else {
          set({ wishlist: [...wishlist, product] });
        }
      },
      inWishlist: (productId: string) => {
        return get().wishlist.some((item) => item.id === productId);
      },

      // B2B implementation
      b2bSession: null,
      setB2bSession: (session) => set({ b2bSession: session }),
      acceptB2bAgreement: async (signedName) => {
        const session = get().b2bSession;
        if (session) {
          try {
            const { supabase } = await import('./supabase');
            await supabase
              .from('b2b_sessions')
              .update({ status: 'Active', signed_name: signedName, updated_at: new Date() })
              .eq('project_id', session.projectId);
          } catch (err) {
            console.error('Error syncing B2B agreement to Supabase:', err);
          }
          set({
            b2bSession: {
              ...session,
              status: 'Active',
              signedName,
            },
          });
        }
      },
    }),
    {
      name: 'rrrfoods-store',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        b2bSession: state.b2bSession,
      }),
    }
  )
);
