import { useState } from "react";
import { Check, ClipboardList, Eye, Mail, X } from "lucide-react";
import { useApp } from "../store/AppContext";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  Tabs,
} from "../components/ui";
import { labelOf, statusColor, timeAgo, uid } from "../lib/format";
import {
  companyName,
  applicationsForCompany,
  supervisors,
  userById,
} from "../lib/selectors";
import type { Application } from "../lib/types";

export default function Applications() {
  const { db, user, update, notify, toast } = useApp();
  const [tab, setTab] = useState("all");
  const [view, setView] = useState<Application | null>(null);

  if (!user) return null;
  const isAdmin = user.role === "admin";
  const isCompany = user.role === "company";

  let apps: Application[];
  if (user.role === "student") apps = db.applications.filter((a) => a.studentId === user.id);
  else if (isCompany) apps = applicationsForCompany(db, user.companyId ?? "");
  else apps = db.applications;
  apps = [...apps].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };
  const filtered = tab === "all" ? apps : apps.filter((a) => a.status === tab);

  const assignSupervisor = (studentId: string) => {
    const student = userById(db, studentId);
    const match = supervisors(db).find((s) => s.filiere === student?.filiere);
    return (match ?? supervisors(db)[0])?.id ?? "";
  };

  const accept = (a: Application) => {
    const off = db.offers.find((o) => o.id === a.offerId);
    const supId = assignSupervisor(a.studentId);
    const weeks = off?.durationWeeks ?? 8;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + weeks * 7);
    const internId = uid("i");
    update((d) => {
      const ap = d.applications.find((x) => x.id === a.id);
      if (ap) ap.status = "accepted";
      d.internships.unshift({
        id: internId,
        studentId: a.studentId,
        companyId: a.companyId,
        offerId: a.offerId,
        supervisorId: supId,
        topic: off?.title ?? "Stage",
        companyMentor: "",
        status: "ongoing",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        hoursPerWeek: 40,
        createdAt: new Date().toISOString(),
      });
      // conversations
      const cs = (p: string[], type: "student-supervisor" | "student-company") => {
        if (!d.conversations.some((c) => c.participantIds.every((id) => p.includes(id)) && p.length === c.participantIds.length)) {
          d.conversations.push({ id: uid("conv"), participantIds: p, type, createdAt: new Date().toISOString() });
        }
      };
      if (supId) cs([a.studentId, supId], "student-supervisor");
      cs([a.studentId, a.companyId ? db.users.find((u) => u.companyId === a.companyId)?.id ?? "" : ""].filter(Boolean), "student-company");
      d.notifications.push(
        { id: uid("n"), userId: a.studentId, read: false, createdAt: new Date().toISOString(), title: "Candidature acceptée 🎉", message: `Votre candidature chez ${companyName(db, a.companyId)} a été acceptée. Votre stage est désormais actif.`, type: "success" },
        { id: uid("n"), userId: supId, read: false, createdAt: new Date().toISOString(), title: "Nouveau stagiaire à encadrer", message: `${userById(db, a.studentId)?.name} a été affecté à vos stages (stage chez ${companyName(db, a.companyId)}).`, type: "info" }
      );
    });
    toast(`${userById(db, a.studentId)?.name} accepté. Stage et conversations créés.`);
  };

  const reject = (a: Application) => {
    update((d) => {
      const ap = d.applications.find((x) => x.id === a.id);
      if (ap) ap.status = "rejected";
      d.notifications.unshift({ id: uid("n"), userId: a.studentId, read: false, createdAt: new Date().toISOString(), title: "Candidature refusée", message: `Votre candidature chez ${companyName(db, a.companyId)} n'a pas été retenue.`, type: "warning" });
    });
    toast("Candidature refusée.", "info");
    notify;
  };

  return (
    <div>
      <PageHeader
        title={user.role === "student" ? "Mes candidatures" : "Candidatures"}
        subtitle={`${counts.all} candidature(s)`}
      />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "Toutes", count: counts.all },
          { id: "pending", label: "En attente", count: counts.pending },
          { id: "accepted", label: "Acceptées", count: counts.accepted },
          { id: "rejected", label: "Refusées", count: counts.rejected },
        ]}
      />

      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList size={26} />} title="Aucune candidature" description="Les candidatures apparaîtront ici." />
        ) : (
          filtered.map((a) => {
            const stu = userById(db, a.studentId);
            const off = db.offers.find((o) => o.id === a.offerId);
            const canDecide = isCompany || isAdmin;
            return (
              <Card key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <Avatar name={stu?.name ?? "?"} color={stu?.avatarColor} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-800 dark:text-white">{stu?.name}</p>
                    {stu?.filiere && <span className="hidden text-xs text-slate-400 sm:inline">· {stu.filiere}</span>}
                  </div>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{off?.title}</p>
                  <p className="text-xs text-slate-400">
                    {user.role === "student" ? companyName(db, a.companyId) : companyName(db, a.companyId)} · {timeAgo(a.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor(a.status)}>{labelOf(a.status)}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => setView(a)} title="Voir"><Eye size={16} /></Button>
                  {canDecide && a.status === "pending" && (
                    <>
                      <Button variant="success" size="sm" onClick={() => accept(a)}><Check size={15} /> Accepter</Button>
                      <Button variant="danger" size="sm" onClick={() => reject(a)}><X size={15} /></Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {view && (
        <Modal open onClose={() => setView(null)} title="Détail de la candidature" footer={<Button onClick={() => setView(null)}>Fermer</Button>}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={userById(db, view.studentId)?.name ?? "?"} color={userById(db, view.studentId)?.avatarColor} size={48} />
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{userById(db, view.studentId)?.name}</p>
                <p className="text-sm text-slate-400">{userById(db, view.studentId)?.filiere} · {userById(db, view.studentId)?.phone ?? "—"}</p>
              </div>
              <Badge className={`ml-auto ${statusColor(view.status)}`}>{labelOf(view.status)}</Badge>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Offre</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{db.offers.find((o) => o.id === view.offerId)?.title}</p>
              <p className="text-xs text-slate-400">{companyName(db, view.companyId)} · {timeAgo(view.createdAt)}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Lettre de motivation</p>
              <div className="flex gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <Mail size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="whitespace-pre-wrap">{view.coverLetter || "Aucune lettre jointe."}</p>
              </div>
            </div>
            {(isCompany || isAdmin) && view.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="success" className="flex-1" onClick={() => { accept(view); setView(null); }}><Check size={16} /> Accepter & créer le stage</Button>
                <Button variant="danger" onClick={() => { reject(view); setView(null); }}><X size={16} /></Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
