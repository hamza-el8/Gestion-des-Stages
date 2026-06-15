import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, FileText, KeyRound, Loader2, Mail, Lock } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Button, Field, Input, Modal } from "../components/ui";
import { ROLE_LABELS } from "../lib/format";

const DEMO = [
  { role: "admin", email: "admin@stageflow.ma", color: "#4f46e5" },
  { role: "student", email: "salma@stageflow.ma", color: "#ec4899" },
  { role: "supervisor", email: "nadia@stageflow.ma", color: "#14b8a6" },
  { role: "company", email: "atos@stageflow.ma", color: "#0ea5e9" },
];

export default function Login() {
  const { login, resetPassword, toast } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast("Connexion réussie. Bienvenue ! 👋");
      nav("/app/dashboard");
    } else {
      setError(res.error ?? "Erreur de connexion.");
    }
  };

  const quick = async (em: string) => {
    setEmail(em);
    setPassword("demo1234");
    setError("");
    setLoading(true);
    const res = await login(em, "demo1234");
    setLoading(false);
    if (res.ok) {
      toast("Connecté en mode démo.");
      nav("/app/dashboard");
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const res = await resetPassword(resetEmail);
    setResetLoading(false);
    if (res.ok) setResetSent(true);
    else toast(res.error ?? "Email introuvable.", "error");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <FileText size={18} />
          </div>
          <span className="font-display text-xl font-extrabold">StageFlow</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            La plateforme de gestion des stages, repensée.
          </h2>
          <p className="mt-4 max-w-md text-brand-100">
            Centralisez candidatures, suivi, évaluations et documents officiels en un seul endroit sécurisé.
          </p>
          <div className="mt-8 flex gap-6">
            <div>
              <p className="text-3xl font-bold">1 248</p>
              <p className="text-sm text-brand-200">Stagiaires</p>
            </div>
            <div>
              <p className="text-3xl font-bold">86</p>
              <p className="text-sm text-brand-200">Entreprises</p>
            </div>
            <div>
              <p className="text-3xl font-bold">312</p>
              <p className="text-sm text-brand-200">Stages actifs</p>
            </div>
          </div>
        </div>
        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} StageFlow</p>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
            <ArrowLeft size={15} /> Retour à l'accueil
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Accédez à votre espace personnel.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}
            <Field label="Adresse email">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.ma"
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Mot de passe">
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgot(true)}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Créer un compte
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="relative flex items-center py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <span className="flex-1 border-t border-slate-200 dark:border-slate-800" />
              <span className="px-3">Comptes de démonstration</span>
              <span className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.role}
                  onClick={() => quick(d.email)}
                  disabled={loading}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/5"
                >
                  <span className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: d.color }} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {ROLE_LABELS[d.role]}
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">{d.email}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">Mot de passe pour tous : demo1234</p>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      <Modal
        open={forgot}
        onClose={() => {
          setForgot(false);
          setResetSent(false);
        }}
        title="Réinitialiser le mot de passe"
        description={resetSent ? "" : "Un lien de réinitialisation vous sera envoyé par email (Nodemailer)."}
      >
        {resetSent ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <KeyRound size={26} />
            </div>
            <p className="font-semibold text-slate-800 dark:text-white">Email envoyé !</p>
            <p className="mt-1 text-sm text-slate-500">
              Un lien de réinitialisation a été envoyé à <b>{resetEmail}</b>.
            </p>
            <Button className="mt-5 w-full" onClick={() => { setForgot(false); setResetSent(false); }}>
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={doReset} className="space-y-4">
            <Field label="Votre adresse email">
              <Input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="vous@exemple.ma"
              />
            </Field>
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? <Loader2 size={18} className="animate-spin" /> : "Envoyer le lien"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
