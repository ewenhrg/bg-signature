import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  checkAdminSession,
  getAdminToken,
  loginAdmin,
  setAdminToken,
} from "@/admin/api";

type AdminAuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAdminToken();
      if (!token) {
        if (!cancelled) {
          setAuthenticated(false);
          setReady(true);
        }
        return;
      }
      try {
        await checkAdminSession();
        if (!cancelled) setAuthenticated(true);
      } catch {
        setAdminToken(null);
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (password: string) => {
    const { token } = await loginAdmin(password);
    setAdminToken(token);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setAdminToken(null);
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ ready, authenticated, login, logout }),
    [ready, authenticated, login, logout]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
