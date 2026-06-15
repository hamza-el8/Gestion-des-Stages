import { useRef, useState } from "react";
import { Moon, Save, Sun, Upload, User as UserIcon } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Button, Card, Field, Input, PageHeader, Textarea } from "../components/ui";
import { FILIERES, ROLE_LABELS, pickColor } from "../lib/format";

export default function Profile() {
  const { db, user, update, toast, theme, toggleTheme } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const me = db.users.find((u) => u.id === user?.id);

  const [form, setForm] = useState({
    name: me?.name ?? "",
    phone: me?.phone ?? "",
    city: me?.city ?? "",
    bio: me?.bio ?? "",
    filiere: me?.filiere ?? FILIERES[0],
    level: me?.level ?? "",
    skills: (me?.skills ?? []).join(", "),
    cvName: me?.cvName ?? "",
    cvData: me?.cvData ?? "",
  });
  const [pwd, setPwd] = useState({ current: "", next: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!user || !me) return null;
  const isStudent = user.role === "student";

  const onCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) return toast("Fichier trop volumineux (max 1 Mo).", "error");
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, cvName: file.name, cvData: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    update((d) => {
      const u = d.users.find((x) => x.id === user.id);
      if (!u) return;
      u.name = form.name;
      u.phone = form.phone;
      u.city = form.city;
      u.bio = form.bio;
      if (u.role === "student") {
        u.filiere = form.filiere;
        u.level = form.level;
        u.skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
        u.cvName = form.cvName || undefined;
        u.cvData = form.cvData || undefined;
      }
    });
    toast("Profil mis à jour avec succès.");
  };

  const changePassword = () => {
    if (pwd.current !== me.password) return toast("Mot de passe actuel incorrect.", "error");
    if (pwd.next.length < 6) return toast("Le nouveau mot de passe doit faire au moins 6 caractères.", "error");
    update((d) => { const u = d.users.find((x) => x.id === user.id); if (u) u.password = pwd.next; });
    setPwd({ current: "", next: "" });
    toast("Mot de passe modifié.");
  };

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Gérez vos informations et préférences" />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left summary */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={form.name || "?"} color={pickColor(form.name || me.email)} size={84} />
            <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{form.name || me.name}</h2>
            <Badge className="mt-1 bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{ROLE_LABELS[me.role]}</Badge>
            <p className="mt-2 text-sm text-slate-400">{me.email}</p>
            {isStudent && form.cvName && (
              <div className="mt-3 w-full rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">📄 {form.cvName}</p>
              </div>
            )}
            <div className="mt-4 w-full rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="mb-2 text-xs font-semibold text-slate-400">Apparence</p>
              <button onClick={toggleTheme} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </button>
            </div>
          </div>
        </Card>

        {/* Right forms */}
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800 dark:text-white"><UserIcon size={18} /> Informations générales</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Email"><Input value={me.email} disabled className="opacity-60" /></Field>
              <Field label="Téléphone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+212 6.." /></Field>
              <Field label="Ville"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            </div>
            {isStudent && (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Filière">
                    <select className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" value={form.filiere} onChange={(e) => set("filiere", e.target.value)}>
                      {FILIERES.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Niveau"><Input value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="Qualification / Spécialisation" /></Field>
                </div>
                <Field label="Compétences (séparées par virgules)"><Input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, SQL" /></Field>
                <Field label="CV (PDF, max 1 Mo)">
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={onCv} className="hidden" />
                  <Button variant="outline" type="button" onClick={() => fileRef.current?.click()}><Upload size={15} /> {form.cvName ? "Remplacer le CV" : "Téléverser un CV"}</Button>
                  {form.cvData && <span className="ml-3 text-xs text-emerald-600">✓ {form.cvName} chargé</span>}
                </Field>
              </>
            )}
            <Field label="Bio"><Textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Présentez-vous en quelques mots..." /></Field>
            <div className="mt-4 flex justify-end">
              <Button onClick={saveProfile}><Save size={16} /> Enregistrer</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">Sécurité</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mot de passe actuel"><Input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} /></Field>
              <Field label="Nouveau mot de passe"><Input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} /></Field>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={changePassword}>Modifier le mot de passe</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
