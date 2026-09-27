import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { inr } from "@/lib/money";
import { timeAgo, notifIcon, createNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/building/$id_/notifications")({
  head: () => ({ meta: [{ title: "Notifications — BuildingCare" }] }),
  component: NotificationsPage,
});

type Notif = {
  id: string;
  building_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_room_id: string | null;
  related_category_id: string | null;
  related_month: string | null;
  created_at: string;
};

type VerifyTarget = {
  statusId: string;
  roomNumber: string;
  categoryName: string;
  month: string | null;
  totalDue: number;
  requestedAt: string | null;
  notifId: string;
};

function NotificationsPage() {
  const { id } = useParams({ strict: false });
  if (!id) return null;

  return <NotificationsContent id={id} />;
}

function NotificationsContent({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [buildingName, setBuildingName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [verify, setVerify] = useState<VerifyTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    const [{ data: b }, { data: hosts }, { data: ns }] = await Promise.all([
      supabase.from("buildings").select("name").eq("id", id).maybeSingle(),
      supabase.from("hosts").select("user_id,status").eq("building_id", id),
      supabase
        .from("notifications")
        .select("*")
        .eq("building_id", id)
        .eq("receiver_id", uid!)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setBuildingName(b?.name ?? "");
    setIsHost(!!hosts?.find((h) => h.user_id === uid && h.status === "active"));
    setNotifs((ns as Notif[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const markRead = async (n: Notif) => {
    if (n.is_read) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    setNotifs((cur) => cur.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
  };

  const markAllRead = async () => {
    const { data: u } = await supabase.auth.getUser();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("building_id", id)
      .eq("receiver_id", u.user?.id ?? "")
      .eq("is_read", false);
    setNotifs((cur) => cur.map((x) => ({ ...x, is_read: true })));
    toast.success("All marked as read");
  };

  const openVerify = async (n: Notif) => {
    await markRead(n);
    if (!n.related_room_id || !n.related_category_id || !n.related_month) {
      toast.error("Missing details");
      return;
    }
    const [{ data: rms }, { data: room }, { data: cat }] = await Promise.all([
      supabase
        .from("room_maintenance_status")
        .select("id,total_due,payment_status,payment_requested_at")
        .eq("room_id", n.related_room_id)
        .eq("category_id", n.related_category_id)
        .eq("month", n.related_month)
        .maybeSingle(),
      supabase.from("rooms").select("room_number").eq("id", n.related_room_id).maybeSingle(),
      supabase
        .from("maintenance_categories")
        .select("name")
        .eq("id", n.related_category_id)
        .maybeSingle(),
    ]);
    if (!rms) return toast.error("Bill no longer exists");
    if (rms.payment_status !== "pending_verification") {
      toast.message("Already handled");
      load();
      return;
    }
    setVerify({
      statusId: rms.id,
      roomNumber: room?.room_number || "?",
      categoryName: cat?.name || "?",
      month: n.related_month,
      totalDue: Number(rms.total_due),
      requestedAt: rms.payment_requested_at,
      notifId: n.id,
    });
  };

  const doVerify = async () => {
    if (!verify) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const userId = u.user?.id;
    if (!userId) {
      setBusy(false);
      return;
    }
    const { data: host } = await supabase
      .from("hosts")
      .select("id,user_id")
      .eq("building_id", id)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    const { error } = await supabase
      .from("room_maintenance_status")
      .update({
        payment_status: "paid",
        verified_at: new Date().toISOString(),
        verified_by: host?.user_id ?? null,
      })
      .eq("id", verify.statusId);
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    // Notify the flat owner(s)
    const roomId = await getRoomIdFromStatus(verify.statusId);
    if (roomId) {
      const { data: ru } = await supabase
        .from("room_users")
        .select("user_id")
        .eq("room_id", roomId)
        .eq("status", "active");
      const ownerIds = (ru || []).map((r) => r.user_id);
      if (ownerIds.length) {
        await createNotifications(
          ownerIds.map((uid) => ({
            building_id: id,
            receiver_id: uid,
            type: "payment_verified" as const,
            title: "Payment Verified ✅",
            message: `Your payment for ${verify.categoryName} ${verify.month} has been verified by host. Blue tick applied.`,
            related_month: verify.month,
          })),
        );
      }
    }

    setBusy(false);
    setVerify(null);
    toast.success("Payment verified");
    load();
  };

  const doReject = async () => {
    if (!verify) return;
    setBusy(true);
    const { error } = await supabase
      .from("room_maintenance_status")
      .update({ payment_status: "not_paid", payment_requested_at: null })
      .eq("id", verify.statusId);
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    const roomId = await getRoomIdFromStatus(verify.statusId);
    if (roomId) {
      const { data: ru } = await supabase
        .from("room_users")
        .select("user_id")
        .eq("room_id", roomId)
        .eq("status", "active");
      const ownerIds = (ru || []).map((r) => r.user_id);
      if (ownerIds.length) {
        await createNotifications(
          ownerIds.map((uid) => ({
            building_id: id,
            receiver_id: uid,
            type: "payment_rejected" as const,
            title: "Payment Rejected ❌",
            message: `Your payment request for ${verify.categoryName} ${verify.month} was rejected.${
              rejectReason ? ` Reason: ${rejectReason}.` : ""
            } Please pay again.`,
            related_month: verify.month,
          })),
        );
      }
    }
    setBusy(false);
    setRejectOpen(false);
    setRejectReason("");
    setVerify(null);
    toast.success("Payment rejected");
    load();
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/building/$id" params={{ id }} className="hover:text-foreground">
          {buildingName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Notifications</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No notifications yet.</Card>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-colors ${
                !n.is_read ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{notifIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <div className="mt-2 flex gap-2">
                    {isHost && n.type === "payment_request" && (
                      <Button size="sm" onClick={() => openVerify(n)}>
                        View &amp; Verify
                      </Button>
                    )}
                    {!n.is_read && (
                      <Button size="sm" variant="ghost" onClick={() => markRead(n)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!verify && !rejectOpen} onOpenChange={(o) => !o && setVerify(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Payment Request</DialogTitle>
            <DialogDescription>
              ⚠️ Please check your UPI / Bank account history before verifying.
            </DialogDescription>
          </DialogHeader>
          {verify && (
            <div className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span className="font-medium">{verify.roomNumber}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{verify.categoryName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Month</span><span className="font-medium">{verify.month}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold">{inr(verify.totalDue)}</span></div>
              {verify.requestedAt && (
                <div className="flex justify-between"><span className="text-muted-foreground">Requested</span><span>{new Date(verify.requestedAt).toLocaleString("en-IN")}</span></div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setVerify(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={busy}>
              ❌ Reject
            </Button>
            <Button onClick={doVerify} disabled={busy}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}✅ Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Provide an optional reason. Status will revert to Not Paid.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doReject} disabled={busy}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function getRoomIdFromStatus(statusId: string): Promise<string | null> {
  const { data } = await supabase
    .from("room_maintenance_status")
    .select("room_id")
    .eq("id", statusId)
    .maybeSingle();
  return data?.room_id ?? null;
}
