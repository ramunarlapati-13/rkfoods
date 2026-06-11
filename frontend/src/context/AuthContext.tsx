'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchAndSetUser = async (sbUser: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      if (profile && !error) {
        setUser({
          uid: sbUser.id,
          displayName: profile.display_name || sbUser.user_metadata?.full_name || sbUser.email || '',
          email: sbUser.email || '',
          phoneNumber: profile.phone_number || sbUser.phone || undefined,
          photoURL: profile.photo_url || sbUser.user_metadata?.avatar_url || undefined,
          role: (profile.role as 'customer' | 'admin') || 'customer',
          createdAt: new Date(profile.created_at || sbUser.created_at),
        });
      } else {
        // Fallback if profile row is not yet created by the DB trigger, or on DB query error
        const email = sbUser.email || '';
        const role = (email === 'admin@rrrfoods.in' || email === 'ramu@rexplore.tech') ? 'admin' : 'customer';
        setUser({
          uid: sbUser.id,
          displayName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email || '',
          email,
          phoneNumber: sbUser.phone || undefined,
          photoURL: sbUser.user_metadata?.avatar_url || undefined,
          role,
          createdAt: new Date(sbUser.created_at),
        });
      }
    } catch (err) {
      console.error('Error fetching user profile from profiles table:', err);
      const email = sbUser.email || '';
      const role = (email === 'admin@rrrfoods.in' || email === 'ramu@rexplore.tech') ? 'admin' : 'customer';
      setUser({
        uid: sbUser.id,
        displayName: sbUser.user_metadata?.full_name || email || '',
        email,
        phoneNumber: sbUser.phone || undefined,
        photoURL: sbUser.user_metadata?.avatar_url || undefined,
        role,
        createdAt: new Date(sbUser.created_at),
      });
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchAndSetUser(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
