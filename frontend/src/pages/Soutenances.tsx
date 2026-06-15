import { useState } from "react";
import { CalendarClock, Check, Gavel, MapPin, Plus, Users } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select } from "../components/ui";
import { companyName, internshipsForSupervisor, studentInternships, supervisors, userById, userName } from "../lib/selectors";
import { formatDate, labelOf, statusColor, uid } from "../lib/format";
import type { Internship, Soutenance } from "../lib/types";

export default function Soutenances() {
  const { db, user, update, notify, toast } = useApp();
  const [planning, setPlanning] = useState(false);
  const [grading, setGrading] = useState<Soutenance | null>(null);

  if (!user) return null;
  const u = user!;
  const isAdmin = u.role === "admin";

  let internships: Internship[];
  if (u.role === "student") internships = studentInternships(db, u.id);
  else if (u.role === "supervisor") internships = internshipsForSupervisor(db, u.id);
  else internships = db.internships;

  const soutenanceIds = db.soutenances.map((s) => s.internshipId);
  const without = internships.filter((i) => !soutenanceIds.includes(i.id));
  const mySoutenances = db.soutenances.filter((s) => internships.some((i) => i.id === s.internshipId));

  return (
    <div>
      <PageHeader title="Soutenances" subtitle={`${mySoutenances.length} soutenance(s)`} actions={isAdmin && without.length > 0 ? <Button onClick={() => setPlanning(true)}><Plus size={16} /> Planifier</Button> : undefined} />

      {mySoutenances.length === 0 ? (
        <EmptyState icon={<Gavel size={26} />} title="Aucune soutenance planifiée" description={isAdmin ? "Planifiez les soutenances de vos stagiaires." : "Aucune soutenance pour le moment."} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mySoutenances.map((s) => {
            const intern = db.internships.find((i) => i.id === s.internshipId);
            const stu = userById(db, s.studentId);
            return (
              <Card key={s.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"><CalendarClock size={20} /></div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{stu?.name}</p>
                      <p className="text-xs text-slate-400">{intern?.topic}</p>
                    </div>
                  </div>
                  <Badge className={statusColor(s.status)}>{labelOf(s.status)}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"><p className="text-xs text-slate-400">Date</p><p className="font-semibold text-slate-700 dark:text-slate-200">{formatDate(s.date)}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"><p className="text-xs text-slate-400">Heure</p><p className="font-semibold text-slate-700 dark:text-slate-200">{s.time}</p></div>
                  <div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"><p className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} /> Salle</p><p className="font-semibold text-slate-700 dark:text-slate-200">{s.room}</p></div>
                </div>

                <div className="mt-3">
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><Users size={12} /> Jury</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.juryIds.map((jid) => (
                      <span key={jid} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${jid === s.presidentId ? "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                        <Avatar name={userName(db, jid)} color={userById(db, jid)?.avatarColor} size={16} /> {userName(db, jid).split(" ")[0]}{jid === s.presidentId ? " · Président" : ""}
                      </span>
                    ))}
                  </div>
                </div>

                {s.status === "done" && s.grade != null && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <Check size={16} className="text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Note finale : {s.grade}/20</span>
                  </div>
                )}

                {isAdmin && s.status === "scheduled" && (
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setGrading(s)}>Saisir la note finale</Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {planning && <PlanModal onClose={() => setPlanning(false)} internships={without} />}
      {grading && <GradeModal soutenance={grading} onClose={() => setGrading(null)} />}
    </div>
  );

  function PlanModal({ onClose, internships }: { onClose: () => void; internships: Internship[] }) {
    const juryPool = [...supervisors(db), ...db.users.filter((x) => x.role === "admin")];
    const [internshipId, setInternshipId] = useState(internships[0]?.id ?? "");
    const [date, setDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
    const [time, setTime] = useState("10:00");
    const [room, setRoom] = useState("");
    const [jury, setJury] = useState<string[]>(juryPool.slice(0, 2).map((j) => j.id));
    const [president, setPresident] = useState(juryPool[0]?.id ?? "");

    const toggle = (id: string) =>
      setJury((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]));

    const save = () => {
      if (!internshipId) return toast("Sélectionnez un stage.", "error");
      const intern = db.internships.find((i) => i.id === internshipId)!;
      update((d) => {
        d.soutenances.unshift({
          id: uid("s"),
          internshipId,
          studentId: intern.studentId,
          date: new Date(date).toISOString(),
          time,
          room: room || "À définir",
          juryIds: jury,
          presidentId: jury.includes(president) ? president : jury[0],
          status: "scheduled",
        });
      });
      notify(intern.studentId, { title: "Soutenance planifiée 🎯", message: `Votre soutenance est prévue le ${formatDate(date)} à ${time} (${room || "salle à définir"}).`, type: "soutenance" });
      toast("Soutenance planifiée.");
      onClose();
    };

    return (
      <Modal open onClose={onClose} title="Planifier une soutenance" size="lg" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save}>Planifier</Button></>}>
        <div className="space-y-4">
          <Field label="Stage"><Select value={internshipId} onChange={(e) => setInternshipId(e.target.value)}>{internships.map((i) => <option key={i.id} value={i.id}>{userName(db, i.studentId)} — {companyName(db, i.companyId)}</option>)}</Select></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Heure"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            <Field label="Salle"><Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="B204" /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Membres du jury</p>
            <div className="space-y-2">
              {juryPool.map((j) => (
                <label key={j.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <input type="checkbox" checked={jury.includes(j.id)} onChange={() => toggle(j.id)} className="h-4 w-4 rounded accent-brand-600" />
                  <Avatar name={j.name} color={j.avatarColor} size={30} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{j.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Président du jury"><Select value={president} onChange={(e) => setPresident(e.target.value)}>{juryPool.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}</Select></Field>
        </div>
      </Modal>
    );
  }

  function GradeModal({ soutenance, onClose }: { soutenance: Soutenance; onClose: () => void }) {
    const [grade, setGrade] = useState(15);
    const [notes, setNotes] = useState("");
    const save = () => {
      update((d) => { const f = d.soutenances.find((x) => x.id === soutenance.id); if (f) { f.grade = grade; f.status = "done"; f.notes = notes; } });
      notify(soutenance.studentId, { title: "Note de soutenance publiée", message: `Votre note finale est : ${grade}/20.`, type: "soutenance" });
      toast("Note enregistrée.");
      onClose();
    };
    return (
      <Modal open onClose={onClose} title="Note finale de soutenance" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save}>Valider</Button></>}>
        <div className="space-y-4">
          <Field label={`Note (/20) : ${grade}`}>
            <input type="range" min={0} max={20} value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="w-full accent-brand-600" />
          </Field>
          <Field label="Observations"><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Remarques du jury..." /></Field>
        </div>
      </Modal>
    );
  }
}
