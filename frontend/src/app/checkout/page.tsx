'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { FiCheckCircle } from 'react-icons/fi';

interface FormData {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const INITIAL: FormData = { name: '', phone: '', email: '', line1: '', line2: '', city: '', state: '', pincode: '' };

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    ...INITIAL,
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in first.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user.uid,
        items,
        total_amount: total,
        status: 'pending',
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        shipping_address: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: 'India',
        },
      });
      if (error) throw error;
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Order failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/cart');
    }
  }, [authLoading, router, user]);

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (success) {
    return (
      <div className="pt-32 max-w-lg mx-auto px-4 text-center pb-24">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <FiCheckCircle className="mx-auto mb-6 text-green-400" size={72} />
        </motion.div>
        <h1 className="font-display font-black text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>Order Placed! 🎉</h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Thank you, {form.name}! Your authentic Telugu flavours are on their way.
        </p>
        <button onClick={() => router.push('/')} className="btn-ochre">Back to Home</button>
      </div>
    );
  }

  const Field = ({ label, id, value, onChange, type = 'text', required = true, placeholder = '' }:
    { label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label} {required && <span className="text-clay">*</span>}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ochre transition-colors bg-transparent"
        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      />
    </div>
  );

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display font-black text-4xl sm:text-5xl mb-10"
        style={{ color: 'var(--text-primary)' }}
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" id="checkout-name" value={form.name} onChange={set('name')} placeholder="Your full name" />
              <Field label="Phone Number" id="checkout-phone" value={form.phone} onChange={set('phone')} type="tel" placeholder="10-digit mobile" />
              <div className="sm:col-span-2">
                <Field label="Email Address" id="checkout-email" value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Shipping Address</h2>
            <div className="space-y-4">
              <Field label="Address Line 1" id="checkout-line1" value={form.line1} onChange={set('line1')} placeholder="House/flat no., street" />
              <Field label="Address Line 2" id="checkout-line2" value={form.line2} onChange={set('line2')} required={false} placeholder="Area, landmark (optional)" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Field label="City" id="checkout-city" value={form.city} onChange={set('city')} placeholder="City" />
                </div>
                <Field label="State" id="checkout-state" value={form.state} onChange={set('state')} placeholder="State" />
                <Field label="Pincode" id="checkout-pincode" value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" />
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Your Order</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="truncate max-w-[160px]" style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                  <span className="font-semibold ml-2" style={{ color: 'var(--text-primary)' }}>₹{item.sellingPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            <hr className="my-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex justify-between font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              <span>Total</span>
              <span className="text-ochre">₹{total}</span>
            </div>
            <button
              id="checkout-place-order-btn"
              type="submit"
              disabled={loading || items.length === 0}
              className="btn-ochre w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
