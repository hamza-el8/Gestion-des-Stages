import { useState } from "react";
import { Building2, Globe, Mail, MapPin, Pencil, Phone, Plus, Search, Star } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Textarea } from "../components/ui";
import { pickColor, uid } from "../lib/format";
import { userById } from "../lib/selectors";
import type { Company } from "../lib/types";

export default function Companies() {
  const { db, user, update, toast } = useApp();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Company | null>(null);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Company | null>(null);

  if (!user) return null;
  const u = user!;
  const isAdmin = u.role === "admin";
  const companies = [...db.companies]
    .filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.industry.toLowerCase().includes(q.toLowerCase()) || c.city.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.partner) - Number(a.partner));

  const togglePartner = (c: Company) =>
    update((d) => {
      const f = d.companies.find((x) => x.id === c.id);
      if (f) f.partner = !f.partner;
    });

  return (
    <div>
      <PageHeader
        title="Entreprises"
        subtitle={`${db.companies.length} entreprise(s) · ${db.companies.filter((c) => c.partner).length} partenaires`}
        actions={isAdmin && <Button onClick={() => setCreating(true)}><Plus size={16} /> Ajouter</Button>}
      />

      <Card className="mb-5 p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher une entreprise..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </Card>

      {companies.length === 0 ? (
        <EmptyState icon={<Building2 size={26} />} title="Aucune entreprise" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => {
            const offerCount = db.offers.filter((o) => o.companyId === c.id).length;
            return (
              <Card key={c.id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: c.logoColor }}>{c.name.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-800 dark:text-white">{c.name}</h3>
                    <p className="truncate text-xs text-slate-400">{c.industry}</p>
                  </div>
                  {c.partner && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"><Star size={11} /> Partenaire</Badge>}
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5"><MapPin size={12} /> {c.city}</p>
                  <p className="flex items-center gap-1.5"><Globe size={12} /> {c.website?.replace("https://", "")}</p>
                  <p className="flex items-center gap-1.5"><Building2 size={12} /> {offerCount} offre(s)</p>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Button variant="outline" size="sm" onClick={() => setDetail(c)}>Voir</Button>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => togglePartner(c)}>{c.partner ? "Retirer" : "Partenaire"}</Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil size={15} /></Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(creating || editing) && <CompanyForm company={editing} onClose={() => { setCreating(false); setEditing(null); }} />}

      {detail && (
        <Modal open onClose={() => setDetail(null)} title={detail.name} size="lg" footer={<Button onClick={() => setDetail(null)}>Fermer</Button>}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold text-white" style={{ backgroundColor: detail.logoColor }}>{detail.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{detail.name}</p>
                <p className="text-sm text-slate-400">{detail.industry}</p>
              </div>
              {detail.partner && <Badge className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"><Star size={11} /> Partenaire</Badge>}
            </div>
            {detail.description && <p className="text-sm text-slate-600 dark:text-slate-400">{detail.description}</p>}
            <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center gap-2"><MapPin size={15} className="text-slate-400" /> {detail.address}, {detail.city}</p>
              <p className="flex items-center gap-2"><Mail size={15} className="text-slate-400" /> {detail.email}</p>
              {detail.phone && <p className="flex items-center gap-2"><Phone size={15} className="text-slate-400" /> {detail.phone}</p>}
              {detail.website && <p className="flex items-center gap-2"><Globe size={15} className="text-slate-400" /> <a href={detail.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{detail.website}</a></p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  function CompanyForm({ company, onClose }: { company: Company | null; onClose: () => void }) {
    const [form, setForm] = useState({
      name: company?.name ?? "",
      industry: company?.industry ?? "",
      city: company?.city ?? "",
      address: company?.address ?? "",
      website: company?.website ?? "",
      email: company?.email ?? "",
      phone: company?.phone ?? "",
      description: company?.description ?? "",
      partner: company?.partner ?? false,
    });
    const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
    const save = () => {
      if (!form.name.trim()) return toast("Veuillez saisir un nom.", "error");
      if (company) {
        update((d) => { const f = d.companies.find((x) => x.id === company.id); if (f) Object.assign(f, form); });
        toast("Entreprise mise à jour.");
      } else {
        const owner = userById(db, u.id);
        const newCo: Company = { id: uid("c"), logoColor: pickColor(form.name), ownerUserId: "", createdAt: new Date().toISOString(), ...form };
        update((d) => { d.companies.push(newCo); void owner; });
        toast("Entreprise ajoutée.");
      }
      onClose();
    };
    return (
      <Modal open onClose={onClose} title={company ? "Modifier l'entreprise" : "Ajouter une entreprise"} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save}>Enregistrer</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Secteur"><Input value={form.industry} onChange={(e) => set("industry", e.target.value)} /></Field>
            <Field label="Ville"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Téléphone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Site web"><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>
          </div>
          <Field label="Adresse"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={form.partner} onChange={(e) => set("partner", e.target.checked)} className="h-4 w-4 rounded accent-brand-600" /> Entreprise partenaire</label>
        </div>
      </Modal>
    );
  }
}
