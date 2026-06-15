import { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Badge, Button, Card, EmptyState, PageHeader, Tabs } from "../components/ui";
import { timeAgo } from "../lib/format";

const ICONS: Record<string, string> = {
  success: "✅", info: "ℹ️", warning: "⚠️", application: "📨", report: "📝", eval: "⭐", soutenance: "🎯",
};

export default function Notifications() {
  const { db, user, update, toast } = useApp();
  const [tab, setTab] = useState("all");

  if (!user) return null;
  let items = db.notifications.filter((n) => n.userId === user.id);
  items = [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const unread = items.filter((n) => !n.read).length;
  const filtered = tab === "all" ? items : items.filter((n) => !n.read);

  const markAll = () => update((d) => { d.notifications.forEach((n) => { if (n.userId === user.id) n.read = true; }); });
  const mark = (id: string) => update((d) => { const f = d.notifications.find((n) => n.id === id); if (f) f.read = !f.read; });
  const remove = (id: string) => { update((d) => { d.notifications = d.notifications.filter((n) => n.id !== id); }); toast("Notification supprimée.", "info"); };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} non lue(s) sur ${items.length}`}
        actions={unread > 0 ? <Button variant="outline" onClick={markAll}><CheckCheck size={16} /> Tout marquer lu</Button> : undefined}
      />

      <Tabs active={tab} onChange={setTab} tabs={[{ id: "all", label: "Toutes", count: items.length }, { id: "unread", label: "Non lues", count: unread }]} />

      <div className="mt-5 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState icon={<Bell size={26} />} title="Aucune notification" description="Vous êtes à jour ! 🎉" />
        ) : (
          filtered.map((n) => (
            <Card key={n.id} className={`flex items-start gap-3 p-4 transition ${!n.read ? "border-brand-200 bg-brand-50/40 dark:border-brand-500/30 dark:bg-brand-500/5" : ""}`}>
              <span className="mt-0.5 text-xl">{ICONS[n.type] ?? "🔔"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                  {!n.read && <Badge className="bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">Nouveau</Badge>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => mark(n.id)} title={n.read ? "Marquer non lu" : "Marquer lu"}>
                  <CheckCheck size={15} className={n.read ? "text-slate-300" : "text-emerald-500"} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(n.id)}><Trash2 size={15} className="text-rose-400" /></Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
