import type { DB, Session, User } from "./types";
import { SEED } from "./seed";

const DB_KEY = "stageflow.db.v1";
const SESSION_KEY = "stageflow.session.v1";
const THEME_KEY = "stageflow.theme";

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      // shallow sanity check
      if (parsed && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(DB_KEY, JSON.stringify(SEED));
  return structuredClone(SEED);
}

export function saveDB(db: DB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDB(): DB {
  const fresh = structuredClone(SEED);
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

/* ---------- Simulated JWT ---------- */

function base64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export interface JwtPayload {
  sub: string; // userId
  role: string;
  iat: number;
  exp: number;
}

export function makeAccessToken(user: User): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    iat: now,
    exp: now + 60 * 15, // 15 min
  };
  const sig = base64url({ s: Math.random().toString(36).slice(2) }).slice(0, 24);
  return `${base64url(header)}.${base64url(payload)}.${sig}`;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (s.expiresAt < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function loadTheme(): "light" | "dark" {
  const t = localStorage.getItem(THEME_KEY);
  if (t === "light" || t === "dark") return t;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}
