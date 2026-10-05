import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Demo-only sign-in for a portfolio app with local sample data. Not real security.
export const DEMO_USERNAME = "demo";
export const DEMO_PASSWORD = "btp2026";

export interface Session { name: string; role: string; initials: string; guest: boolean }
interface AuthCtx {
  session: Session | null;
  ready: boolean;
  login: (username: string, password: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
}
const KEY = "guestbtp-session";
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setSession(JSON.parse(raw)); } catch { /* ignore */ }
    setReady(true);
  }, []);
  const save = (s: Session | null) => {
    setSession(s);
    if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY);
  };
  return (
    <Ctx.Provider value={{
      session, ready,
      login: (u, p) => {
        if (u.trim().toLowerCase() !== DEMO_USERNAME || p !== DEMO_PASSWORD) return false;
        save({ name: "Mamadou D.", role: "Chef de chantier", initials: "MD", guest: false });
        return true;
      },
      loginAsGuest: () => save({ name: "Guest", role: "Read-only visitor", initials: "G", guest: true }),
      logout: () => save(null),
    }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
