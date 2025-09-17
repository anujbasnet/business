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
    
    // Check if this is a demo login attempt
    if (email === 'demo@elitebarbershop.com' && password === 'demo123') {
      // Simulate demo user login
      const demoUser = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'demo@elitebarbershop.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { full_name: 'Elite Barber Shop Owner', user_type: 'business' }
      } as User;
      
      const demoSession = {
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: demoUser
      } as Session;
      
      setSession(demoSession);
      setUser(demoUser);
      
      // Set demo user profile
      const demoUserProfile = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'demo@elitebarbershop.com',
        user_type: 'business' as const,
        full_name: 'Elite Barber Shop Owner',
        phone: '(555) 123-4567',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const demoBusinessProfile = {
        id: '660e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        business_name: 'Elite Barber Shop',
        description: 'Elite Barber Shop has been providing premium grooming services since 2010.',
        address: '123 Main Street, Anytown, USA',
        phone: '(555) 123-4567',
        email: 'contact@elitebarbershop.com',
        website: 'https://elitebarbershop.com',
        instagram: 'https://instagram.com/elitebarbershop',
        facebook: 'https://facebook.com/EliteBarberShop',
        telegram: 'https://t.me/elitebarbershop',
        youtube: null,
        tiktok: 'https://tiktok.com/@elitebarbershop',
        twitter: null,
        working_hours: {
          monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          thursday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
          friday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
          saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
          sunday: { isOpen: false, openTime: '', closeTime: '' }
        },
        employees: ['John Smith - Master Barber', 'Mike Johnson - Senior Barber', 'Alex Brown - Barber'],
        cover_photos: [
          'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop',
          'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=400&fit=crop'
        ],
        main_cover_photo: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&h=400&fit=crop',
        bio: 'Elite Barber Shop has been providing premium grooming services since 2010.',
        business_type: 'Barber Shop',
        service_type: 'Hair & Grooming Services',
        is_accepting_bookings: true,
        booking_settings: {
          advanceBookingDays: 30,
          cancellationPolicy: 'Cancellations must be made at least 24 hours in advance.',
          requiresConfirmation: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(demoUserProfile);
      setBusinessProfile(demoBusinessProfile);
      setLoading(false);
      
      return { error: null };
    }
    
    // Regular authentication for non-demo users
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