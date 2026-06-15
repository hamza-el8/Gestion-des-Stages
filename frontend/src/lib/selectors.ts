import type { DB, User } from "./types";

export function userById(db: DB, id?: string): User | undefined {
  if (!id) return undefined;
  return db.users.find((u) => u.id === id);
}

export function userName(db: DB, id?: string): string {
  return userById(db, id)?.name ?? "Inconnu";
}

export function companyById(db: DB, id?: string) {
  return db.companies.find((c) => c.id === id);
}

export function companyName(db: DB, id?: string): string {
  return companyById(db, id)?.name ?? "Entreprise";
}

export function students(db: DB): User[] {
  return db.users.filter((u) => u.role === "student");
}

export function supervisors(db: DB): User[] {
  return db.users.filter((u) => u.role === "supervisor");
}

export function companyUsers(db: DB): User[] {
  return db.users.filter((u) => u.role === "company");
}

/** Current (latest) internship for a student */
export function studentInternships(db: DB, studentId: string) {
  return db.internships
    .filter((i) => i.studentId === studentId)
    .sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));
}

export function studentCurrentInternship(db: DB, studentId: string) {
  return db.internships.find(
    (i) => i.studentId === studentId && i.status === "ongoing"
  );
}

export function internshipsForSupervisor(db: DB, supervisorId: string) {
  return db.internships.filter((i) => i.supervisorId === supervisorId);
}

export function internshipsForCompany(db: DB, companyId: string) {
  return db.internships.filter((i) => i.companyId === companyId);
}

export function offersForCompany(db: DB, companyId: string) {
  return db.offers.filter((o) => o.companyId === companyId);
}

export function applicationsForCompany(db: DB, companyId: string) {
  return db.applications.filter((a) => a.companyId === companyId);
}

export function studentAverage(db: DB, studentId: string): number | null {
  const ids = db.internships.filter((i) => i.studentId === studentId).map((i) => i.id);
  const evals = db.evaluations.filter((e) => ids.includes(e.internshipId));
  if (!evals.length) return null;
  return Math.round((evals.reduce((s, e) => s + e.score, 0) / evals.length) * 10) / 10;
}

export const CHART_COLORS = ["#4f46e5", "#ec4899", "#14b8a6", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#10b981"];

export function last6Months(): { key: string; label: string }[] {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
    });
  }
  return months;
}
