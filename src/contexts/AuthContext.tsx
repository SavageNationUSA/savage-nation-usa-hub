import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, hasSupabase } from "@/lib/supabaseClient";

export type AuthContextType = {
  enabled: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!hasSupabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data } = await supabase!.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    init();

    const { data: sub } = supabase!.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = useMemo(() => {
    const roles = (user?.app_metadata as { roles?: string[] } | undefined)?.roles;
    const metaRole = (user?.user_metadata as { role?: string } | undefined)?.role;
    return roles?.includes("admin") || metaRole === "admin" || false;
  }, [user]);

  const value: AuthContextType = {
    enabled: hasSupabase,
    loading,
    session,
    user,
    isAdmin,
    signIn: async (email, password) => {
      if (!hasSupabase) return { error: "Supabase not connected" };
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    signUp: async (email, password) => {
      if (!hasSupabase) return { error: "Supabase not connected" };
      const { error } = await supabase!.auth.signUp({ email, password });
      return { error: error?.message };
    },
    signOut: async () => {
      if (!hasSupabase) return;
      await supabase!.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
