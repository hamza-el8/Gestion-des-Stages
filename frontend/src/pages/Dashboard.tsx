import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Card, EmptyState, PageHeader, ProgressBar, StatCard } from "../components/ui";
import {
  CHART_COLORS,
  applicationsForCompany,
  companyById,
  companyName,
  internshipsForCompany,
  internshipsForSupervisor,
  last6Months,
  offersForCompany,
  studentCurrentInternship,
  studentInternships,
  students,
  userById,
  userName,
} from "../lib/selectors";
import { formatDate, labelOf, progress, statusColor, timeAgo } from "../lib/format";
import { Badge } from "../components/ui";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
};

function ChartCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const { db, user } = useApp();
  if (!user) return null;

  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  return (
    <div>
      <PageHeader
        title={`${greet}, ${user.name.split(" ")[0]} 👋`}
        subtitle={`Voici votre tableau de bord ${user.role === "admin" ? "global" : "personnalisé"}.`}
      />
      {user.role === "admin" && <AdminView db={db} />}
      {user.role === "student" && <StudentView db={db} userId={user.id} />}
      {user.role === "supervisor" && <SupervisorView db={db} userId={user.id} />}
      {user.role === "company" && <CompanyView db={db} companyId={user.companyId} />}
    </div>
  );
}

/* =================== ADMIN =================== */
function AdminView({ db }: { db: ReturnType<typeof useApp>["db"] }) {
  const allStudents = students(db);
  const active = db.internships.filter((i) => i.status === "ongoing");
  const completed = db.internships.filter((i) => i.status === "completed");
  const pendingApps = db.applications.filter((a) => a.status === "pending");

  const months = last6Months();
  const stagesByMonth = months.map((m) => ({
    name: m.label,
    Stages: db.internships.filter((i) => {
      const d = new Date(i.startDate);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).length,
    Candidatures: db.applications.filter((a) => {
      const d = new Date(a.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).length,
  }));

  const byFiliere = useMemo(() => {
    const map = new Map<string, number>();
    allStudents.forEach((s) => map.set(s.filiere ?? "Autre", (map.get(s.filiere ?? "Autre") ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [allStudents]);

  const appStatus = [
    { name: "En attente", value: db.applications.filter((a) => a.status === "pending").length },
    { name: "Acceptées", value: db.applications.filter((a) => a.status === "accepted").length },
    { name: "Refusées", value: db.applications.filter((a) => a.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<GraduationCap size={20} />} label="Stagiaires" value={allStudents.length} sub={`${students(db).filter((s) => s.active).length} actifs`} color="#ec4899" />
        <StatCard icon={<Building2 size={20} />} label="Entreprises" value={db.companies.length} sub={`${db.companies.filter((c) => c.partner).length} partenaires`} color="#0ea5e9" />
        <StatCard icon={<FolderKanban size={20} />} label="Stages actifs" value={active.length} sub={`${completed.length} terminés`} color="#10b981" />
        <StatCard icon={<ClipboardList size={20} />} label="Candidatures" value={db.applications.length} sub={`${pendingApps.length} en attente`} color="#f59e0b" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Activité de la plateforme" subtitle="Stages & candidatures sur 6 mois">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stagesByMonth}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Stages" stroke="#4f46e5" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="Candidatures" stroke="#ec4899" strokeWidth={2.5} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="Répartition par filière" subtitle="Stagiaires inscrits">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byFiliere} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {byFiliere.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Dernières candidatures" subtitle="À traiter par les entreprises">
            <div className="space-y-2">
              {db.applications.slice(0, 6).map((a) => {
                const stu = userById(db, a.studentId);
                const off = db.offers.find((o) => o.id === a.offerId);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <Avatar name={userName(db, a.studentId)} color={stu?.avatarColor} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{userName(db, a.studentId)}</p>
                      <p className="truncate text-xs text-slate-400">{off?.title}</p>
                    </div>
                    <Badge className={statusColor(a.status)}>{labelOf(a.status)}</Badge>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
        <ChartCard title="Statut des candidatures">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={appStatus} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                {appStatus.map((_, i) => (
                  <Cell key={i} fill={[CHART_COLORS[3], CHART_COLORS[6], CHART_COLORS[2]][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

/* =================== STUDENT =================== */
function StudentView({ db, userId }: { db: ReturnType<typeof useApp>["db"]; userId: string }) {
  const me = userById(db, userId)!;
  const myApps = db.applications.filter((a) => a.studentId === userId);
  const current = studentCurrentInternship(db, userId);
  const myReports = db.reports.filter((r) => r.studentId === userId);
  const avg = myApps;
  void avg;
  const recs = db.offers.filter((o) => o.status === "open" && (!me.filiere || o.filiere === me.filiere)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ClipboardList size={20} />} label="Mes candidatures" value={myApps.length} sub={`${myApps.filter((a) => a.status === "pending").length} en attente`} color="#f59e0b" />
        <StatCard icon={<FolderKanban size={20} />} label="Stage en cours" value={current ? "Oui" : "Non"} sub={current ? companyName(db, current.companyId) : "Aucun"} color="#10b981" />
        <StatCard icon={<FileText size={20} />} label="Rapports" value={myReports.length} sub={`${myReports.filter((r) => r.status === "approved").length} validés`} color="#0ea5e9" />
        <StatCard icon={<Award size={20} />} label="Moyenne" value={(() => { const e = db.evaluations.filter(ev => studentInternships(db, userId).some(i => i.id === ev.internshipId)); return e.length ? (e.reduce((s, x) => s + x.score, 0) / e.length).toFixed(1) + "/20" : "—"; })()} sub="Évaluations reçues" color="#8b5cf6" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {current ? (
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-5 text-white">
                <p className="text-sm opacity-90">Mon stage en cours</p>
                <h3 className="mt-1 text-xl font-bold">{current.topic}</h3>
                <p className="mt-1 text-sm opacity-90">{companyName(db, current.companyId)} · Encadrant : {userName(db, current.supervisorId)}</p>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Progression du stage</span>
                  <span className="font-bold text-brand-600">{progress(current.startDate, current.endDate)}%</span>
                </div>
                <ProgressBar value={progress(current.startDate, current.endDate)} />
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <Info label="Début" value={formatDate(current.startDate)} />
                  <Info label="Fin" value={formatDate(current.endDate)} />
                  <Info label="Tuteur" value={current.companyMentor ?? "—"} />
                </div>
                <Link to="/app/internships" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Voir le détail <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2">
            <EmptyState icon={<Briefcase size={26} />} title="Aucun stage en cours" description="Postulez aux offres disponibles pour démarrer votre stage." action={<Link to="/app/offers" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Voir les offres</Link>} />
          </div>
        )}
        <Card className="p-5">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Offres recommandées</h3>
          <div className="space-y-3">
            {recs.map((o) => {
              const c = companyById(db, o.companyId);
              return (
                <Link key={o.id} to="/app/offers" className="block rounded-xl border border-slate-100 p-3 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-brand-500/5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{o.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{c?.name} · {o.city} · {o.durationWeeks} sem.</p>
                </Link>
              );
            })}
            {recs.length === 0 && <p className="text-sm text-slate-400">Aucune offre pour votre filière pour le moment.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white">Mes dernières candidatures</h3>
          <Link to="/app/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Tout voir</Link>
        </div>
        <div className="space-y-2">
          {myApps.slice(0, 5).map((a) => {
            const off = db.offers.find((o) => o.id === a.offerId);
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"><Briefcase size={16} className="text-slate-400" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{off?.title}</p>
                  <p className="text-xs text-slate-400">{companyName(db, a.companyId)} · {timeAgo(a.createdAt)}</p>
                </div>
                <Badge className={statusColor(a.status)}>{labelOf(a.status)}</Badge>
              </div>
            );
          })}
          {myApps.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Aucune candidature pour le moment.</p>}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

/* =================== SUPERVISOR =================== */
function SupervisorView({ db, userId }: { db: ReturnType<typeof useApp>["db"]; userId: string }) {
  const myStages = internshipsForSupervisor(db, userId);
  const myStudentIds = Array.from(new Set(myStages.map((i) => i.studentId)));
  const reportsToValidate = db.reports.filter((r) => r.status === "submitted" && myStages.some((i) => i.id === r.internshipId));
  const pendingEvals = myStages.filter((i) => i.status === "ongoing");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<GraduationCap size={20} />} label="Mes stagiaires" value={myStudentIds.length} color="#ec4899" />
        <StatCard icon={<FolderKanban size={20} />} label="Stages suivis" value={myStages.length} sub={`${myStages.filter((i) => i.status === "ongoing").length} en cours`} color="#10b981" />
        <StatCard icon={<FileText size={20} />} label="Rapports à valider" value={reportsToValidate.length} sub="En attente" color="#f59e0b" />
        <StatCard icon={<Star size={20} />} label="À évaluer" value={pendingEvals.length} color="#8b5cf6" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-white">Rapports à valider</h3>
            <Link to="/app/reports" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Voir</Link>
          </div>
          <div className="space-y-2">
            {reportsToValidate.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <Avatar name={userName(db, r.studentId)} color={userById(db, r.studentId)?.avatarColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
                  <p className="text-xs text-slate-400">{userName(db, r.studentId)} · {labelOf(r.type === "daily" ? "draft" : "submitted")}</p>
                </div>
                <Badge className={statusColor(r.status)}>{labelOf(r.status)}</Badge>
              </div>
            ))}
            {reportsToValidate.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Aucun rapport en attente 🎉</p>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-white">Mes stagiaires</h3>
            <Link to="/app/students" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Voir</Link>
          </div>
          <div className="space-y-2">
            {myStudentIds.slice(0, 5).map((sid) => {
              const s = userById(db, sid);
              const st = studentCurrentInternship(db, sid);
              return (
                <div key={sid} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <Avatar name={s?.name ?? ""} color={s?.avatarColor} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{s?.name}</p>
                    <p className="truncate text-xs text-slate-400">{st ? companyName(db, st.companyId) : "—"}</p>
                  </div>
                  {st && <Badge className={statusColor(st.status)}>{labelOf(st.status)}</Badge>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =================== COMPANY =================== */
function CompanyView({ db, companyId }: { db: ReturnType<typeof useApp>["db"]; companyId?: string }) {
  const cid = companyId ?? "";
  const myOffers = offersForCompany(db, cid);
  const myApps = applicationsForCompany(db, cid);
  const myStages = internshipsForCompany(db, cid);
  const company = companyById(db, cid);
  const openOffers = myOffers.filter((o) => o.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Briefcase size={20} />} label="Offres publiées" value={myOffers.length} sub={`${openOffers} ouvertes`} color="#4f46e5" />
        <StatCard icon={<Users size={20} />} label="Candidats" value={myApps.length} sub={`${myApps.filter((a) => a.status === "pending").length} à traiter`} color="#f59e0b" />
        <StatCard icon={<FolderKanban size={20} />} label="Stagiaires" value={myStages.length} sub={`${myStages.filter((i) => i.status === "ongoing").length} en cours`} color="#10b981" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Candidatures acceptées" value={myApps.filter((a) => a.status === "accepted").length} color="#0ea5e9" />
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white">Dernières candidatures reçues</h3>
          <Link to="/app/applications" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Tout voir</Link>
        </div>
        <div className="space-y-2">
          {myApps.slice(0, 6).map((a) => {
            const off = db.offers.find((o) => o.id === a.offerId);
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <Avatar name={userName(db, a.studentId)} color={userById(db, a.studentId)?.avatarColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{userName(db, a.studentId)}</p>
                  <p className="truncate text-xs text-slate-400">{off?.title}</p>
                </div>
                <Badge className={statusColor(a.status)}>{labelOf(a.status)}</Badge>
              </div>
            );
          })}
          {myApps.length === 0 && (
            <div className="py-8 text-center">
              <Clock size={28} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">Aucune candidature pour le moment.</p>
              <Link to="/app/offers" className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Publier une offre</Link>
            </div>
          )}
        </div>
      </Card>

      {company && (
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: company.logoColor }}>
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800 dark:text-white">{company.name}</p>
            <p className="text-sm text-slate-400">{company.industry} · {company.city}{company.partner ? " · Partenaire" : ""}</p>
          </div>
          <CalendarClock size={20} className="text-slate-300" />
        </Card>
      )}
    </div>
  );
}
