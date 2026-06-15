import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessagesSquare, Send } from "lucide-react";
import { useApp } from "../store/AppContext";
import { Avatar, Card, EmptyState, Input, PageHeader } from "../components/ui";
import { userById } from "../lib/selectors";
import { timeAgo, uid } from "../lib/format";

export default function Chat() {
  const { db, user, update } = useApp();
  const [activeId, setActiveId] = useState<string>("");
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const myConvs = useMemo(
    () => db.conversations.filter((c) => c.participantIds.includes(user?.id ?? "")),
    [db.conversations, user]
  );

  useEffect(() => {
    if (!activeId && myConvs[0]) setActiveId(myConvs[0].id);
  }, [myConvs, activeId]);

  const active = myConvs.find((c) => c.id === activeId);
  const messages = db.messages
    .filter((m) => m.conversationId === activeId)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  if (!user) return null;
  const u = user!;

  const otherName = (participantIds: string[]) => {
    const other = participantIds.filter((p) => p !== u.id).map((p) => userById(db, p)?.name ?? "?");
    return other.join(", ") || "Conversation";
  };
  const otherUser = (participantIds: string[]) => userById(db, participantIds.find((p) => p !== u.id) ?? "");

  const send = () => {
    if (!text.trim() || !active) return;
    update((d) => {
      d.messages.push({ id: uid("m"), conversationId: active.id, senderId: u.id, text: text.trim(), createdAt: new Date().toISOString() });
    });
    setText("");
  };

  return (
    <div>
      <PageHeader title="Messagerie" subtitle="Chat stagiaire ↔ encadrant / entreprise (temps réel)" />

      {myConvs.length === 0 ? (
        <EmptyState icon={<MessagesSquare size={26} />} title="Aucune conversation" description="Vos conversations apparaîtront ici lorsqu'un stage sera affecté." />
      ) : (
        <Card className="grid h-[calc(100vh-13rem)] grid-cols-1 overflow-hidden sm:grid-cols-[18rem_1fr]">
          {/* List */}
          <div className={`border-r border-slate-100 overflow-y-auto dark:border-slate-800 ${active ? "hidden sm:block" : "block"}`}>
            {myConvs.map((c) => {
              const last = db.messages.filter((m) => m.conversationId === c.id).slice(-1)[0];
              const ou = otherUser(c.participantIds);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40 ${activeId === c.id ? "bg-brand-50/60 dark:bg-brand-500/10" : ""}`}
                >
                  <Avatar name={otherName(c.participantIds)} color={ou?.avatarColor} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{otherName(c.participantIds)}</p>
                    <p className="truncate text-xs text-slate-400">{last ? last.text : "Démarrez la conversation"}</p>
                  </div>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                </button>
              );
            })}
          </div>

          {/* Thread */}
          <div className={`flex flex-col ${active ? "flex" : "hidden sm:flex"}`}>
            {active && (
              <>
                <div className="flex items-center gap-2 border-b border-slate-100 p-3 dark:border-slate-800">
                  <button onClick={() => setActiveId("")} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"><ArrowLeft size={18} /></button>
                  <Avatar name={otherName(active.participantIds)} color={otherUser(active.participantIds)?.avatarColor} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{otherName(active.participantIds)}</p>
                    <p className="text-xs text-emerald-500">● En ligne</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
                  {messages.map((m) => {
                    const mine = m.senderId === u.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200"}`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          <p className={`mt-0.5 text-[10px] ${mine ? "text-brand-100" : "text-slate-400"}`}>{timeAgo(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-800">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Écrivez un message..."
                    className="flex-1"
                  />
                  <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50" disabled={!text.trim()}>
                    <Send size={17} />
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
