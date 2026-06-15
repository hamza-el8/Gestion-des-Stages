import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppNotification, DB, Role, User } from "../lib/types";
import {
  clearSession,
  loadDB,
  loadSession,
  loadTheme,
  saveDB,
  saveSession,
  saveTheme,
} from "../lib/db";
import { uid } from "../lib/format";
import { api } from "../lib/api";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  filiere?: string;
  companyName?: string;
  industry?: string;
  city?: string;
}

interface AppCtx {
  db: DB;
  user: User | null;
  token: string | null;
  theme: "light" | "dark";
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  update: (producer: (draft: DB) => void) => void;
  notify: (userId: string, n: Omit<AppNotification, "id" | "userId" | "read" | "createdAt">) => void;
  toast: (message: string, type?: Toast["type"]) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  resetData: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

const REFRESH_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => loadDB());
  const [session, setSession] = useState(() => loadSession());
  const [theme, setTheme] = useState<"light" | "dark">(() => loadTheme());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // theme side-effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const user = useMemo(
    () => (session ? db.users.find((u) => u.id === session.userId) ?? null : null),
    [session, db.users]
  );

  const update = useCallback((producer: (draft: DB) => void) => {
    setDb((prev) => {
      const draft: DB = structuredClone(prev);
      producer(draft);
      saveDB(draft);
      return draft;
    });
  }, []);

  const notify = useCallback(
    (userId: string, n: Omit<AppNotification, "id" | "userId" | "read" | "createdAt">) => {
      // Try to persist to backend, fallback to local
      api.createNotification({
        userId,
        read: false,
        createdAt: new Date().toISOString(),
        ...n,
      }).catch(() => {
        // fallback: local only
        update((d) => {
          d.notifications.unshift({
            id: uid("n"),
            userId,
            read: false,
            createdAt: new Date().toISOString(),
            ...n,
          });
        });
      });
    },
    [update]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = uid("t");
      setToasts((t) => [...t, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismissToast(id), 3800);
    },
    [dismissToast]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api.login(email, password);
        const { token, user: apiUser } = res;

        // Upsert user in local db
        update((d) => {
          const idx = d.users.findIndex((u) => u.id === String(apiUser._id || apiUser.id));
          const mappedUser: User = {
            id: String(apiUser._id || apiUser.id),
            name: apiUser.name,
            email: apiUser.email,
            password: "",
            role: apiUser.role,
            phone: apiUser.phone,
            avatarColor: apiUser.avatarColor,
            createdAt: apiUser.createdAt || new Date().toISOString(),
            active: apiUser.active,
            bio: apiUser.bio,
            city: apiUser.city,
            filiere: apiUser.filiere,
            level: apiUser.level,
            skills: apiUser.skills,
            companyId: apiUser.companyId ? String(apiUser.companyId) : undefined,
          };
          if (idx >= 0) d.users[idx] = mappedUser;
          else d.users.push(mappedUser);
        });

        const userId = String(apiUser._id || apiUser.id);
        const sess = { token, userId, expiresAt: Date.now() + REFRESH_TTL };
        saveSession(sess);
        setSession(sess);
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err.message || "Erreur de connexion." };
      }
    },
    [update]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const res = await api.register(data);
        const { token, user: apiUser } = res;

        const userId = String(apiUser._id || apiUser.id);

        update((d) => {
          const mappedUser: User = {
            id: userId,
            name: apiUser.name,
            email: apiUser.email,
            password: "",
            role: apiUser.role,
            phone: apiUser.phone,
            avatarColor: apiUser.avatarColor,
            createdAt: apiUser.createdAt || new Date().toISOString(),
            active: apiUser.active,
            bio: apiUser.bio,
            city: apiUser.city,
            filiere: apiUser.filiere,
            level: apiUser.level,
            skills: apiUser.skills,
            companyId: apiUser.companyId ? String(apiUser.companyId) : undefined,
          };
          d.users.push(mappedUser);
        });

        const sess = { token, userId, expiresAt: Date.now() + REFRESH_TTL };
        saveSession(sess);
        setSession(sess);
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err.message || "Erreur d'inscription." };
      }
    },
    [update]
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const resetPassword = useCallback(
    async (email: string) => {
      // Backend ne supporte pas encore le reset par email — simulation locale
      const found = db.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!found) return { ok: false, error: "Aucun compte trouvé avec cet email." };
      return { ok: true };
    },
    [db.users]
  );

  const resetData = useCallback(() => {
    // Local reset only — does not touch backend data
    const fresh = loadDB();
    setDb(fresh);
    clearSession();
    setSession(null);
    toast("Session réinitialisée.", "info");
  }, [toast]);

  const value: AppCtx = {
    db,
    user,
    token: session?.token ?? null,
    theme,
    toggleTheme,
    login,
    register,
    logout,
    resetPassword,
    update,
    notify,
    toast,
    toasts,
    dismissToast,
    resetData,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
