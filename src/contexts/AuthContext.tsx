import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'moderator' | 'user' | 'hotel_owner' | 'restaurant_owner' | 'super_admin' | 'photographer';

const SUPER_ADMIN_EMAIL = 'helloyeasin00@gmail.com';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isHotelOwner: boolean;
  isPhotographer: boolean;
  isRestaurantOwner: boolean;
  userRoles: AppRole[];
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isHotelOwner, setIsHotelOwner] = useState(false);
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);
  const [isPhotographer, setIsPhotographer] = useState(false);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);

  const checkUserRoles = async (userId: string, userEmail: string | undefined) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking user roles:', error);
        return;
      }
      
      const roles = data?.map(r => r.role as AppRole) || [];
      setUserRoles(roles);
      
      // Check if user is super admin by email
      const superAdmin = userEmail === SUPER_ADMIN_EMAIL;
      setIsSuperAdmin(superAdmin);
      
      // Super admin is also considered admin
      setIsAdmin(roles.includes('admin') || superAdmin);
      setIsHotelOwner(roles.includes('hotel_owner'));
      setIsRestaurantOwner(roles.includes('restaurant_owner'));
      setIsPhotographer(roles.includes('photographer'));
    } catch (error) {
      console.error('Error checking user roles:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setIsHotelOwner(false);
      setIsRestaurantOwner(false);
      setIsPhotographer(false);
      setUserRoles([]);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid race conditions
          setTimeout(() => {
            checkUserRoles(session.user.id, session.user.email);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setIsHotelOwner(false);
          setIsRestaurantOwner(false);
          setIsPhotographer(false);
          setUserRoles([]);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRoles(session.user.id, session.user.email);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setIsHotelOwner(false);
    setIsRestaurantOwner(false);
    setIsPhotographer(false);
    setUserRoles([]);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAdmin,
      isSuperAdmin, 
      isHotelOwner, 
      isPhotographer,
      isRestaurantOwner, 
      userRoles,
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
