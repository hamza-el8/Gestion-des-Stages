import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClipboardCheck, Plus, Star } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, Textarea } from "../components/ui";
import { CHART_COLORS, companyName, internshipsForSupervisor, studentInternships, userById, userName } from "../lib/selectors";
import { formatDate, uid } from "../lib/format";
import type { Evaluation, Internship } from "../lib/types";

const CRITERIA = ["Technique", "Autonomie", "Communication", "Assiduité", "Esprit d'équipe"];

export default function Evaluations() {
  const { db, user, update, notify, toast } = useApp();
  const [creating, setCreating] = useState(false);
  const [preselect, setPreselect] = useState("");

  if (!user) return null;
  const u = user!;
  const canEvaluate = u.role === "supervisor" || u.role === "admin";

  let internships: Internship[];
  if (u.role === "student") internships = studentInternships(db, u.id);
  else if (u.role === "supervisor") internships = internshipsForSupervisor(db, u.id);
  else internships = db.internships;

  const ids = internships.map((i) => i.id);
  let evals = db.evaluations.filter((e) => ids.includes(e.internshipId));
  evals = [...evals].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const scoreColor = (s: number) => (s >= 16 ? "#10b981" : s >= 12 ? "#f59e0b" : "#ef4444");

  return (
    <div>
      <PageHeader title="Évaluations" subtitle={`${evals.length} évaluation(s)`} actions={canEvaluate && internships.length > 0 ? <Button onClick={() => { setPreselect(""); setCreating(true); }}><Plus size={16} /> Nouvelle évaluation</Button> : undefined} />

      {evals.length === 0 ? (
        <EmptyState icon={<ClipboardCheck size={26} />} title="Aucune évaluation" description={canEvaluate ? "Évaluez vos stagiaires (intermédiaire ou finale)." : "Vos évaluations apparaîtront ici."} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {evals.map((e) => {
            const intern = db.internships.find((i) => i.id === e.internshipId);
            return (
              <Card key={e.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={userName(db, intern?.studentId)} color={userById(db, intern?.studentId)?.avatarColor} size={42} />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{userName(db, intern?.studentId)}</p>
                      <p className="text-xs text-slate-400">{intern ? companyName(db, intern.companyId) : "—"} · {formatDate(e.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl" style={{ backgroundColor: `${scoreColor(e.score)}1a` }}>
                      <span className="text-lg font-bold leading-none" style={{ color: scoreColor(e.score) }}>{e.score}</span>
                      <span className="text-[10px] text-slate-400">/ 20</span>
                    </div>
                    <Badge className="mt-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">{e.type === "midterm" ? "Intermédiaire" : "Finale"}</Badge>
                  </div>
                </div>

                <div className="mt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={e.criteria}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:opacity-20" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 20]} hide />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={26}>
                        {e.criteria.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {e.comment && <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">{e.comment}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {creating && <EvalForm preselect={preselect} internships={internships} onClose={() => setCreating(false)} />}
    </div>
  );

  function EvalForm({ preselect, internships, onClose }: { preselect: string; internships: Internship[]; onClose: () => void }) {
    const [internshipId, setInternshipId] = useState(preselect || (internships[0]?.id ?? ""));
    const [type, setType] = useState<Evaluation["type"]>("midterm");
    const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(CRITERIA.map((c) => [c, 14])));
    const [comment, setComment] = useState("");

    const avg = Math.round((CRITERIA.reduce((s, c) => s + (scores[c] || 0), 0) / CRITERIA.length) * 10) / 10;

    const save = () => {
      if (!internshipId) return toast("Sélectionnez un stage.", "error");
      const intern = db.internships.find((i) => i.id === internshipId)!;
      update((d) => {
        d.evaluations.unshift({
          id: uid("e"),
          internshipId,
          type,
          score: avg,
          criteria: CRITERIA.map((c) => ({ label: c, value: scores[c] })),
          comment,
          evaluatorId: u.id,
          createdAt: new Date().toISOString(),
        });
      });
      notify(intern.studentId, { title: `Évaluation ${type === "midterm" ? "intermédiaire" : "finale"} disponible`, message: `Votre encadrant a publié une évaluation : ${avg}/20.`, type: "eval" });
      toast("Évaluation enregistrée.");
      onClose();
    };

    return (
      <Modal open onClose={onClose} title="Nouvelle évaluation" size="lg" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save}>Enregistrer</Button></>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stage">
              <Select value={internshipId} onChange={(e) => setInternshipId(e.target.value)}>
                {internships.map((i) => <option key={i.id} value={i.id}>{userName(db, i.studentId)} — {i.topic.slice(0, 30)}</option>)}
              </Select>
            </Field>
            <Field label="Type"><Select value={type} onChange={(e) => setType(e.target.value as Evaluation["type"])}><option value="midterm">Intermédiaire</option><option value="final">Finale</option></Select></Field>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><Star size={15} className="text-amber-500" /> Notation par critères (/20)</p>
              <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">Moyenne {avg}/20</Badge>
            </div>
            <div className="space-y-3">
              {CRITERIA.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-slate-600 dark:text-slate-300">{c}</span>
                  <input type="range" min={0} max={20} value={scores[c]} onChange={(e) => setScores((s) => ({ ...s, [c]: Number(e.target.value) }))} className="flex-1 accent-brand-600" />
                  <Input type="number" min={0} max={20} value={scores[c]} onChange={(ev) => setScores((s) => ({ ...s, [c]: Math.max(0, Math.min(20, Number(ev.target.value))) }))} className="h-8 w-16 py-0 text-center" />
                </div>
              ))}
            </div>
          </div>

          <Field label="Commentaire général"><Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Points forts, axes d'amélioration..." /></Field>
        </div>
      </Modal>
    );
  }
}
