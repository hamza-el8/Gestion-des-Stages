import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FileText,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import { Button, Field, Input, Select } from "../components/ui";
import { FILIERES, ROLE_LABELS } from "../lib/format";
import type { Role } from "../lib/types";
import { cn } from "../components/ui";

const roleCards: { role: Role; icon: typeof ShieldCheck; desc: string; color: string }[] = [
  { role: "student", icon: GraduationCap, desc: "Je cherche un stage", color: "#ec4899" },
  { role: "company", icon: Building2, desc: "Je recrute des stagiaires", color: "#0ea5e9" },
  { role: "supervisor", icon: Users, desc: "J'encadre des stagiaires", color: "#14b8a6" },
];

export default function Register() {
  const { register, toast } = useApp();
  const nav = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    filiere: FILIERES[0],
    companyName: "",
    industry: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const res = await register({
      name: role === "company" ? form.companyName || form.name : form.name,
      email: form.email,
      password: form.password,
      role,
      phone: form.phone,
      filiere: role === "student" ? form.filiere : undefined,
      companyName: role === "company" ? form.companyName : undefined,
      industry: role === "company" ? form.industry : undefined,
      city: form.city,
    });
    setLoading(false);
    if (res.ok) {
      toast("Compte créé avec succès ! 🎉");
      nav("/app/dashboard");
    } else {
      setError(res.error ?? "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-2xl px-4">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft size={15} /> Retour à l'accueil
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Créer un compte
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rejoignez StageFlow en quelques secondes</p>
            </div>
          </div>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {roleCards.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setRole(r.role)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition",
                  role === r.role
                    ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 dark:bg-brand-500/10"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${r.color}1a`, color: r.color }}>
                  <r.icon size={20} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{ROLE_LABELS[r.role]}</span>
                  <span className="block text-[11px] text-slate-400">{r.desc}</span>
                </span>
              </button>
            ))}
          </div>

          {role === "student" && (
            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <ShieldCheck size={14} /> Vous aurez accès à votre profil, CV, offres et journal de bord.
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}

            {role === "company" ? (
              <>
                <Field label="Nom de l'entreprise">
                  <Input required value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Ex. Tech Maroc SARL" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Secteur d'activité">
                    <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Ex. Services IT" />
                  </Field>
                  <Field label="Ville">
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Casablanca" />
                  </Field>
                </div>
              </>
            ) : (
              <Field label="Nom complet">
                <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Prénom Nom" />
              </Field>
            )}

            {role === "student" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Filière">
                  <Select value={form.filiere} onChange={(e) => set("filiere", e.target.value)}>
                    {FILIERES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Ville">
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Casablanca" />
                </Field>
              </div>
            )}

            <Field label="Adresse email">
              <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.ma" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Téléphone">
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+212 6.." />
              </Field>
              <Field label="Mot de passe">
                <Input type="password" required value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
              </Field>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
