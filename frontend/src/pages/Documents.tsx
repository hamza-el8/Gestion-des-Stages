import { useState } from "react";
import { Award, FileSignature, FileText, Files, FolderKanban, Loader2 } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "../components/ui";
import { companyById, internshipsForCompany, internshipsForSupervisor, studentInternships, userById } from "../lib/selectors";
import { formatDate, labelOf, statusColor } from "../lib/format";
import { generateAttestation, generateConvention, generateReportCover, type DocContext } from "../lib/pdf";
import type { Internship } from "../lib/types";

export default function Documents() {
  const { db, user } = useApp();
  const [busy, setBusy] = useState<string>("");

  if (!user) return null;
  const u = user!;

  let internships: Internship[];
  if (u.role === "student") internships = studentInternships(db, u.id);
  else if (u.role === "company") internships = internshipsForCompany(db, u.companyId ?? "");
  else if (u.role === "supervisor") internships = internshipsForSupervisor(db, u.id);
  else internships = db.internships;

  const buildCtx = (i: Internship): DocContext => {
    const student = userById(db, i.studentId)!;
    const company = companyById(db, i.companyId)!;
    const supervisor = userById(db, i.supervisorId)!;
    const finalEval = db.evaluations.find((e) => e.internshipId === i.id && e.type === "final");
    return { internship: i, student, company, supervisor, finalGrade: finalEval?.score };
  };

  const run = async (key: string, i: Internship, fn: (ctx: DocContext) => Promise<void>) => {
    setBusy(key);
    try {
      await fn(buildCtx(i));
    } finally {
      setBusy("");
    }
  };

  const docTypes = (i: Internship) => {
    const reports = db.reports.filter((r) => r.internshipId === i.id).length;
    const ctx = () => buildCtx(i);
    return [
      { key: `${i.id}-conv`, label: "Convention de stage", icon: FileSignature, desc: "Contrat tripartite signé électroniquement", run: () => run(`${i.id}-conv`, i, generateConvention) },
      { key: `${i.id}-att`, label: "Attestation de stage", icon: Award, desc: "Avec note finale & QR d'authenticité", run: () => run(`${i.id}-att`, i, generateAttestation) },
      { key: `${i.id}-rpt`, label: "Page de garde - Rapport", icon: FileText, desc: `Basée sur ${reports} rapport(s) du journal`, run: () => run(`${i.id}-rpt`, i, (c) => generateReportCover(c, reports)) },
    ];
    void ctx;
  };

  return (
    <div>
      <PageHeader title="Documents" subtitle="Génération automatique de documents officiels (PDF + QR)" />

      <Card className="mb-5 flex items-center gap-3 border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"><Files size={18} /></div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Tous les documents sont générés avec <b>signature électronique</b> et un <b>QR code de vérification</b>. Le navigateur téléchargera automatiquement le PDF.
        </p>
      </Card>

      {internships.length === 0 ? (
        <EmptyState icon={<FolderKanban size={26} />} title="Aucun stage" description="Les documents sont liés à un stage." />
      ) : (
        <div className="space-y-4">
          {internships.map((i) => {
            const stu = userById(db, i.studentId);
            const comp = companyById(db, i.companyId);
            return (
              <Card key={i.id} className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={stu?.name ?? "?"} color={stu?.avatarColor} size={40} />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{i.topic}</p>
                      <p className="text-xs text-slate-400">{stu?.name} · {comp?.name} · {formatDate(i.startDate)} → {formatDate(i.endDate)}</p>
                    </div>
                  </div>
                  <Badge className={statusColor(i.status)}>{labelOf(i.status)}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {docTypes(i).map((d) => (
                    <button
                      key={d.key}
                      onClick={d.run}
                      disabled={!!busy}
                      className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-400 hover:bg-brand-50/40 disabled:opacity-50 dark:border-slate-700 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300">
                        {busy === d.key ? <Loader2 size={18} className="animate-spin" /> : <d.icon size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{d.label}</p>
                        <p className="text-xs text-slate-400">{d.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
