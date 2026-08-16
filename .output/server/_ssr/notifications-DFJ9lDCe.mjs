import { s as supabase } from "./client-DjU25MuW.mjs";
async function createNotifications(rows) {
  if (!rows.length) return;
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) console.error("notif insert", error.message);
}
async function notifyAllHosts(buildingId, notif) {
  const { data: hosts } = await supabase.from("hosts").select("user_id").eq("building_id", buildingId).eq("status", "active");
  const rows = (hosts || []).map((h) => ({
    ...notif,
    building_id: buildingId,
    receiver_id: h.user_id
  }));
  await createNotifications(rows);
}
function timeAgo(iso) {
  const then = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - then) / 1e3);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function notifIcon(type) {
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
export {
  notifIcon as a,
  createNotifications as c,
  notifyAllHosts as n,
  timeAgo as t
};
