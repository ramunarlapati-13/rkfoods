'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FiX, FiSmartphone, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'choose' | 'phone-input' | 'otp';

export default function AuthModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast.success('Opening Google sign-in... 🎉');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      toast.error(message || 'Google sign-in failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      setStep('otp');
      toast.success(`OTP sent to ${formattedPhone}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP.';
      toast.error(message || 'Failed to send OTP. Check the number and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error('Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      toast.success('Phone verified! Welcome 🎉');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP.';
      toast.error(message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('choose');
    setPhone('');
    setOtp('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose(); } }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-sm glass rounded-3xl p-8 relative"
            style={{ background: 'var(--bg-mid)' }}
          >
            {/* Close */}
            <button
              id="auth-modal-close"
              onClick={() => { reset(); onClose(); }}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <FiX size={18} style={{ color: 'var(--text-secondary)' }} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-clay-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-clay">
                <span className="text-cream font-display font-black text-3xl">R</span>
              </div>
              <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                {step === 'choose' ? 'Welcome Back' : step === 'phone-input' ? 'Enter Phone' : 'Verify OTP'}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {step === 'choose'
                  ? 'Sign in to order authentic Telugu flavours'
                  : step === 'phone-input'
                  ? 'We\'ll send you a one-time code'
                  : `Code sent to +91 ${phone}`}
              </p>
            </div>

            {/* Step: Choose method */}
            {step === 'choose' && (
              <div className="space-y-3">
                <button
                  id="auth-google-btn"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <FcGoogle size={22} />
                  Continue with Google
                </button>
                <button
                  id="auth-phone-btn"
                  onClick={() => setStep('phone-input')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-clay hover:bg-clay-dark text-cream font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <FiSmartphone size={18} />
                  Continue with Phone
                </button>
                <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
                  By continuing, you agree to our Terms of Service & Privacy Policy
                </p>
              </div>
            )}

            {/* Step: Phone input */}
            {step === 'phone-input' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border rounded-2xl px-4 py-3 focus-within:border-ochre transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>+91</span>
                  <input
                    id="auth-phone-input"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                <button
                  id="auth-send-otp-btn"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 10}
                  className="w-full flex items-center justify-center gap-2 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send OTP'} <FiArrowRight size={16} />
                </button>
                <button onClick={() => setStep('choose')} className="w-full text-sm text-center hover:text-ochre transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  ← Back
                </button>
              </div>
            )}

            {/* Step: OTP verify */}
            {step === 'otp' && (
              <div className="space-y-4">
                <input
                  id="auth-otp-input"
                  type="number"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full border rounded-2xl px-4 py-3 text-center text-xl tracking-[0.4em] font-display font-bold outline-none focus:border-ochre transition-colors bg-transparent"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  id="auth-verify-otp-btn"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
                <button onClick={() => setStep('phone-input')} className="w-full text-sm text-center hover:text-ochre transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  ← Resend OTP
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
