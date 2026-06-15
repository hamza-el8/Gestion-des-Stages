import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Plus,
  UserCog,
  Users,
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
  ProgressBar,
  Select,
  Tabs,
} from "../components/ui";
import {
  companyById,
  companyName,
  internshipsForCompany,
  internshipsForSupervisor,
  studentCurrentInternship,
  students,
  supervisors,
  userById,
  userName,
} from "../lib/selectors";
import { formatDate, labelOf, progress, statusColor, uid } from "../lib/format";
import type { Internship } from "../lib/types";

const STATUSES: Internship["status"][] = ["ongoing", "completed", "cancelled"];

export default function Internships() {
  const { db, user, update, toast } = useApp();
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState<Internship | null>(null);
  const [assigning, setAssigning] = useState(false);

  if (!user) return null;
  const u = user!;
  const isAdmin = u.role === "admin";

  let list: Internship[];
  if (u.role === "student") list = db.internships.filter((i) => i.studentId === u.id);
  else if (u.role === "company") list = internshipsForCompany(db, u.companyId ?? "");
  else if (u.role === "supervisor") list = internshipsForSupervisor(db, u.id);
  else list = db.internships;
  list = [...list].sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));

  const counts = {
    all: list.length,
    ongoing: list.filter((i) => i.status === "ongoing").length,
    completed: list.filter((i) => i.status === "completed").length,
    cancelled: list.filter((i) => i.status === "cancelled").length,
  };
  const filtered = tab === "all" ? list : list.filter((i) => i.status === tab);

  const setStatus = (i: Internship, status: Internship["status"]) => {
    update((d) => {
      const f = d.internships.find((x) => x.id === i.id);
      if (f) f.status = status;
      if (status === "completed") {
        d.notifications.unshift({ id: uid("n"), userId: i.studentId, read: false, createdAt: new Date().toISOString(), title: "Stage terminé", message: `Votre stage chez ${companyName(db, i.companyId)} est marqué comme terminé. Vos documents sont disponibles.`, type: "success" });
      }
    });
    toast(`Statut mis à jour : ${labelOf(status)}.`);
  };

  return (
    <div>
      <PageHeader
        title={u.role === "student" ? "Mon stage" : u.role === "supervisor" ? "Stages suivis" : "Stages"}
        subtitle={`${counts.all} stage(s)`}
        actions={isAdmin && <Button onClick={() => setAssigning(true)}><Plus size={16} /> Affecter un stage</Button>}
      />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "Tous", count: counts.all },
          { id: "ongoing", label: "En cours", count: counts.ongoing },
          { id: "completed", label: "Terminés", count: counts.completed },
          { id: "cancelled", label: "Annulés", count: counts.cancelled },
        ]}
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState icon={<FolderKanban size={26} />} title="Aucun stage" description="Aucun stage ne correspond à ce filtre." />
          </div>
        ) : (
          filtered.map((i) => {
            const stu = userById(db, i.studentId);
            const comp = companyById(db, i.companyId);
            const p = progress(i.startDate, i.endDate);
            return (
              <Card key={i.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <Badge className={statusColor(i.status)}>{labelOf(i.status)}</Badge>
                  {i.status === "ongoing" && <span className="text-xs font-semibold text-brand-600">{p}%</span>}
                </div>
                <h3 className="mt-2 line-clamp-2 font-semibold text-slate-800 dark:text-white">{i.topic}</h3>
                <div className="mt-3 flex items-center gap-2">
                  <Avatar name={stu?.name ?? "?"} color={stu?.avatarColor} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{stu?.name}</p>
                    <p className="text-xs text-slate-400">{stu?.filiere}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: comp?.logoColor }}>{comp?.name.slice(0, 2).toUpperCase()}</div>
                  {comp?.name}
                </div>
                {i.status === "ongoing" && <ProgressBar value={p} className="mt-3" />}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> {formatDate(i.startDate)} → {formatDate(i.endDate)}</span>
                  <Button variant="ghost" size="sm" onClick={() => setDetail(i)}>Détails</Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {detail && (
        <InternshipDetail
          internship={detail}
          onClose={() => setDetail(null)}
          canManage={u.role !== "student"}
          onStatus={(s) => { setStatus(detail, s); setDetail(null); }}
        />
      )}

      {assigning && <AssignModal onClose={() => setAssigning(false)} />}
    </div>
  );

  function AssignModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
      studentId: "",
      companyId: db.companies[0]?.id ?? "",
      supervisorId: supervisors(db)[0]?.id ?? "",
      topic: "",
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + 56 * 86400000).toISOString().slice(0, 10),
      hours: 40,
    });
    const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
    const availableStudents = students(db).filter((s) => !studentCurrentInternship(db, s.id));

    const save = () => {
      if (!form.studentId || !form.companyId) return toast("Sélectionnez un stagiaire et une entreprise.", "error");
      const internId = uid("i");
      update((d) => {
        d.internships.unshift({
          id: internId,
          studentId: form.studentId,
          companyId: form.companyId,
          supervisorId: form.supervisorId,
          topic: form.topic || "Stage professionnel",
          companyMentor: "",
          status: "ongoing",
          startDate: new Date(form.start).toISOString(),
          endDate: new Date(form.end).toISOString(),
          hoursPerWeek: Number(form.hours),
          createdAt: new Date().toISOString(),
        });
        d.conversations.push({ id: uid("conv"), participantIds: [form.studentId, form.supervisorId].filter(Boolean), type: "student-supervisor", createdAt: new Date().toISOString() });
        d.notifications.push(
          { id: uid("n"), userId: form.studentId, read: false, createdAt: new Date().toISOString(), title: "Stage affecté 🎯", message: `Vous avez été affecté à un stage chez ${companyName(db, form.companyId)}.`, type: "success" },
          { id: uid("n"), userId: form.supervisorId, read: false, createdAt: new Date().toISOString(), title: "Nouveau stagiaire", message: `${userName(db, form.studentId)} vous a été affecté.`, type: "info" }
        );
      });
      toast("Stage affecté avec succès !");
      onClose();
    };

    return (
      <Modal open onClose={onClose} title="Affecter un stage" description="Associez un stagiaire, une entreprise et un encadrant." size="lg" footer={<><Button variant="secondary" onClick={onClose}>Annuler</Button><Button onClick={save}>Affecter</Button></>}>
        <div className="space-y-4">
          <Field label="Stagiaire">
            <Select value={form.studentId} onChange={(e) => set("studentId", e.target.value)}>
              <option value="">— Sélectionner —</option>
              {availableStudents.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.filiere})</option>)}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Entreprise"><Select value={form.companyId} onChange={(e) => set("companyId", e.target.value)}>{db.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
            <Field label="Encadrant pédagogique"><Select value={form.supervisorId} onChange={(e) => set("supervisorId", e.target.value)}>{supervisors(db).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          </div>
          <Field label="Sujet du stage"><Input value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="Ex. Développement d'une application web" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date début"><Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} /></Field>
            <Field label="Date fin"><Input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} /></Field>
            <Field label="Heures/sem."><Input type="number" value={form.hours} onChange={(e) => set("hours", e.target.value)} /></Field>
          </div>
        </div>
      </Modal>
    );
  }

  function InternshipDetail({ internship, onClose, canManage, onStatus }: { internship: Internship; onClose: () => void; canManage: boolean; onStatus: (s: Internship["status"]) => void }) {
    const stu = userById(db, internship.studentId);
    const comp = companyById(db, internship.companyId);
    const sup = userById(db, internship.supervisorId);
    const reports = db.reports.filter((r) => r.internshipId === internship.id);
    const evals = db.evaluations.filter((e) => e.internshipId === internship.id);
    const p = progress(internship.startDate, internship.endDate);
    return (
      <Modal open onClose={onClose} title="Détail du stage" size="lg" footer={<Button onClick={onClose}>Fermer</Button>}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{internship.topic}</h3>
              <Badge className={`mt-1 ${statusColor(internship.status)}`}>{labelOf(internship.status)}</Badge>
            </div>
          </div>

          {internship.status === "ongoing" && (
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500"><span>Progression</span><span>{p}%</span></div>
              <ProgressBar value={p} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Mini icon={<Users size={14} />} label="Stagiaire" value={stu?.name ?? "—"} color={stu?.avatarColor} />
            <Mini icon={<FolderKanban size={14} />} label="Entreprise" value={comp?.name ?? "—"} />
            <Mini icon={<UserCog size={14} />} label="Encadrant" value={sup?.name ?? "—"} />
            <Mini icon={<CalendarDays size={14} />} label="Début" value={formatDate(internship.startDate)} />
            <Mini icon={<CalendarDays size={14} />} label="Fin" value={formatDate(internship.endDate)} />
            <Mini icon={<CheckCircle2 size={14} />} label="Tuteur" value={internship.companyMentor || "—"} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50"><p className="text-2xl font-bold text-slate-800 dark:text-white">{reports.length}</p><p className="text-xs text-slate-400">Rapports</p></div>
            <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50"><p className="text-2xl font-bold text-slate-800 dark:text-white">{evals.length}</p><p className="text-xs text-slate-400">Évaluations</p></div>
          </div>

          {canManage && (
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Button key={s} variant={internship.status === s ? "primary" : "outline"} size="sm" onClick={() => onStatus(s)}>{labelOf(s)}</Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

function Mini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
      <p className="flex items-center gap-1 text-xs text-slate-400">{icon} {label}</p>
      <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
        {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />} {value}
      </p>
    </div>
  );
}
