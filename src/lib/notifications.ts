import { supabase } from "@/integrations/supabase/client";

export type NotifType =
  | "payment_request"
  | "payment_verified"
  | "payment_rejected"
  | "host_request"
  | "maintenance_published"
  | "penalty_applied"
  | "auto_published";

export type NewNotification = {
  building_id: string;
  receiver_id: string;
  type: NotifType;
  title: string;
  message: string;
  related_room_id?: string | null;
  related_category_id?: string | null;
  related_month?: string | null;
};

export async function createNotifications(rows: NewNotification[]) {
  if (!rows.length) return;
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) console.error("notif insert", error.message);
}

export async function notifyAllHosts(
  buildingId: string,
  notif: Omit<NewNotification, "building_id" | "receiver_id">,
) {
  const { data: hosts } = await supabase
    .from("hosts")
    .select("user_id")
    .eq("building_id", buildingId)
    .eq("status", "active");
  const rows = (hosts || []).map((h) => ({
    ...notif,
    building_id: buildingId,
    receiver_id: h.user_id,
  }));
  await createNotifications(rows);
}

export function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function notifIcon(type: string) {
  switch (type) {
    case "payment_request":
      return "💸";
    case "payment_verified":
      return "🔵";
    case "payment_rejected":
      return "❌";
    case "host_request":
      return "👥";
    case "maintenance_published":
      return "📢";
    case "penalty_applied":
      return "⚠️";
    case "auto_published":
      return "🔄";
    default:
      return "🔔";
  }
}
