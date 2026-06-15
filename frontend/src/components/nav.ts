import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  ClipboardList,
  FolderKanban,
  BookOpen,
  ClipboardCheck,
  CalendarClock,
  Files,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../lib/types";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    { path: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/app/users", label: "Utilisateurs", icon: Users },
    { path: "/app/students", label: "Stagiaires", icon: GraduationCap },
    { path: "/app/companies", label: "Entreprises", icon: Building2 },
    { path: "/app/offers", label: "Offres de stage", icon: Briefcase },
    { path: "/app/applications", label: "Candidatures", icon: ClipboardList },
    { path: "/app/internships", label: "Stages", icon: FolderKanban },
    { path: "/app/reports", label: "Suivi & Journal", icon: BookOpen },
    { path: "/app/evaluations", label: "Évaluations", icon: ClipboardCheck },
    { path: "/app/soutenances", label: "Soutenances", icon: CalendarClock },
    { path: "/app/documents", label: "Documents", icon: Files },
    { path: "/app/chat", label: "Messagerie", icon: MessageSquare },
  ],
  student: [
    { path: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/app/offers", label: "Offres de stage", icon: Briefcase },
    { path: "/app/applications", label: "Mes candidatures", icon: ClipboardList },
    { path: "/app/internships", label: "Mon stage", icon: FolderKanban },
    { path: "/app/reports", label: "Journal de bord", icon: BookOpen },
    { path: "/app/evaluations", label: "Mes évaluations", icon: ClipboardCheck },
    { path: "/app/soutenances", label: "Soutenance", icon: CalendarClock },
    { path: "/app/documents", label: "Documents", icon: Files },
    { path: "/app/chat", label: "Messagerie", icon: MessageSquare },
  ],
  supervisor: [
    { path: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/app/students", label: "Mes stagiaires", icon: GraduationCap },
    { path: "/app/internships", label: "Stages suivis", icon: FolderKanban },
    { path: "/app/reports", label: "Rapports à valider", icon: BookOpen },
    { path: "/app/evaluations", label: "Évaluations", icon: ClipboardCheck },
    { path: "/app/soutenances", label: "Soutenances", icon: CalendarClock },
    { path: "/app/chat", label: "Messagerie", icon: MessageSquare },
  ],
  company: [
    { path: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { path: "/app/offers", label: "Mes offres", icon: Briefcase },
    { path: "/app/applications", label: "Candidatures", icon: ClipboardList },
    { path: "/app/internships", label: "Stages", icon: FolderKanban },
    { path: "/app/students", label: "Stagiaires", icon: GraduationCap },
    { path: "/app/chat", label: "Messagerie", icon: MessageSquare },
  ],
};

export function findNavLabel(path: string): string | undefined {
  for (const role of Object.keys(NAV) as Role[]) {
    const found = NAV[role].find((n) => path.startsWith(n.path));
    if (found) return found.label;
  }
  return undefined;
}
