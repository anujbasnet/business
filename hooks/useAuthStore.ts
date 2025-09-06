import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { supabase, signIn, signUp, signOut, getCurrentSession, Database } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type UserProfile = Database['public']['Tables']['users']['Row'];
type BusinessProfile = Database['public']['Tables']['businesses']['Row'];

interface AuthState {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  businessProfile: BusinessProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { full_name: string; user_type: 'customer' | 'business' }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      setUserProfile(profile);

      if (profile?.user_type === 'business') {
        const { data: business } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        setBusinessProfile(business);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    getCurrentSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setBusinessProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
    }
    return { error };
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string, userData: { full_name: string; user_type: 'customer' | 'business' }) => {
    setLoading(true);
    const { error } = await signUp(email, password, userData);
    if (error) {
      setLoading(false);
    }
    return { error };
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const { error } = await signOut();
    setLoading(false);
    return { error };
  }, []);

  return useMemo(() => ({
    user,
    session,
    userProfile,
    businessProfile,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshProfile,
  }), [user, session, userProfile, businessProfile, loading, handleSignIn, handleSignUp, handleSignOut, refreshProfile]);
});