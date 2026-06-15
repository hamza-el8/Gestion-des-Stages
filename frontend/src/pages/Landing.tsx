import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarClock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  PenTool,
  QrCode,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const features = [
  { icon: FileText, title: "Candidatures & affectation", desc: "Publication d'offres, candidatures, validation et affectation stagiaire ↔ entreprise en quelques clics." },
  { icon: PenTool, title: "Journal de bord & suivi", desc: "Rapports quotidiens et hebdomadaires, validation par l'encadrant, feedback continu." },
  { icon: Star, title: "Évaluations structurées", desc: "Évaluations intermédiaire et finale avec notation par critères et commentaires." },
  { icon: QrCode, title: "Documents PDF & QR", desc: "Génération automatique : convention, attestation, rapport. Signature électronique & QR de vérification." },
  { icon: MessagesSquare, title: "Messagerie intégrée", desc: "Chat stagiaire ↔ encadrant et entreprise ↔ stagiaire directement dans la plateforme." },
  { icon: CalendarClock, title: "Soutenances & jurys", desc: "Planification des soutenances, affectation des jurys et gestion des notes finales." },
];

const roles = [
  { icon: ShieldCheck, name: "Administrateur", desc: "Pilotage global, gestion des utilisateurs, statistiques et paramétrage.", color: "#4f46e5" },
  { icon: GraduationCap, name: "Stagiaire", desc: "Profil, CV, recherche d'offres, journal de bord et documents.", color: "#ec4899" },
  { icon: Users, name: "Encadrant pédagogique", desc: "Suivi des stagiaires, validation des rapports et évaluations.", color: "#14b8a6" },
  { icon: Building2, name: "Entreprise", desc: "Publication d'offres, gestion des candidats et suivi des stagiaires.", color: "#0ea5e9" },
];

const steps = [
  { n: "01", title: "Inscription & rôles", desc: "Chaque acteur crée son compte avec un rôle dédié et des permissions RBAC." },
  { n: "02", title: "Matching", desc: "Les stagiaires postulent, les entreprises valident, l'affectation est automatique." },
  { n: "03", title: "Suivi & évaluation", desc: "Journal de bord, évaluations intermédiaire et finale tout au long du stage." },
  { n: "04", title: "Validation", desc: "Soutenance, notes finales et génération des documents officiels." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
              <FileText size={18} />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">StageFlow</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features" className="hover:text-brand-600">Fonctionnalités</a>
            <a href="#roles" className="hover:text-brand-600">Rôles</a>
            <a href="#process" className="hover:text-brand-600">Processus</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              Connexion
            </Link>
            <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700">
              Démarrer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl dark:bg-brand-600/20" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-600/10" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
              <BadgeCheck size={14} /> Plateforme SaaS pour centres de formation
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Digitalisez toute la gestion de vos{" "}
              <span className="bg-gradient-to-r from-brand-600 to-pink-500 bg-clip-text text-transparent">
                stages
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              StageFlow centralise la recherche, l'affectation, le suivi, l'évaluation et la
              validation des stages — pour les stagiaires, encadrants, entreprises et administrateurs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700">
                Créer un compte <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                Voir la démo
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-500" /> JWT + RBAC</span>
              <span className="flex items-center gap-1.5"><Bell size={16} className="text-amber-500" /> Temps réel</span>
              <span className="flex items-center gap-1.5"><FileText size={16} className="text-brand-500" /> Export PDF</span>
            </div>
          </div>

          {/* Mock dashboard card */}
          <div className="relative animate-fade-in">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="ml-2 text-xs font-medium text-slate-400">stageflow.ma/dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { l: "Stagiaires", v: "1 248", c: "from-brand-500 to-brand-600" },
                  { l: "Stages actifs", v: "312", c: "from-emerald-500 to-teal-600" },
                  { l: "Partenaires", v: "86", c: "from-pink-500 to-rose-600" },
                ].map((s) => (
                  <div key={s.l} className={`rounded-xl bg-gradient-to-br ${s.c} p-3 text-white`}>
                    <p className="text-xl font-bold">{s.v}</p>
                    <p className="text-[11px] opacity-90">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex h-24 items-end gap-1.5">
                    {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-brand-500/70" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">Stages par mois</p>
                </div>
                <div className="space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  {["React", "DevOps", "Réseaux"].map((t, i) => (
                    <div key={t}>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t}</span><span>{[78, 54, 41][i]}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${[78, 54, 41][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Stage validé</p>
                  <p className="text-[11px] text-slate-400">Attestation générée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Tout le cycle du stage, une seule plateforme
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Une suite complète d'outils pensés pour les centres de formation modernes.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-slate-50 py-20 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Conçu pour chaque acteur</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Quatre rôles, des tableaux de bord et permissions dédiés.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <div key={r.name} className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${r.color}1a`, color: r.color }}>
                  <r.icon size={26} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{r.name}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Un processus fluide</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-display text-4xl font-extrabold text-brand-200 dark:text-brand-500/30">{s.n}</span>
              <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-8 py-16 text-center shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-400/20 blur-2xl" />
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Prêt à digitaliser vos stages ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Rejoignez la démo et explorez la plateforme avec des comptes pré-configurés pour chaque rôle.
          </p>
          <Link to="/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-lg hover:bg-brand-50">
            <LayoutDashboard size={16} /> Accéder aux démos
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-brand-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">StageFlow</span>
            <span>· Plateforme de gestion des stages</span>
          </div>
          <p>© {new Date().getFullYear()} StageFlow. Démo MERN.</p>
        </div>
      </footer>
    </div>
  );
}
