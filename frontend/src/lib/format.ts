export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return formatDate(iso);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#3b82f6",
];

export function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  student: "Stagiaire",
  supervisor: "Encadrant pédagogique",
  company: "Entreprise",
};

export const ROLE_SHORT: Record<string, string> = {
  admin: "Admin",
  student: "Stagiaire",
  supervisor: "Encadrant",
  company: "Entreprise",
};

export const FILIERES = [
  "Développement Digital",
  "Infrastructure Digitale",
  "Gestion des Entreprises",
  "Technicien Réseaux & Systèmes",
  "Comptabilité & Finance",
  "Marketing Digital",
  "Technicien en Développement Web",
];

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    submitted: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    ongoing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    completed: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    closed: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    scheduled: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  draft: "Brouillon",
  submitted: "Soumis",
  approved: "Validé",
  accepted: "Acceptée",
  rejected: "Refusée",
  ongoing: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
  open: "Ouverte",
  closed: "Clôturée",
  scheduled: "Planifiée",
  done: "Terminée",
};

export function labelOf(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function progress(startDate: string, endDate: string): number {
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}
