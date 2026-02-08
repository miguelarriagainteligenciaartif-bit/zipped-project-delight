import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { setCurrentUserId } from '@/lib/storage';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  username: string | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    username: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let username: string | null = null;

        if (user) {
          setCurrentUserId(user.id);
          // Get username from profile (defer to avoid deadlock)
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', user.id)
              .single();
            
            if (profile) {
              setState(prev => ({ ...prev, username: profile.username }));
            }
          }, 0);

          username = user.user_metadata?.username || user.email || null;
        } else {
          setCurrentUserId(null);
        }

        setState({ user, session, username, loading: false });
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      const username = user?.user_metadata?.username || user?.email || null;
      setCurrentUserId(user?.id ?? null);
      setState({ user, session, username, loading: false });

      if (user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setState(prev => ({ ...prev, username: profile.username }));
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username },
      },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, username: null, loading: false });
  }, []);

  return {
    user: state.user,
    session: state.session,
    username: state.username,
    loading: state.loading,
    isAuthenticated: !!state.session,
    signUp,
    signIn,
    signOut,
  };
}
