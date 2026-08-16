import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getBuildingDirectory } from "@/lib/building-management.functions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Message = {
  id: string;
  building_id: string;
  resident_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ThreadItem = {
  resident_id: string;
  name: string | null;
  email: string | null;
  room_number: string | null;
  last_message: string | null;
  last_at: string | null;
};

export function ChatDialog({
  buildingId,
  open,
  onOpenChange,
}: {
  buildingId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [me, setMe] = useState<string | null>(null);
  const [role, setRole] = useState<"host" | "resident" | "none" | null>(null);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeResident, setActiveResident] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const getDirectory = useServerFn(getBuildingDirectory);


  const loadHostThreads = async () => {
    const directory = await getDirectory({ data: { buildingId } });
    const residents = directory.residents;
    if (!residents.length) return setThreads([]);
    const residentIds = residents.map((r) => r.user_id);
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("resident_id,content,created_at")
      .eq("building_id", buildingId)
      .in("resident_id", residentIds)
      .order("created_at", { ascending: false });
    const lastByResident: Record<string, { content: string; at: string }> = {};
    (msgs || []).forEach((m) => {
      if (!lastByResident[m.resident_id])
        lastByResident[m.resident_id] = { content: m.content, at: m.created_at };
    });
    const list: ThreadItem[] = residents.map((r) => ({
      resident_id: r.user_id,
      name: r.name,
      email: r.email,
      room_number: r.room_number,
      last_message: lastByResident[r.user_id]?.content ?? null,
      last_at: lastByResident[r.user_id]?.at ?? null,
    }));
    list.sort((a, b) => (b.last_at || "").localeCompare(a.last_at || ""));
    setThreads(list);
  };


  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setActiveResident(null);
    setMessages([]);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMe(uid);
      if (!uid) {
        setRole("none");
        setLoading(false);
        return;
      }
      const { data: host } = await supabase
        .from("hosts")
        .select("id")
        .eq("building_id", buildingId)
        .eq("user_id", uid)
        .eq("status", "active")
        .maybeSingle();
      if (host) {
        setRole("host");
        await loadHostThreads();
      } else {
        const { data: ru } = await supabase
          .from("room_users")
          .select("room_id")
          .eq("user_id", uid)
          .eq("status", "active");
        const roomIds = (ru || []).map((r) => r.room_id);
        let isResident = false;
        if (roomIds.length) {
          const { data: rms } = await supabase
            .from("rooms")
            .select("id")
            .in("id", roomIds)
            .eq("building_id", buildingId);
          isResident = !!(rms && rms.length);
        }
        if (isResident) {
          setRole("resident");
          setActiveResident(uid);
        } else {
          setRole("none");
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, buildingId]);

  const loadMessages = async (resident_id: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("building_id", buildingId)
      .eq("resident_id", resident_id)
      .order("created_at", { ascending: true });
    if (error) return;
    setMessages((data as Message[]) || []);
  };

  useEffect(() => {
    if (!open || !activeResident) return;
    loadMessages(activeResident);
    const t = setInterval(() => loadMessages(activeResident), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResident, open, buildingId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body || !me || !activeResident) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      building_id: buildingId,
      resident_id: activeResident,
      sender_id: me,
      content: body,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
    loadMessages(activeResident);
    if (role === "host") loadHostThreads();
  };

  const activeThread = useMemo(
    () => threads.find((t) => t.resident_id === activeResident) || null,
    [threads, activeResident],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle>
            {role === "resident" ? "Chat with Hosts" : "Messages"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Direct messages between hosts and residents.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : role === "none" ? (
          <div className="p-6 text-sm text-muted-foreground">
            You don't have access to chat in this building.
          </div>
        ) : (
          <div className="grid h-[70vh] grid-cols-1 md:grid-cols-[240px_1fr]">
            {role === "host" && (
              <div
                className={`border-r overflow-y-auto ${
                  activeResident ? "hidden md:block" : ""
                }`}
              >
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  RESIDENTS
                </div>
                {threads.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No residents yet.
                  </div>
                ) : (
                  <ul>
                    {threads.map((t) => (
                      <li key={t.resident_id}>
                        <button
                          className={`flex w-full items-start gap-2 border-b px-3 py-2 text-left hover:bg-accent ${
                            activeResident === t.resident_id ? "bg-accent" : ""
                          }`}
                          onClick={() => setActiveResident(t.resident_id)}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {(t.name || t.email || "?")[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {t.name || t.email || "Resident"}
                              {t.room_number && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  · Room {t.room_number}
                                </span>
                              )}
                            </div>
                            {t.last_message && (
                              <div className="line-clamp-1 text-xs text-muted-foreground">
                                {t.last_message}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex flex-col">
              {role === "host" && !activeResident ? (
                <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
                  Select a resident to start chatting.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    {role === "host" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setActiveResident(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="text-sm font-semibold">
                      {role === "resident"
                        ? "Hosts"
                        : activeThread?.name ||
                          activeThread?.email ||
                          "Resident"}
                      {role === "host" && activeThread?.room_number && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          Room {activeThread.room_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto bg-muted/20 p-3">
                    {messages.length === 0 ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        No messages yet. Say hi 👋
                      </div>
                    ) : (
                      messages.map((m) => {
                        const mine = m.sender_id === me;
                        return (
                          <div
                            key={m.id}
                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                mine
                                  ? "rounded-br-sm bg-primary text-primary-foreground"
                                  : "rounded-bl-sm bg-background border"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {m.content}
                              </div>
                              <div
                                className={`mt-1 text-[10px] ${
                                  mine ? "opacity-70" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(m.created_at).toLocaleString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "short",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={endRef} />
                  </div>
                  <div className="flex gap-2 border-t p-3">
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Message…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <Button onClick={send} disabled={sending || !text.trim()}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
