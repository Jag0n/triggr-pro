import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/providers/auth';
import { deleteRemoteSession, pullRemote, pushProfile, pushSession } from '@/lib/sync';
import type { Profile, Session } from '@/types/models';

interface AppState {
  profile: Profile | null;
  sessions: Session[];
}

interface AppStateContextValue extends AppState {
  hydrated: boolean;
  setProfile: (profile: Profile) => void;
  addSession: (session: Session) => void;
  updateSessionNote: (id: string, note: string) => void;
  deleteSession: (id: string) => void;
  clearAllData: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);
const STORAGE_KEY = 'triggr.appState.v1';

const EMPTY: AppState = { profile: null, sessions: [] };

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [state, setState] = useState<AppState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const pulledFor = useRef<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState(JSON.parse(raw) as AppState);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // On sign-in, merge cloud data into local (local wins on id collisions).
  useEffect(() => {
    if (!hydrated || !userId || pulledFor.current === userId) return;
    pulledFor.current = userId;
    void pullRemote(userId).then(({ sessions: remote, profile: remoteProfile }) => {
      setState((prev) => {
        const localIds = new Set(prev.sessions.map((s) => s.id));
        const merged = [...prev.sessions, ...remote.filter((s) => !localIds.has(s.id))];
        merged.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
        return {
          profile: prev.profile ?? remoteProfile,
          sessions: merged,
        };
      });
    });
  }, [hydrated, userId]);

  const setProfile = useCallback(
    (profile: Profile) => {
      setState((prev) => ({ ...prev, profile }));
      if (userId) void pushProfile(userId, profile);
    },
    [userId],
  );

  const addSession = useCallback(
    (session: Session) => {
      setState((prev) => ({
        ...prev,
        sessions: [session, ...prev.sessions].sort((a, b) =>
          b.startedAt.localeCompare(a.startedAt),
        ),
      }));
      if (userId) void pushSession(userId, session);
    },
    [userId],
  );

  const updateSessionNote = useCallback(
    (id: string, note: string) => {
      setState((prev) => {
        const sessions = prev.sessions.map((s) => (s.id === id ? { ...s, note } : s));
        const updated = sessions.find((s) => s.id === id);
        if (userId && updated) void pushSession(userId, updated);
        return { ...prev, sessions };
      });
    },
    [userId],
  );

  const deleteSession = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, sessions: prev.sessions.filter((s) => s.id !== id) }));
      if (userId) void deleteRemoteSession(id);
    },
    [userId],
  );

  const clearAllData = useCallback(() => {
    setState(EMPTY);
    pulledFor.current = null;
    void AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      setProfile,
      addSession,
      updateSessionNote,
      deleteSession,
      clearAllData,
    }),
    [state, hydrated, setProfile, addSession, updateSessionNote, deleteSession, clearAllData],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
