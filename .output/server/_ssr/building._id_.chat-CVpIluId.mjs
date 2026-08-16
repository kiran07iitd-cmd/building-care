import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DjU25MuW.mjs";
import { C as Card } from "./card-B-aHHzDY.mjs";
import { B as Button } from "./button-BXrfXN_b.mjs";
import { I as Input } from "./input-DwaGuH4D.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as LoaderCircle, c as ChevronRight, A as ArrowLeft, s as Send } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function ChatPage() {
  const {
    id
  } = useParams({
    from: "/_authenticated/building/$id_/chat"
  });
  const [me, setMe] = reactExports.useState(null);
  const [buildingName, setBuildingName] = reactExports.useState("");
  const [role, setRole] = reactExports.useState(null);
  const [threads, setThreads] = reactExports.useState([]);
  const [activeResident, setActiveResident] = reactExports.useState(null);
  const [messages, setMessages] = reactExports.useState([]);
  const [text, setText] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMe(uid);
      const {
        data: b
      } = await supabase.from("buildings").select("name").eq("id", id).maybeSingle();
      setBuildingName(b?.name ?? "");
      if (!uid) {
        setRole("none");
        setLoading(false);
        return;
      }
      const {
        data: host
      } = await supabase.from("hosts").select("id").eq("building_id", id).eq("user_id", uid).eq("status", "active").maybeSingle();
      if (host) {
        setRole("host");
        await loadHostThreads();
      } else {
        const {
          data: ru
        } = await supabase.from("room_users").select("room_id, rooms!inner(building_id)").eq("user_id", uid).eq("status", "active");
        const isResident = (ru || []).some((r) => r.rooms?.building_id === id);
        if (isResident) {
          setRole("resident");
          setActiveResident(uid);
        } else {
          setRole("none");
        }
      }
      setLoading(false);
    })();
  }, [id]);
  const loadHostThreads = async () => {
    const {
      data: rooms
    } = await supabase.from("rooms").select("id,room_number").eq("building_id", id);
    const roomIds = (rooms || []).map((r) => r.id);
    if (!roomIds.length) return setThreads([]);
    const {
      data: ru
    } = await supabase.from("room_users").select("user_id, room_id").in("room_id", roomIds).eq("status", "active");
    const residentIds = [...new Set((ru || []).map((r) => r.user_id))];
    if (!residentIds.length) return setThreads([]);
    const {
      data: profiles
    } = await supabase.from("profiles").select("id,name,email").in("id", residentIds);
    const {
      data: msgs
    } = await supabase.from("chat_messages").select("resident_id,content,created_at").eq("building_id", id).in("resident_id", residentIds).order("created_at", {
      ascending: false
    });
    const roomByUser = {};
    (ru || []).forEach((r) => {
      const rn = rooms?.find((rr) => rr.id === r.room_id)?.room_number ?? null;
      if (rn) roomByUser[r.user_id] = rn;
    });
    const lastByResident = {};
    (msgs || []).forEach((m) => {
      if (!lastByResident[m.resident_id]) lastByResident[m.resident_id] = {
        content: m.content,
        at: m.created_at
      };
    });
    const list = residentIds.map((rid) => {
      const p = profiles?.find((x) => x.id === rid);
      return {
        resident_id: rid,
        name: p?.name ?? null,
        email: p?.email ?? null,
        room_number: roomByUser[rid] ?? null,
        last_message: lastByResident[rid]?.content ?? null,
        last_at: lastByResident[rid]?.at ?? null
      };
    });
    list.sort((a, b) => (b.last_at || "").localeCompare(a.last_at || ""));
    setThreads(list);
  };
  const loadMessages = async (resident_id) => {
    const {
      data,
      error
    } = await supabase.from("chat_messages").select("*").eq("building_id", id).eq("resident_id", resident_id).order("created_at", {
      ascending: true
    });
    if (error) return;
    setMessages(data || []);
  };
  reactExports.useEffect(() => {
    if (!activeResident) return;
    loadMessages(activeResident);
    const t = setInterval(() => loadMessages(activeResident), 4e3);
    return () => clearInterval(t);
  }, [activeResident, id]);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const send = async () => {
    const body = text.trim();
    if (!body || !me || !activeResident) return;
    setSending(true);
    const {
      error
    } = await supabase.from("chat_messages").insert({
      building_id: id,
      resident_id: activeResident,
      sender_id: me,
      content: body
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
    loadMessages(activeResident);
    if (role === "host") loadHostThreads();
  };
  const activeThread = reactExports.useMemo(() => threads.find((t) => t.resident_id === activeResident) || null, [threads, activeResident]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] });
  }
  if (role === "none") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 text-muted-foreground", children: "You don't have access to chat in this building. You must be an active host or an assigned resident." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-4 flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "hover:text-foreground", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/building/$id", params: {
        id
      }, className: "hover:text-foreground", children: buildingName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Chat" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-[280px_1fr]", children: [
      role === "host" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-2 ${activeResident ? "hidden md:block" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 px-2 pt-2 text-sm font-semibold", children: "Residents" }),
        threads.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 text-sm text-muted-foreground", children: "No residents yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: threads.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `w-full rounded px-2 py-2 text-left hover:bg-accent ${activeResident === t.resident_id ? "bg-accent" : ""}`, onClick: () => setActiveResident(t.resident_id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium", children: [
            t.name || t.email || "Resident",
            t.room_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
              "Room ",
              t.room_number
            ] })
          ] }),
          t.last_message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-1 text-xs text-muted-foreground", children: t.last_message })
        ] }) }, t.resident_id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex h-[70vh] flex-col", children: role === "host" && !activeResident ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground", children: "Select a resident to start chatting." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b p-3", children: [
          role === "host" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: () => setActiveResident(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
            role === "resident" ? "Chat with Hosts" : activeThread?.name || activeThread?.email || "Resident",
            role === "host" && activeThread?.room_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
              "Room ",
              activeThread.room_number
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2 overflow-y-auto p-3", children: [
          messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-10 text-center text-sm text-muted-foreground", children: "No messages yet. Say hi 👋" }) : messages.map((m) => {
            const mine = m.sender_id === me;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${mine ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap break-words", children: m.content }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 text-[10px] ${mine ? "opacity-70" : "text-muted-foreground"}`, children: new Date(m.created_at).toLocaleString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short"
              }) })
            ] }) }, m.id);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-t p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: text, onChange: (e) => setText(e.target.value), placeholder: "Type a message…", onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: send, disabled: sending || !text.trim(), children: sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  ChatPage as component
};
