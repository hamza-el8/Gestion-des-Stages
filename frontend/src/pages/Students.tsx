import { useState } from "react";
import { Award, FileText, GraduationCap, MapPin, Search, Wrench } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select } from "../components/ui";
import { FILIERES, formatDate, labelOf, statusColor } from "../lib/format";
import { companyName, studentAverage, studentInternships } from "../lib/selectors";
import type { User } from "../lib/types";

export default function Students() {
  const { db, user } = useApp();
  const [q, setQ] = useState("");
  const [filiere, setFiliere] = useState("all");
  const [detail, setDetail] = useState<User | null>(null);

  if (!user) return null;

  let list = db.users.filter((u) => u.role === "student");
  list = list
    .filter((s) => (!q || s.name.toLowerCase().includes(q.toLowerCase())) && (filiere === "all" || s.filiere === filiere))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader title="Stagiaires" subtitle={`${list.length} stagiaire(s)`} />

      <Card className="mb-5 flex flex-col gap-3 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher un stagiaire..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={filiere} onChange={(e) => setFiliere(e.target.value)} className="sm:w-56">
          <option value="all">Toutes les filières</option>
          {FILIERES.map((f) => <option key={f} value={f}>{f}</option>)}
        </Select>
      </Card>

      {list.length === 0 ? (
        <EmptyState icon={<GraduationCap size={26} />} title="Aucun stagiaire" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s) => {
            const avg = studentAverage(db, s.id);
            const stages = studentInternships(db, s.id);
            return (
              <Card key={s.id} className="flex flex-col items-center p-5 text-center">
                <Avatar name={s.name} color={s.avatarColor} size={56} />
                <h3 className="mt-3 font-semibold text-slate-800 dark:text-white">{s.name}</h3>
                <p className="text-xs text-slate-400">{s.filiere}</p>
                {s.city && <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-400"><MapPin size={11} /> {s.city}</p>}
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {(s.skills ?? []).slice(0, 3).map((sk) => <span key={sk} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{sk}</span>)}
                </div>
                <div className="mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className="text-slate-400">{stages.length} stage(s)</span>
                  {avg != null && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><Award size={11} /> {avg}/20</Badge>}
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setDetail(s)}>Profil complet</Button>
              </Card>
            );
          })}
        </div>
      )}

      {detail && (
        <Modal open onClose={() => setDetail(null)} title="Profil du stagiaire" size="lg" footer={<Button onClick={() => setDetail(null)}>Fermer</Button>}>
          <StudentProfile student={detail} />
        </Modal>
      )}
    </div>
  );

  function StudentProfile({ student }: { student: User }) {
    const stages = studentInternships(db, student.id);
    const avg = studentAverage(db, student.id);
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} color={student.avatarColor} size={64} />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{student.name}</h3>
            <p className="text-sm text-slate-400">{student.filiere} · {student.level}</p>
            <p className="text-xs text-slate-400">{student.email} · {student.phone ?? "—"}</p>
          </div>
          {avg != null && <Badge className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><Award size={12} /> Moyenne {avg}/20</Badge>}
        </div>

        {student.bio && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">{student.bio}</p>}

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><Wrench size={14} /> Compétences</p>
          <div className="flex flex-wrap gap-2">
            {(student.skills ?? []).length ? student.skills!.map((sk) => <span key={sk} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{sk}</span>) : <span className="text-sm text-slate-400">Aucune compétence renseignée.</span>}
          </div>
        </div>

        {student.cvName && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <FileText size={18} className="text-rose-500" />
            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{student.cvName}</span>
            {student.cvData && <a href={student.cvData} download className="text-sm font-semibold text-brand-600 hover:underline">Télécharger</a>}
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Historique des stages</p>
          <div className="space-y-2">
            {stages.length ? stages.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{i.topic}</p>
                  <p className="text-xs text-slate-400">{companyName(db, i.companyId)} · {formatDate(i.startDate)} → {formatDate(i.endDate)}</p>
                </div>
                <Badge className={statusColor(i.status)}>{labelOf(i.status)}</Badge>
              </div>
            )) : <p className="text-sm text-slate-400">Aucun stage.</p>}
          </div>
        </div>
      </div>
    );
  }
}
