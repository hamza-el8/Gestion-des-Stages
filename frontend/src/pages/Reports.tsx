import { useState } from "react";
import { BookOpen, Check, FileText, Plus, Send, X } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Tabs, Textarea } from "../components/ui";
import { formatDate, labelOf, statusColor, uid } from "../lib/format";
import { companyName, studentInternships, internshipsForSupervisor, userById, userName } from "../lib/selectors";
import type { Report } from "../lib/types";

export default function Reports() {
  const { db, user, update, notify, toast } = useApp();
  const [tab, setTab] = useState("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [validating, setValidating] = useState<Report | null>(null);

  if (!user) return null;
  const u = user!;

  let reports: Report[];
  if (u.role === "student") reports = db.reports.filter((r) => r.studentId === u.id);
  else if (u.role === "supervisor") {
    const ids = internshipsForSupervisor(db, u.id).map((i) => i.id);
    reports = db.reports.filter((r) => ids.includes(r.internshipId));
  } else reports = db.reports;
  reports = [...reports].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const tabs = u.role === "supervisor"
    ? [
        { id: "all", label: "Tous", count: reports.length },
        { id: "submitted", label: "À valider", count: reports.filter((r) => r.status === "submitted").length },
        { id: "approved", label: "Validés", count: reports.filter((r) => r.status === "approved").length },
      ]
    : [
        { id: "all", label: "Tous", count: reports.length },
        { id: "draft", label: "Brouillons", count: reports.filter((r) => r.status === "draft").length },
        { id: "approved", label: "Validés", count: reports.filter((r) => r.status === "approved").length },
      ];
  const filtered = tab === "all" ? reports : reports.filter((r) => r.status === tab);

  const submit = (r: Report) => {
    update((d) => { const f = d.reports.find((x) => x.id === r.id); if (f) f.status = "submitted"; });
    const intern = db.internships.find((i) => i.id === r.internshipId);
    if (intern) notify(intern.supervisorId, { title: "Rapport à valider", message: `${userName(db, r.studentId)} a soumis « ${r.title} ».`, type: "report" });
    toast("Rapport soumis à votre encadrant.");
  };

  const myInternshipId = u.role === "student" ? studentInternships(db, u.id)[0]?.id : undefined;

  return (
    <div>
      <PageHeader
        title={u.role === "student" ? "Journal de bord" : "Suivi & rapports"}
        subtitle={`${reports.length} rapport(s)`}
        actions={u.role === "student" && myInternshipId ? <Button onClick={() => setCreating(true)}><Plus size={16} /> Nouveau rapport</Button> : undefined}
      />

      {u.role === "student" && !myInternshipId && (
        <div className="mb-5">
          <EmptyState icon={<BookOpen size={26} />} title="Aucun stage actif" description="Vous devez avoir un stage pour rédiger votre journal de bord." />
        </div>
      )}

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText size={26} />} title="Aucun rapport" description={u.role === "student" ? "Rédigez votre premier rapport de stage." : "Aucun rapport à afficher."} />
        ) : (
          filtered.map((r) => {
            const intern = db.internships.find((i) => i.id === r.internshipId);
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar name={userName(db, r.studentId)} color={userById(db, r.studentId)?.avatarColor} size={40} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-800 dark:text-white">{r.title}</h3>
                        <Badge className={statusColor(r.status)}>{labelOf(r.status)}</Badge>
                        <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">{r.type === "daily" ? "Journalier" : "Hebdo"}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{userName(db, r.studentId)}{intern ? ` · ${companyName(db, intern.companyId)}` : ""} · {formatDate(r.date)}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">{r.content}</p>
                {r.feedback && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Check size={15} className="mt-0.5 shrink-0" /> <span><b>Feedback encadrant :</b> {r.feedback}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {u.role === "student" && r.status === "draft" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setEditing(r)}>Modifier</Button>
                      <Button size="sm" onClick={() => submit(r)}><Send size={14} /> Soumettre</Button>
                    </>
                  )}
                  {u.role === "student" && r.status === "submitted" && <span className="text-xs text-slate-400">En attente de validation…</span>}
                  {u.role === "supervisor" && r.status === "submitted" && <Button size="sm" onClick={() => setValidating(r)}><Check size={14} /> Valider / commenter</Button>}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {(creating || editing) && <ReportForm report={editing} internshipId={myInternshipId!} onClose={() => { setCreating(false); setEditing(null); }} />}
      {validating && <ValidateModal report={validating} onClose={() => setValidating(null)} />}
    </div>
  );

  function ReportForm({ report, internshipId, onClose }: { report: Report | null; internshipId: string; onClose: () => void }) {
    const [form, setForm] = useState({
      type: report?.type ?? "weekly",
      title: report?.title ?? "",
      date: report?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      content: report?.content ?? "",
    });
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
    const save = (status: Report["status"]) => {
      if (!form.title.trim() || !form.content.trim()) return toast("Titre et contenu requis.", "error");
      if (report) {
        update((d) => { const f = d.reports.find((x) => x.id === report.id); if (f) Object.assign(f, { ...form, date: new Date(form.date).toISOString(), status }); });
        toast(status === "submitted" ? "Rapport soumis." : "Brouillon enregistré.");
      } else {
        update((d) => {
          d.reports.unshift({ id: uid("r"), internshipId, studentId: u.id, title: form.title, type: form.type as Report["type"], date: new Date(form.date).toISOString(), content: form.content, status, createdAt: new Date().toISOString() });
        });
        toast(status === "submitted" ? "Rapport créé et soumis." : "Brouillon créé.");
      }
      onClose();
    };
    return (
      <Modal open onClose={onClose} title={report ? "Modifier le rapport" : "Nouveau rapport"} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button variant="outline" onClick={() => save("draft")}>Brouillon</Button><Button onClick={() => save("submitted")}><Send size={15} /> Soumettre</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select value={form.type} onChange={(e) => set("type", e.target.value)}><option value="weekly">Hebdomadaire</option><option value="daily">Journalier</option></Select></Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></Field>
          </div>
          <Field label="Titre"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex. Semaine 4 — Intégration API" /></Field>
          <Field label="Contenu"><Textarea rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Décrivez vos activités, réalisations et difficultés..." /></Field>
        </div>
      </Modal>
    );
  }

  function ValidateModal({ report, onClose }: { report: Report; onClose: () => void }) {
    const [feedback, setFeedback] = useState("");
    const decide = (status: "approved" | "rejected") => {
      update((d) => { const f = d.reports.find((x) => x.id === report.id); if (f) { f.status = status; f.feedback = feedback; } });
      notify(report.studentId, { title: status === "approved" ? "Rapport validé ✅" : "Rapport à revoir", message: `Votre rapport « ${report.title} » a été ${status === "approved" ? "validé" : "refusé"} par votre encadrant.`, type: "report" });
      toast(status === "approved" ? "Rapport validé." : "Rapport refusé.");
      onClose();
    };
    return (
      <Modal open onClose={onClose} title="Valider le rapport" description={report.title} footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button variant="danger" onClick={() => decide("rejected")}><X size={15} /> Refuser</Button><Button variant="success" onClick={() => decide("approved")}><Check size={15} /> Valider</Button></>}>
        <Field label="Feedback (optionnel)"><Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Laissez un commentaire pour le stagiaire..." /></Field>
      </Modal>
    );
  }
}
