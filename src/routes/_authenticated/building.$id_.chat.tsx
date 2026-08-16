import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Loader2, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/building/$id_/chat")({
  head: () => ({ meta: [{ title: "Chat — BuildingCare" }] }),
  component: ChatPage,
});

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

function ChatPage() {
  const { id } = useParams({ from: "/_authenticated/building/$id_/chat" });
  const [me, setMe] = useState<string | null>(null);
  const [buildingName, setBuildingName] = useState("");
  const [role, setRole] = useState<"host" | "resident" | "none" | null>(null);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeResident, setActiveResident] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  // bootstrap: role + threads
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMe(uid);
      const { data: b } = await supabase
        .from("buildings")
        .select("name")
        .eq("id", id)
        .maybeSingle();
      setBuildingName(b?.name ?? "");
      if (!uid) {
        setRole("none");
        setLoading(false);
        return;
      }
      const { data: host } = await supabase
        .from("hosts")
        .select("id")
        .eq("building_id", id)
        .eq("user_id", uid)
        .eq("status", "active")
        .maybeSingle();
      if (host) {
        setRole("host");
        await loadHostThreads();
      } else {
        // resident?
        const { data: ru } = await supabase
          .from("room_users")
          .select("room_id, rooms!inner(building_id)")
          .eq("user_id", uid)
          .eq("status", "active");
        const isResident = (ru || []).some(
          (r: any) => r.rooms?.building_id === id,
        );
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
  }, [id]);

  const loadHostThreads = async () => {
    // All residents in the building (active room_users)
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id,room_number")
      .eq("building_id", id);
    const roomIds = (rooms || []).map((r) => r.id);
    if (!roomIds.length) return setThreads([]);
    const { data: ru } = await supabase
      .from("room_users")
      .select("user_id, room_id")
      .in("room_id", roomIds)
      .eq("status", "active");
    const residentIds = [...new Set((ru || []).map((r) => r.user_id))];
    if (!residentIds.length) return setThreads([]);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,name,email")
      .in("id", residentIds);
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("resident_id,content,created_at")
      .eq("building_id", id)
      .in("resident_id", residentIds)
      .order("created_at", { ascending: false });
    const roomByUser: Record<string, string> = {};
    (ru || []).forEach((r) => {
      const rn = rooms?.find((rr) => rr.id === r.room_id)?.room_number ?? null;
      if (rn) roomByUser[r.user_id] = rn;
    });
    const lastByResident: Record<string, { content: string; at: string }> = {};
    (msgs || []).forEach((m) => {
      if (!lastByResident[m.resident_id])
        lastByResident[m.resident_id] = { content: m.content, at: m.created_at };
    });
    const list: ThreadItem[] = residentIds.map((rid) => {
      const p = profiles?.find((x) => x.id === rid);
      return {
        resident_id: rid,
        name: p?.name ?? null,
        email: p?.email ?? null,
        room_number: roomByUser[rid] ?? null,
        last_message: lastByResident[rid]?.content ?? null,
        last_at: lastByResident[rid]?.at ?? null,
      };
    });
    list.sort((a, b) => (b.last_at || "").localeCompare(a.last_at || ""));
    setThreads(list);
  };

  const loadMessages = async (resident_id: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("building_id", id)
      .eq("resident_id", resident_id)
      .order("created_at", { ascending: true });
    if (error) return;
    setMessages((data as Message[]) || []);
  };

  useEffect(() => {
    if (!activeResident) return;
    loadMessages(activeResident);
    const t = setInterval(() => loadMessages(activeResident), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResident, id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body || !me || !activeResident) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      building_id: id,
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

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (role === "none") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-muted-foreground">
          You don't have access to chat in this building. You must be an active
          host or an assigned resident.
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/building/$id" params={{ id }} className="hover:text-foreground">
          {buildingName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Chat</span>
      </nav>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        {role === "host" && (
          <Card className={`p-2 ${activeResident ? "hidden md:block" : ""}`}>
            <div className="mb-2 px-2 pt-2 text-sm font-semibold">Residents</div>
            {threads.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No residents yet.
              </div>
            ) : (
              <ul className="space-y-1">
                {threads.map((t) => (
                  <li key={t.resident_id}>
                    <button
                      className={`w-full rounded px-2 py-2 text-left hover:bg-accent ${
                        activeResident === t.resident_id ? "bg-accent" : ""
                      }`}
                      onClick={() => setActiveResident(t.resident_id)}
                    >
                      <div className="text-sm font-medium">
                        {t.name || t.email || "Resident"}
                        {t.room_number && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Room {t.room_number}
                          </span>
                        )}
                      </div>
                      {t.last_message && (
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {t.last_message}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Card className="flex h-[70vh] flex-col">
          {role === "host" && !activeResident ? (
            <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
              Select a resident to start chatting.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b p-3">
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
                    ? "Chat with Hosts"
                    : activeThread?.name || activeThread?.email || "Resident"}
                  {role === "host" && activeThread?.room_number && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Room {activeThread.room_number}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
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
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            mine
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
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
                            {new Date(m.created_at).toLocaleString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                            })}
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
                  placeholder="Type a message…"
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
        </Card>
      </div>
    </div>
  );
}
