import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session as AuthSession } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextValue {
  /** Hydration finished — routing decisions are safe. */
  ready: boolean;
  /** Signed into Supabase, or chose to use the app locally. */
  authenticated: boolean;
  /** Signed-in Supabase user id (null in guest mode). */
  userId: string | null;
  email: string | null;
  isGuest: boolean;
  cloudAvailable: boolean;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const GUEST_KEY = 'triggr.guestMode';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const guest = (await AsyncStorage.getItem(GUEST_KEY)) === 'true';
      setIsGuest(guest);
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
          setSession(next);
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      }
      setReady(true);
    }

    void init();
    return () => unsubscribe?.();
  }, []);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    void AsyncStorage.setItem(GUEST_KEY, 'true');
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Cloud sync is not configured yet.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Cloud sync is not configured yet.';
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? error.message : null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return 'Cloud sync is not configured yet.';
    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setIsGuest(false);
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated: Boolean(session) || isGuest,
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      isGuest: isGuest && !session,
      cloudAvailable: isSupabaseConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      continueAsGuest,
      signOut,
    }),
    [
      ready,
      session,
      isGuest,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      continueAsGuest,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
