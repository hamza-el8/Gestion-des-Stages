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
import type {
  AppNotification,
  Company,
  DB,
  Role,
  User,
} from "../lib/types";
import {
  clearSession,
  loadDB,
  loadSession,
  loadTheme,
  makeAccessToken,
  resetDB,
  saveDB,
  saveSession,
  saveTheme,
} from "../lib/db";
import { pickColor, uid } from "../lib/format";

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
  // company
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
      update((d) => {
        d.notifications.unshift({
          id: uid("n"),
          userId,
          read: false,
          createdAt: new Date().toISOString(),
          ...n,
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
      await new Promise((r) => setTimeout(r, 350));
      const found = db.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!found) return { ok: false, error: "Aucun compte trouvé avec cet email." };
      if (!found.active) return { ok: false, error: "Ce compte est désactivé." };
      if (found.password !== password) return { ok: false, error: "Mot de passe incorrect." };
      const token = makeAccessToken(found);
      const sess = {
        token,
        userId: found.id,
        expiresAt: Date.now() + REFRESH_TTL,
      };
      saveSession(sess);
      setSession(sess);
      return { ok: true };
    },
    [db.users]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      await new Promise((r) => setTimeout(r, 450));
      const email = data.email.trim().toLowerCase();
      if (db.users.some((u) => u.email.toLowerCase() === email))
        return { ok: false, error: "Cet email est déjà utilisé." };

      const userId = uid("u");
      let companyId: string | undefined;

      if (data.role === "company") {
        companyId = uid("c");
        const company: Company = {
          id: companyId,
          name: data.companyName || data.name,
          industry: data.industry || "—",
          city: data.city || "—",
          address: "—",
          email: data.email,
          phone: data.phone,
          description: "",
          logoColor: pickColor(data.companyName || email),
          ownerUserId: userId,
          partner: false,
          createdAt: new Date().toISOString(),
        };
        update((d) => {
          d.companies.push(company);
        });
      }

      const newUser: User = {
        id: userId,
        name: data.name,
        email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        avatarColor: pickColor(email),
        createdAt: new Date().toISOString(),
        active: true,
        city: data.city,
        filiere: data.role === "student" ? data.filiere : undefined,
        level: data.role === "student" ? "Qualification (T1)" : undefined,
        skills: data.role === "student" ? [] : undefined,
        companyId,
      };

      update((d) => {
        d.users.push(newUser);
        d.notifications.unshift({
          id: uid("n"),
          userId,
          title: "Bienvenue sur StageFlow 🎉",
          message: "Votre compte a été créé avec succès. Complétez votre profil pour commencer.",
          read: false,
          type: "success",
          createdAt: new Date().toISOString(),
        });
        // notify admin
        const admin = d.users.find((u) => u.role === "admin");
        if (admin) {
          d.notifications.unshift({
            id: uid("n"),
            userId: admin.id,
            title: "Nouvelle inscription",
            message: `${newUser.name} (${newUser.role}) a rejoint la plateforme.`,
            read: false,
            type: "info",
            createdAt: new Date().toISOString(),
          });
        }
      });

      const token = makeAccessToken(newUser);
      const sess = { token, userId: newUser.id, expiresAt: Date.now() + REFRESH_TTL };
      saveSession(sess);
      setSession(sess);
      return { ok: true };
    },
    [db.users, update]
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const resetPassword = useCallback(
    async (email: string) => {
      await new Promise((r) => setTimeout(r, 600));
      const found = db.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!found) return { ok: false, error: "Aucun compte trouvé avec cet email." };
      return { ok: true };
    },
    [db.users]
  );

  const resetData = useCallback(() => {
    const fresh = resetDB();
    setDb(fresh);
    clearSession();
    setSession(null);
    toast("Données de démonstration réinitialisées.", "info");
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
