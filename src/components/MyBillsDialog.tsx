import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureMyBills } from "@/lib/building-management.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { inr, currentMonth, monthLabel, categoryIcon } from "@/lib/money";
import { notifyAllHosts } from "@/lib/notifications";

type Bill = {
  id: string;
  category_id: string;
  category_name: string;
  amount_due: number;
  penalty_amount: number;
  total_due: number;
  payment_status: string;
  upi_id: string | null;
  qr_code_image: string | null;
};

export function MyBillsDialog({
  buildingId,
  open,
  onOpenChange,
}: {
  buildingId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [bills, setBills] = useState<Bill[]>([]);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});
  const [payBill, setPayBill] = useState<Bill | null>(null);
  const [paying, setPaying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const ensureBills = useServerFn(ensureMyBills);

  const monthOptions = (() => {
    const o: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      o.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return o;
  })();

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const uid = userData.user?.id;
      if (!uid) throw new Error("Please sign in again to view your bills.");

      const { data: ru, error: roomUserError } = await supabase
        .from("room_users")
        .select("room_id")
        .eq("user_id", uid)
        .eq("status", "active");
      if (roomUserError) throw roomUserError;
    let myRoomId: string | null = null;
    if (ru && ru.length) {
      const { data: rms } = await supabase
        .from("rooms")
        .select("id,room_number,building_id")
        .in("id", ru.map((r) => r.room_id))
        .eq("building_id", buildingId);
      const mine = rms?.[0];
      if (mine) {
        myRoomId = mine.id;
        setRoomNumber(mine.room_number);
        setRoomId(mine.id);
      } else {
        setRoomNumber(null);
        setRoomId(null);
      }
    }

      if (!myRoomId) {
        setBills([]);
        return;
      }

      await ensureBills({ data: { buildingId, month } });

      const { data: rs, error: billError } = await supabase
      .from("room_maintenance_status")
      .select(
        "id,category_id,amount_due,penalty_amount,total_due,payment_status",
      )
      .eq("room_id", myRoomId)
      .eq("month", month);
      if (billError) throw billError;

    const catIds = [...new Set((rs || []).map((r) => r.category_id))];
    let catMap: Record<
      string,
      { name: string; upi_id: string | null; qr_code_image: string | null }
    > = {};
    if (catIds.length) {
      const { data: cats } = await supabase
        .from("maintenance_categories")
        .select("id,name,upi_id,qr_code_image")
        .in("id", catIds);
      catMap = Object.fromEntries(
        (cats || []).map((c) => [
          c.id,
          { name: c.name, upi_id: c.upi_id, qr_code_image: c.qr_code_image },
        ]),
      );
    }

    const list: Bill[] = (rs || []).map((r) => ({
      id: r.id,
      category_id: r.category_id,
      category_name: catMap[r.category_id]?.name || "?",
      amount_due: Number(r.amount_due),
      penalty_amount: Number(r.penalty_amount),
      total_due: Number(r.total_due),
      payment_status: r.payment_status,
      upi_id: catMap[r.category_id]?.upi_id || null,
      qr_code_image: catMap[r.category_id]?.qr_code_image || null,
    }));
    setBills(list);

    const urls: Record<string, string> = {};
    for (const bill of list) {
      if (bill.qr_code_image) {
        const { data: signed } = await supabase.storage
          .from("maintenance-qr")
          .createSignedUrl(bill.qr_code_image, 3600);
        if (signed?.signedUrl) urls[bill.id] = signed.signedUrl;
      }
    }
      setQrUrls(urls);
    } catch (error) {
      setBills([]);
      setLoadError(error instanceof Error ? error.message : "Could not load live bills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load();
    const channel = supabase
      .channel(`live-bills-${buildingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_maintenance_status",
          filter: `building_id=eq.${buildingId}`,
        },
        () => void load(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_categories",
          filter: `building_id=eq.${buildingId}`,
        },
        () => void load(),
      )
      .subscribe();
    const refresh = () => void load();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const fallback = window.setInterval(refresh, 15000);
    return () => {
      window.clearInterval(fallback);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, buildingId, month]);

  const requestVerify = async () => {
    if (!payBill) return;
    setPaying(true);
    const { error } = await supabase
      .from("room_maintenance_status")
      .update({
        payment_status: "pending_verification",
        payment_requested_at: new Date().toISOString(),
      })
      .eq("id", payBill.id);
    if (error) {
      setPaying(false);
      return toast.error(error.message);
    }
    await notifyAllHosts(buildingId, {
      type: "payment_request",
      title: "Payment Verification Request",
      message: `Room ${roomNumber} has paid ${payBill.category_name} for ${monthLabel(month)}. Please verify.`,
      related_room_id: roomId,
      related_category_id: payBill.category_id,
      related_month: month,
    });
    setPaying(false);
    toast.success("Request sent! Waiting for host verification.");
    setPayBill(null);
    load();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Maintenance Bills</DialogTitle>
            <DialogDescription>
              {roomNumber ? `Room ${roomNumber}` : "No room assigned"}
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 flex items-end justify-end">
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
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : loadError ? (
            <Card className="p-6">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button className="mt-3" variant="outline" onClick={() => void load()}>
                Try Again
              </Button>
            </Card>
          ) : !roomNumber ? (
            <Card className="p-6 text-muted-foreground">
              You're not assigned to a room in this building. Contact a host to
              be added.
            </Card>
          ) : bills.length === 0 ? (
            <Card className="p-6 text-muted-foreground">
              No bills published for {monthLabel(month)} yet.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bills.map((b) => {
                const statusColor =
                  b.payment_status === "paid"
                    ? "bg-blue-100 text-blue-700"
                    : b.payment_status === "pending_verification"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700";
                const statusLabel =
                  b.payment_status === "paid"
                    ? "🔵 Paid"
                    : b.payment_status === "pending_verification"
                      ? "🟡 Pending"
                      : "🔴 Not Paid";
                return (
                  <Card key={b.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {categoryIcon(b.category_name)}
                        </span>
                        <h3 className="font-semibold">{b.category_name}</h3>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span>{inr(b.amount_due)}</span>
                      </div>
                      {b.penalty_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Penalty</span>
                          <span className="text-red-700">
                            {inr(b.penalty_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-1 font-semibold">
                        <span>Total Due</span>
                        <span className="text-lg">{inr(b.total_due)}</span>
                      </div>
                    </div>
                    {b.payment_status === "not_paid" && (
                      <Button
                        className="mt-3 w-full"
                        onClick={() => setPayBill(b)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!payBill} onOpenChange={(o) => !o && setPayBill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {payBill?.category_name} — {inr(payBill?.total_due ?? 0)}
            </DialogTitle>
            <DialogDescription>
              Scan this QR code to pay via GPay / PhonePe / Paytm
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            {payBill && qrUrls[payBill.id] ? (
              <img
                src={qrUrls[payBill.id]}
                alt="UPI QR"
                className="h-64 w-64 rounded border object-contain"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded border text-sm text-muted-foreground">
                No QR code uploaded
              </div>
            )}
            {payBill?.upi_id && (
              <p className="text-sm">
                UPI:{" "}
                <span className="font-mono font-semibold">
                  {payBill.upi_id}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayBill(null)}>
              Cancel
            </Button>
            <Button onClick={requestVerify} disabled={paying}>
              {paying && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              I Have Paid — Send Verification Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
