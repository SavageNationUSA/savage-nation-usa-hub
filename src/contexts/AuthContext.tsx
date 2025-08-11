
import { createContext, useContext, useEffect, useState } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle disabled state for Supabase
  if (!hasSupabase) {
    const value: AuthContextType = {
      enabled: false,
      loading: false,
      session: null,
      user: null,
      isAdmin: false,
      signIn: async () => ({ error: "Supabase not configured" }),
      signUp: async () => ({ error: "Supabase not configured" }),
      signOut: async () => {},
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  // Initialize auth session
  useEffect(() => {
    if (!supabase) return;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Determine admin role
  useEffect(() => {
    if (!supabase || !user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    const checkAdmin = async () => {
      const roles = (user?.app_metadata as { roles?: string[] } | undefined)?.roles;
      const metaRole = (user?.user_metadata as { role?: string } | undefined)?.role;
      const legacyIsAdmin = !!(roles?.includes("admin") || metaRole === "admin");

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.log("[AuthContext] Failed to fetch user_roles:", error);
        setIsAdmin(legacyIsAdmin);
        return;
      }
      setIsAdmin(!!data || legacyIsAdmin);
    };

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value: AuthContextType = {
    enabled: true,
    loading,
    session,
    user,
    isAdmin,
    signIn: async (email, password) => {
      if (!supabase) return { error: "Supabase not configured" };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    signUp: async (email, password) => {
      if (!supabase) return { error: "Supabase not configured" };
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message };
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
