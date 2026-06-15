import { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  Euro,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useApp } from "../store/AppContext";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "../components/ui";
import { FILIERES, labelOf, statusColor, uid } from "../lib/format";
import { companyById, offersForCompany } from "../lib/selectors";
import type { Offer } from "../lib/types";

export default function Offers() {
  const { db, user, update, notify, toast } = useApp();
  const [q, setQ] = useState("");
  const [filiere, setFiliere] = useState("all");
  const [detail, setDetail] = useState<Offer | null>(null);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [creating, setCreating] = useState(false);
  const [applyOpen, setApplyOpen] = useState<Offer | null>(null);

  if (!user) return null;
  const u = user!;
  const isCompany = u.role === "company";
  const isStudent = u.role === "student";

  let offers = u.role === "company" ? offersForCompany(db, u.companyId ?? "") : db.offers;
  offers = [...offers].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const filtered = offers.filter((o) => {
    const matchQ =
      !q ||
      o.title.toLowerCase().includes(q.toLowerCase()) ||
      companyById(db, o.companyId)?.name.toLowerCase().includes(q.toLowerCase());
    const matchF = filiere === "all" || o.filiere === filiere;
    return matchQ && matchF;
  });

  const toggleStatus = (o: Offer) =>
    update((d) => {
      const f = d.offers.find((x) => x.id === o.id);
      if (f) f.status = f.status === "open" ? "closed" : "open";
    });

  const remove = (o: Offer) => {
    update((d) => {
      d.offers = d.offers.filter((x) => x.id !== o.id);
    });
    toast("Offre supprimée.", "info");
  };

  const alreadyApplied = (offerId: string) =>
    db.applications.some((a) => a.offerId === offerId && a.studentId === u.id);

  return (
    <div>
      <PageHeader
        title={isCompany ? "Mes offres de stage" : "Offres de stage"}
        subtitle={`${filtered.length} offre(s) disponible(s)`}
        actions={
          (isCompany || u.role === "admin") && (
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} /> Publier une offre
            </Button>
          )
        }
      />

      <Card className="mb-5 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher une offre ou entreprise..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={filiere} onChange={(e) => setFiliere(e.target.value)} className="sm:w-56">
          <option value="all">Toutes les filières</option>
          {FILIERES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </Select>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<Briefcase size={26} />} title="Aucune offre trouvée" description="Modifiez vos filtres ou publiez une nouvelle offre." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => {
            const c = companyById(db, o.companyId);
            const applicantCount = db.applications.filter((a) => a.offerId === o.id).length;
            return (
              <Card key={o.id} className="flex flex-col p-5 transition hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: c?.logoColor ?? "#64748b" }}>
                    {c?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-semibold leading-snug text-slate-800 dark:text-white">{o.title}</h3>
                    <p className="text-xs text-slate-400">{c?.name}</p>
                  </div>
                  <Badge className={statusColor(o.status)}>{labelOf(o.status)}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {o.city}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {o.durationWeeks} sem.</span>
                  <span className="flex items-center gap-1"><Building2 size={12} /> {o.filiere}</span>
                  {o.paid && <span className="flex items-center gap-1 text-emerald-600"><Euro size={12} /> Rémunéré</span>}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {o.skills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s}</span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {applicantCount > 0 && (isCompany || u.role === "admin") && (
                    <span className="mr-auto text-xs font-medium text-slate-400">{applicantCount} candidat(s)</span>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setDetail(o)}>Détails</Button>
                  {isStudent ? (
                    o.status === "open" ? (
                      <Button size="sm" disabled={alreadyApplied(o.id)} onClick={() => setApplyOpen(o)}>
                        {alreadyApplied(o.id) ? "Postulé" : "Postuler"}
                      </Button>
                    ) : null
                  ) : (isCompany || u.role === "admin") ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(o)} title={o.status === "open" ? "Clôturer" : "Rouvrir"}>
                        <X size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditing(o)}>
                        <Pencil size={15} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(o)}>
                        <Trash2 size={15} className="text-rose-500" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <OfferForm
          offer={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {detail && <OfferDetail offer={detail} onClose={() => setDetail(null)} onApply={isStudent ? () => { setApplyOpen(detail); setDetail(null); } : undefined} />}

      {applyOpen && (
        <ApplyModal
          offer={applyOpen}
          onClose={() => setApplyOpen(null)}
          onApplied={() => {
            setApplyOpen(null);
            toast("Candidature envoyée avec succès ! 🎉");
            notify(companyById(db, applyOpen.companyId)?.ownerUserId ?? "", {
              title: "Nouvelle candidature",
              message: `${u.name} a postulé à votre offre « ${applyOpen.title} ».`,
              type: "application",
            });
          }}
        />
      )}
    </div>
  );

  function OfferForm({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
    const [form, setForm] = useState({
      title: offer?.title ?? "",
      description: offer?.description ?? "",
      filiere: offer?.filiere ?? FILIERES[0],
      durationWeeks: offer?.durationWeeks ?? 8,
      city: offer?.city ?? u.city ?? "",
      paid: offer?.paid ?? false,
      remote: offer?.remote ?? false,
      skills: offer?.skills.join(", ") ?? "",
    });
    const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));
    const save = () => {
      if (!form.title.trim()) return toast("Veuillez saisir un titre.", "error");
      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      if (offer) {
        update((d) => {
          const f = d.offers.find((x) => x.id === offer.id);
          if (f) Object.assign(f, { ...form, skills });
        });
        toast("Offre mise à jour.");
      } else {
        const cid = u.companyId ?? db.companies[0]?.id ?? "";
        const newOffer: Offer = {
          id: uid("o"),
          companyId: cid,
          title: form.title,
          description: form.description,
          filiere: form.filiere,
          durationWeeks: Number(form.durationWeeks),
          city: form.city,
          paid: Boolean(form.paid),
          remote: Boolean(form.remote),
          skills,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        update((d) => {
          d.offers.unshift(newOffer);
          const admin = d.users.find((x) => x.role === "admin");
          if (admin)
            d.notifications.unshift({
              id: uid("n"),
              userId: admin.id,
              read: false,
              createdAt: new Date().toISOString(),
              title: "Nouvelle offre publiée",
              message: `${companyById(db, cid)?.name} a publié « ${form.title} ».`,
              type: "info",
            });
        });
        toast("Offre publiée avec succès !");
      }
      onClose();
    };
    return (
      <Modal
        open
        onClose={onClose}
        title={offer ? "Modifier l'offre" : "Publier une offre"}
        size="lg"
        footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save}>{offer ? "Enregistrer" : "Publier"}</Button></>}
      >
        <div className="space-y-4">
          <Field label="Titre du poste"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Stage - Développeur React" /></Field>
          <Field label="Description"><Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Missions, contexte, environnement technique..." /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Filière"><Select value={form.filiere} onChange={(e) => set("filiere", e.target.value)}>{FILIERES.map((f) => <option key={f}>{f}</option>)}</Select></Field>
            <Field label="Durée (semaines)"><Input type="number" min={1} value={form.durationWeeks} onChange={(e) => set("durationWeeks", e.target.value)} /></Field>
            <Field label="Ville"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Compétences (séparées par virgules)"><Input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, SQL" /></Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={form.paid} onChange={(e) => set("paid", e.target.checked)} className="h-4 w-4 rounded accent-brand-600" /> Stage rémunéré</label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={form.remote} onChange={(e) => set("remote", e.target.checked)} className="h-4 w-4 rounded accent-brand-600" /> Télétravail</label>
          </div>
        </div>
      </Modal>
    );
  }

  function OfferDetail({ offer, onClose, onApply }: { offer: Offer; onClose: () => void; onApply?: () => void }) {
    const c = companyById(db, offer.companyId);
    return (
      <Modal
        open
        onClose={onClose}
        title={offer.title}
        size="lg"
        footer={onApply ? <Button onClick={onApply} disabled={alreadyApplied(offer.id)}>{alreadyApplied(offer.id) ? "Déjà postulé" : "Postuler maintenant"}</Button> : undefined}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: c?.logoColor }}>{c?.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{c?.name}</p>
              <p className="text-xs text-slate-400">{c?.industry} · {c?.city}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColor(offer.status)}>{labelOf(offer.status)}</Badge>
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><MapPin size={11} /> {offer.city}</Badge>
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Calendar size={11} /> {offer.durationWeeks} semaines</Badge>
            {offer.paid && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Rémunéré</Badge>}
            {offer.remote && <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">Télétravail</Badge>}
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Description</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{offer.description}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Compétences recherchées</p>
            <div className="flex flex-wrap gap-2">
              {offer.skills.map((s) => <span key={s} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{s}</span>)}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  function ApplyModal({ offer, onClose, onApplied }: { offer: Offer; onClose: () => void; onApplied: () => void }) {
    const [letter, setLetter] = useState("");
    const submit = () => {
      update((d) => {
        d.applications.unshift({
          id: uid("a"),
          offerId: offer.id,
          studentId: u.id,
          companyId: offer.companyId,
          coverLetter: letter,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        d.notifications.unshift({
          id: uid("n"),
          userId: u.id,
          read: false,
          createdAt: new Date().toISOString(),
          title: "Candidature envoyée",
          message: `Votre candidature à « ${offer.title} » est en attente de validation.`,
          type: "application",
        });
      });
      onApplied();
    };
    return (
      <Modal
        open
        onClose={onClose}
        title="Postuler à l'offre"
        description={offer.title}
        footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={submit} disabled={!letter.trim()}>Envoyer</Button></>}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <Avatar name={u.name} color={u.avatarColor} size={40} />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{u.name}</p>
              <p className="text-xs text-slate-400">{u.filiere}</p>
            </div>
          </div>
          <Field label="Lettre de motivation" hint="Expliquez pourquoi vous êtes le candidat idéal.">
            <Textarea rows={5} value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="Madame, Monsieur..." />
          </Field>
        </div>
      </Modal>
    );
  }
}
