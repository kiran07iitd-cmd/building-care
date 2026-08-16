import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getMonthlyBillingData,
  decidePaymentVerification,
  resetMonthlyBilling,
} from "@/lib/building-management.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { inr, currentMonth, monthLabel, categoryIcon } from "@/lib/money";
import { createNotifications } from "@/lib/notifications";

type Category = {
  id: string;
  name: string;
  total_amount: number;
  per_room_amount: number;
  penalty_amount: number;
};

type Row = {
  id: string;
  room_number: string;
  category_id: string;
  category_name: string;
  amount_due: number;
  penalty_amount: number;
  total_due: number;
  payment_status: string;
  payment_requested_at: string | null;
  verified_at: string | null;
};

export function MonthlyBillingDialog({
  buildingId,
  open,
  onOpenChange,
}: {
  buildingId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const load = useServerFn(getMonthlyBillingData);
  const decide = useServerFn(decidePaymentVerification);
  const reset = useServerFn(resetMonthlyBilling);

  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoomCount, setActiveRoomCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const monthOptions = useMemo(() => {
    const opts: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return opts;
  }, []);

  const refresh = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await load({ data: { buildingId, month } });
        setActiveRoomCount(res.activeRoomCount);
        setCategories(res.categories);
        setRows(res.rows);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load billing data");
      } finally {
        setLoading(false);
      }
    },
    [buildingId, month, load],
  );

  useEffect(() => {
    if (!open) return;
    void refresh();
    const channel = supabase
      .channel(`monthly-billing-${buildingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_maintenance_status",
          filter: `building_id=eq.${buildingId}`,
        },
        () => void refresh(true),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_categories",
          filter: `building_id=eq.${buildingId}`,
        },
        () => void refresh(true),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, buildingId, month, refresh]);

  const counts = {
    paid: rows.filter((r) => r.payment_status === "paid").length,
    pending: rows.filter((r) => r.payment_status === "pending_verification").length,
    unpaid: rows.filter((r) => r.payment_status === "not_paid").length,
  };
  const collected = rows
    .filter((r) => r.payment_status === "paid")
    .reduce((s, r) => s + r.total_due, 0);
  const expected = rows.reduce((s, r) => s + r.total_due, 0);
  const pendingRows = rows.filter((r) => r.payment_status === "pending_verification");

  const handleDecide = async (row: Row, approve: boolean) => {
    setBusyId(row.id);
    try {
      await decide({ data: { buildingId, statusId: row.id, approve } });
      const { data: room } = await supabase
        .from("rooms")
        .select("id")
        .eq("building_id", buildingId)
        .eq("room_number", row.room_number)
        .maybeSingle();
      const { data: ru } = room
        ? await supabase
            .from("room_users")
            .select("user_id")
            .eq("room_id", room.id)
            .eq("status", "active")
        : { data: null };
      const resident = ru?.[0];

      if (resident) {
        await createNotifications([
          {
            building_id: buildingId,
            receiver_id: resident.user_id,
            type: approve ? "payment_verified" : "payment_request",
            title: approve ? "Payment verified" : "Payment not verified",
            message: approve
              ? `Your ${row.category_name} payment of ${inr(row.total_due)} for ${monthLabel(month)} was verified.`
              : `Your ${row.category_name} payment for ${monthLabel(month)} was marked as not received. Please try again.`,
            related_category_id: row.category_id,
            related_month: month,
          },
        ]);
      }
      toast.success(approve ? "Payment verified" : "Marked as not paid");
      await refresh(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await reset({ data: { buildingId, month } });
      toast.success(`${monthLabel(month)} billing reset`);
      setConfirmReset(false);
      await refresh(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monthly Billing</DialogTitle>
            <DialogDescription>
              Auto-generated from your Manage Maintenance charges. A fresh cycle
              starts automatically each month.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label className="text-xs">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {monthLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset This Month
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <Card className="p-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button className="mt-3" variant="outline" onClick={() => void refresh()}>
                Try Again
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Active Rooms</p>
                  <p className="mt-1 text-xl font-bold">{activeRoomCount}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="mt-1 text-xl font-bold text-yellow-700">{counts.pending}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="mt-1 text-xl font-bold text-blue-700">{counts.paid}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="mt-1 text-xl font-bold">
                    {inr(collected)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      / {inr(expected)}
                    </span>
                  </p>
                </Card>
              </div>

              {pendingRows.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Pending Verification ({pendingRows.length})
                  </h3>
                  <Card className="overflow-hidden">
                    <ul className="divide-y">
                      {pendingRows.map((r) => (
                        <li
                          key={r.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              Room {r.room_number} · {r.category_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {inr(r.total_due)}
                              {r.payment_requested_at
                                ? ` · ${new Date(r.payment_requested_at).toLocaleString("en-IN")}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === r.id}
                              onClick={() => void handleDecide(r, false)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              disabled={busyId === r.id}
                              onClick={() => void handleDecide(r, true)}
                            >
                              {busyId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {categories.length === 0 ? (
                <Card className="p-6 text-sm text-muted-foreground">
                  No active maintenance charges. Add one in Manage Maintenance first.
                </Card>
              ) : (
                <div className="space-y-3">
                  {categories.map((c) => {
                    const catRows = rows.filter((r) => r.category_id === c.id);
                    const paid = catRows.filter((r) => r.payment_status === "paid").length;
                    const pending = catRows.filter(
                      (r) => r.payment_status === "pending_verification",
                    ).length;
                    const unpaid = catRows.filter((r) => r.payment_status === "not_paid").length;
                    return (
                      <Card key={c.id} className="p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{categoryIcon(c.name)}</span>
                            <h3 className="font-semibold">{c.name}</h3>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Per room </span>
                            <span className="font-semibold text-primary">
                              {inr(c.per_room_amount)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="flex items-center gap-1 text-blue-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {paid} paid
                          </span>
                          <span className="flex items-center gap-1 text-yellow-700">
                            <Clock className="h-3.5 w-3.5" /> {pending} pending
                          </span>
                          <span className="flex items-center gap-1 text-red-700">
                            <XCircle className="h-3.5 w-3.5" /> {unpaid} unpaid
                          </span>
                          <span className="text-muted-foreground">
                            Total {inr(c.total_amount)} · Penalty {inr(c.penalty_amount)}
                          </span>
                        </div>
                        {catRows.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {catRows.map((r) => (
                              <span
                                key={r.id}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  r.payment_status === "paid"
                                    ? "bg-blue-100 text-blue-700"
                                    : r.payment_status === "pending_verification"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {r.room_number}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={(o) => !o && setConfirmReset(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset {monthLabel(month)} billing?</DialogTitle>
            <DialogDescription>
              This clears all bills and payment statuses for this month and
              regenerates them fresh from your current maintenance charges.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleReset()} disabled={resetting}>
              {resetting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Reset Billing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
