import { useState } from "react";
import { ShieldCheck, Trash2, Search, UserCheck, UserX } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select } from "../components/ui";
import { ROLE_LABELS, formatDate } from "../lib/format";
import type { Role } from "../lib/types";

export default function Users() {
  const { db, user, update, toast } = useApp();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [del, setDel] = useState<string | null>(null);

  if (!user) return null;
  const u = user!;

  const list = db.users
    .filter((x) => x.id !== u.id)
    .filter((x) => (!q || x.name.toLowerCase().includes(q.toLowerCase()) || x.email.toLowerCase().includes(q.toLowerCase())) && (role === "all" || x.role === role))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const toggleActive = (id: string) =>
    update((d) => { const f = d.users.find((x) => x.id === id); if (f) f.active = !f.active; });

  const changeRole = (id: string, r: Role) =>
    update((d) => { const f = d.users.find((x) => x.id === id); if (f) f.role = r; });

  const remove = () => {
    update((d) => { d.users = d.users.filter((x) => x.id !== del); });
    setDel(null);
    toast("Utilisateur supprimé.", "info");
  };

  const counts: Record<string, number> = { admin: 0, student: 0, supervisor: 0, company: 0 };
  db.users.forEach((x) => (counts[x.role] = (counts[x.role] ?? 0) + 1));

  return (
    <div>
      <PageHeader title="Utilisateurs" subtitle={`${db.users.length} compte(s) au total`} />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["admin", "student", "supervisor", "company"] as Role[]).map((r) => (
          <Card key={r} className="p-4">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts[r]}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[r]}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-5 flex flex-col gap-3 p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher un utilisateur..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-48">
          <option value="all">Tous les rôles</option>
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </Select>
      </Card>

      {list.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={26} />} title="Aucun utilisateur" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Inscrit le</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((x) => (
                  <tr key={x.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={x.name} color={x.avatarColor} size={36} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800 dark:text-slate-100">{x.name}</p>
                          <p className="truncate text-xs text-slate-400">{x.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={x.role} onChange={(e) => changeRole(x.id, e.target.value as Role)} className="h-8 py-0 text-xs">
                        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </Select>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{formatDate(x.createdAt)}</td>
                    <td className="px-4 py-3">
                      {x.active ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Actif</Badge> : <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">Inactif</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title={x.active ? "Désactiver" : "Activer"} onClick={() => toggleActive(x.id)}>
                          {x.active ? <UserX size={16} className="text-amber-500" /> : <UserCheck size={16} className="text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDel(x.id)}><Trash2 size={15} className="text-rose-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!del} onClose={() => setDel(null)} title="Supprimer l'utilisateur" size="sm" footer={<><Button variant="secondary" onClick={() => setDel(null)}>Annuler</Button><Button variant="danger" onClick={remove}>Supprimer</Button></>}>
        <p className="text-sm text-slate-600 dark:text-slate-300">Cette action est irréversible. Voulez-vous vraiment supprimer ce compte ?</p>
      </Modal>
    </div>
  );
}
