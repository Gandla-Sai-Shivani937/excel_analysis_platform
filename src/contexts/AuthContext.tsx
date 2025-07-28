import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || 
          import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY || 
          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key')) {
        console.warn('Supabase is not configured. Using basic user data from auth.');
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || '',
          role: 'user',
          created_at: authUser.created_at || new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // If users table doesn't exist, create a basic user object from auth data
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('Users table does not exist. Using basic user data from auth.');
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || '',
            role: 'user',
            created_at: authUser.created_at || new Date().toISOString(),
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.warn('Error fetching user profile, using auth data:', error);
      // Fallback to basic user data from auth
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || '',
        role: 'user',
        created_at: authUser.created_at || new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || 
        import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY || 
        import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key')) {
      throw new Error('Supabase is not configured. Please set up your Supabase project credentials.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || 
        import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY || 
        import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key')) {
      throw new Error('Supabase is not configured. Please set up your Supabase project credentials.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;

    // Create user profile
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: 'user',
            },
          ]);
        if (profileError && !profileError.message.includes('does not exist')) {
          throw profileError;
        }
      } catch (profileError) {
        console.warn('Could not create user profile in users table:', profileError);
        // Continue without throwing error - user can still use the app with basic auth data
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};