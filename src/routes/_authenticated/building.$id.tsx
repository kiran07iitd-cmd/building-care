import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  ChevronRight,
  Loader2,
  Wrench,
  Users,
  Bell,
  Plus,
  Building2,
  Camera,
  X,
  UserPlus,
  Check,
  Mail,
  Phone,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { buildingPhotoSignedUrl, uploadBuildingPhoto } from "@/lib/building-photo";
import { notifyAllHosts, createNotifications } from "@/lib/notifications";
import { MaintenanceDialog } from "@/components/MaintenanceDialog";
import { HostsDialog } from "@/components/HostsDialog";

import { ChatDialog } from "@/components/ChatDialog";
import { MyBillsDialog } from "@/components/MyBillsDialog";
import { MonthlyBillingDialog } from "@/components/MonthlyBillingDialog";
import { ContactsDialog } from "@/components/ContactsDialog";
import { BuildingCodeShareCard } from "@/components/BuildingCodeShareCard";

import { useServerFn } from "@tanstack/react-start";
import {
  getBillingStats,
  getBuildingResidents,
  promoteResidentToHost,
} from "@/lib/building-management.functions";
import { currentMonth } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/building/$id")({
  head: () => ({ meta: [{ title: "Building — BuildingCare" }] }),
  component: BuildingPage,
});

type Building = {
  id: string;
  name: string;
  location: string;
  unique_code: string;
  host_count: number;
  photo_url: string | null;
};
type Room = { id: string; room_number: string; is_active: boolean };
type JoinRequest = {
  id: string;
  building_id: string;
  requested_by: string;
  room_number: string;
  applicant_name: string;
  applicant_email: string;
  applicant_mobile: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function BuildingPage() {
  const { id } = useParams({ from: "/_authenticated/building/$id" });
  const [building, setBuilding] = useState<Building | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isPrimaryHost, setIsPrimaryHost] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRoom, setNewRoom] = useState("");
  const [showRooms] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [myRequest, setMyRequest] = useState<JoinRequest | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [residents, setResidents] = useState<
    {
      ru_id: string;
      user_id: string;
      room_id: string;
      room_number: string;
      name: string | null;
      email: string | null;
      mobile: string | null;
      is_host: boolean;
    }[]
  >([]);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [removingResidentId, setRemovingResidentId] = useState<string | null>(null);
  const [showResidents, setShowResidents] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showHosts, setShowHosts] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showMyBills, setShowMyBills] = useState(false);

  const [showMonthly, setShowMonthly] = useState(false);
  const [billStats, setBillStats] = useState({ pending: 0, verified: 0, unpaid: 0 });
  const fetchBillStats = useServerFn(getBillingStats);
  const fetchResidents = useServerFn(getBuildingResidents);
  const makeHost = useServerFn(promoteResidentToHost);

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinForm, setJoinForm] = useState({ room_number: "", name: "", email: "", mobile: "" });
  const [joinBusy, setJoinBusy] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    setUserId(uid);

    const [{ data: b, error: be }, { data: hosts }, { data: rs }] = await Promise.all([
      supabase.from("buildings").select("*").eq("id", id).maybeSingle(),
      supabase.from("hosts").select("user_id,status,is_primary").eq("building_id", id),
      supabase
        .from("rooms")
        .select("id,room_number,is_active")
        .eq("building_id", id)
        .order("room_number"),
    ]);

    if (be) toast.error(be.message);
    setBuilding(b as Building | null);
    setPhoto(await buildingPhotoSignedUrl((b as Building | null)?.photo_url));
    const myHost = hosts?.find((h) => h.user_id === uid && h.status === "active");
    const host = !!myHost;
    setIsHost(host);
    setIsPrimaryHost(!!myHost?.is_primary);
    setRooms((rs as Room[]) || []);

    // Membership check
    if (uid && rs && rs.length) {
      const { data: myRoom } = await supabase
        .from("room_users")
        .select("id,room_id")
        .eq("user_id", uid)
        .eq("status", "active")
        .in(
          "room_id",
          (rs as Room[]).map((r) => r.id),
        );
      setIsMember(!!myRoom?.length);
    } else {
      setIsMember(false);
    }

    // Join requests
    if (host) {
      const { data: reqs } = await supabase
        .from("room_join_requests")
        .select("*")
        .eq("building_id", id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setJoinRequests((reqs as JoinRequest[]) || []);
      setMyRequest(null);
    } else if (uid) {
      const { data: mine } = await supabase
        .from("room_join_requests")
        .select("*")
        .eq("building_id", id)
        .eq("requested_by", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setMyRequest((mine as JoinRequest) || null);
      setJoinRequests([]);
    }

    // Residents (active room members) — for host management.
    // Profile rows of other users aren't readable from the browser (RLS),
    // so names/emails come from a trusted server function.
    if (host) {
      try {
        const res = await fetchResidents({ data: { buildingId: id } });
        setResidents(res.residents);
      } catch {
        setResidents([]);
      }
    } else {
      setResidents([]);
    }

    setLoading(false);
  };

  const openJoinDialog = async () => {
    if (!userId) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("name,email,mobile")
      .eq("id", userId)
      .maybeSingle();
    setJoinForm({
      room_number: "",
      name: profile?.name || "",
      email: profile?.email || "",
      mobile: profile?.mobile || "",
    });
    setJoinOpen(true);
  };

  const submitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const room_number = joinForm.room_number.trim();
    if (!room_number) return toast.error("Room number is required");
    if (!joinForm.name.trim() || !joinForm.email.trim() || !joinForm.mobile.trim())
      return toast.error("Name, email and mobile are required");
    setJoinBusy(true);
    try {
      const { error } = await supabase.from("room_join_requests").insert({
        building_id: id,
        requested_by: userId,
        room_number,
        applicant_name: joinForm.name.trim(),
        applicant_email: joinForm.email.trim(),
        applicant_mobile: joinForm.mobile.trim(),
      });
      if (error) throw error;

      await notifyAllHosts(id, {
        type: "host_request",
        title: "New room join request",
        message: `${joinForm.name.trim()} (${joinForm.mobile.trim()}, ${joinForm.email.trim()}) wants to join Room ${room_number}.`,
      });

      toast.success("Request sent to hosts");
      setJoinOpen(false);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't submit request";
      toast.error(
        msg.includes("rjr_one_pending")
          ? "You already have a pending request for this building"
          : msg,
      );
    } finally {
      setJoinBusy(false);
    }
  };

  const cancelMyRequest = async () => {
    if (!myRequest) return;
    const { error } = await supabase.from("room_join_requests").delete().eq("id", myRequest.id);
    if (error) return toast.error(error.message);
    toast.success("Request cancelled");
    load();
  };

  const approveRequest = async (req: JoinRequest) => {
    if (!userId) return;
    setDecidingId(req.id);
    try {
      // Find or create the room
      let room = rooms.find((r) => r.room_number.trim() === req.room_number.trim());
      if (!room) {
        const { data: newRm, error: rErr } = await supabase
          .from("rooms")
          .insert({ building_id: id, room_number: req.room_number.trim(), is_active: true })
          .select("id,room_number,is_active")
          .single();
        if (rErr) throw rErr;
        room = newRm as Room;
      } else if (!room.is_active) {
        await supabase.from("rooms").update({ is_active: true }).eq("id", room.id);
      }

      // Insert active member (unique index enforces one active per room)
      const { error: ruErr } = await supabase.from("room_users").insert({
        room_id: room.id,
        user_id: req.requested_by,
        assigned_by: userId,
        status: "active",
      });
      if (ruErr) {
        if (ruErr.message.toLowerCase().includes("duplicate") || ruErr.code === "23505") {
          throw new Error(
            `Room ${req.room_number} already has an active member. Ask them to pick a different room.`,
          );
        }
        throw ruErr;
      }

      const { error: uErr } = await supabase
        .from("room_join_requests")
        .update({ status: "approved", decided_by: userId, decided_at: new Date().toISOString() })
        .eq("id", req.id);
      if (uErr) throw uErr;

      await createNotifications([
        {
          building_id: id,
          receiver_id: req.requested_by,
          type: "payment_verified",
          title: "Join request approved",
          message: `You've been added to Room ${req.room_number}.`,
          related_room_id: room.id,
        },
      ]);
      toast.success(`Approved — ${req.applicant_name} added to Room ${req.room_number}`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setDecidingId(null);
    }
  };

  const rejectRequest = async (req: JoinRequest) => {
    if (!userId) return;
    setDecidingId(req.id);
    try {
      const { error } = await supabase
        .from("room_join_requests")
        .update({ status: "rejected", decided_by: userId, decided_at: new Date().toISOString() })
        .eq("id", req.id);
      if (error) throw error;
      await createNotifications([
        {
          building_id: id,
          receiver_id: req.requested_by,
          type: "payment_rejected",
          title: "Join request rejected",
          message: `Your request to join Room ${req.room_number} was rejected.`,
        },
      ]);
      toast.success("Request rejected");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setDecidingId(null);
    }
  };

  const promoteResident = async (r: { user_id: string; name: string | null }) => {
    if (
      !confirm(
        `Make ${r.name || "this resident"} a host of this building? They will get full host access.`,
      )
    )
      return;
    setPromotingId(r.user_id);
    try {
      await makeHost({ data: { buildingId: id, userId: r.user_id } });
      toast.success(`${r.name || "Resident"} is now a host`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not make this person a host");
    } finally {
      setPromotingId(null);
    }
  };

  const removeResident = async (r: {
    ru_id: string;
    user_id: string;
    room_id: string;
    room_number: string;
    name: string | null;
  }) => {
    if (!userId) return;
    if (
      !confirm(
        `Remove ${r.name || "this resident"} from Room ${r.room_number}? They will lose access to bills.`,
      )
    )
      return;
    setRemovingResidentId(r.ru_id);
    try {
      const { error } = await supabase
        .from("room_users")
        .update({ status: "removed" })
        .eq("id", r.ru_id);
      if (error) throw error;
      await createNotifications([
        {
          building_id: id,
          receiver_id: r.user_id,
          type: "payment_rejected",
          title: "Removed from building",
          message: `You've been removed from Room ${r.room_number}.`,
          related_room_id: r.room_id,
        },
      ]);
      toast.success(`Removed ${r.name || "resident"} from Room ${r.room_number}`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not remove resident");
    } finally {
      setRemovingResidentId(null);
    }
  };

  useEffect(() => {
    load();
    const fetchUnread = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("building_id", id)
        .eq("receiver_id", u.user.id)
        .eq("is_read", false);
      setUnreadNotifs(count ?? 0);
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 10000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Live payment stats for the current month (hosts only)
  useEffect(() => {
    if (!isHost) return;
    let cancelled = false;
    const loadStats = async () => {
      try {
        const s = await fetchBillStats({ data: { buildingId: id, month: currentMonth() } });
        if (!cancelled)
          setBillStats({ pending: s.pending, verified: s.verified, unpaid: s.unpaid });
      } catch {
        /* ignore */
      }
    };
    void loadStats();
    const channel = supabase
      .channel(`bill-stats-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_maintenance_status",
          filter: `building_id=eq.${id}`,
        },
        () => void loadStats(),
      )
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isHost]);

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim()) return;
    const { error } = await supabase.from("rooms").insert({
      building_id: id,
      room_number: newRoom.trim(),
      is_active: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Room added");
    setNewRoom("");
    load();
  };

  const openEdit = () => {
    if (!building) return;
    setEditName(building.name);
    setEditLocation(building.location);
    setEditPhoto(null);
    setEditPreview(null);
    setRemovePhoto(false);
    setEditOpen(true);
  };

  const onEditPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match(/^image\/(jpeg|jpg|png|webp)$/i))
      return toast.error("Only JPG, PNG or WEBP images allowed");
    if (f.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");
    setEditPhoto(f);
    setEditPreview(URL.createObjectURL(f));
    setRemovePhoto(false);
  };

  const saveEdit = async () => {
    if (!building) return;
    if (!editName.trim() || !editLocation.trim())
      return toast.error("Name and location are required");
    setSavingEdit(true);
    try {
      const update: { name: string; location: string; photo_url?: string | null } = {
        name: editName.trim(),
        location: editLocation.trim(),
      };
      if (editPhoto) {
        const { path } = await uploadBuildingPhoto(editPhoto, building.id);
        update.photo_url = path;
      } else if (removePhoto) {
        update.photo_url = null;
      }
      const { error } = await supabase.from("buildings").update(update).eq("id", building.id);

      if (error) throw error;
      toast.success("Building updated");
      setEditOpen(false);
      load();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Couldn't save changes";
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading building…
      </div>
    );
  }

  if (!building) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">Building not found.</p>
        <Link to="/dashboard" className="text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const activeRooms = rooms.filter((r) => r.is_active).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{building.name}</span>
      </nav>

      <div className="relative mb-6 overflow-hidden rounded-lg border">
        <div className="relative h-[200px] w-full">
          {photo ? (
            <img src={photo} alt={building.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Building2 className="h-16 w-16 opacity-90" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-4 text-white">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold drop-shadow">{building.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                <MapPin className="h-4 w-4" /> {building.location}
              </p>
              <p className="mt-2 inline-block rounded bg-white/20 px-2 py-0.5 font-mono text-xs backdrop-blur">
                {building.unique_code}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${
                isHost ? "bg-primary/80 text-primary-foreground" : "bg-white/30 text-white"
              }`}
            >
              {isPrimaryHost
                ? isMember
                  ? "Primary Host • Flat Owner"
                  : "Primary Host"
                : isHost
                  ? isMember
                    ? "Host • Flat Owner"
                    : "Host"
                  : "Flat Owner"}
            </span>
          </div>
          {isHost && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute right-3 top-3"
              onClick={openEdit}
            >
              <Camera className="mr-1 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </div>

      {isHost && (
        <>
          <BuildingCodeShareCard buildingCode={building.unique_code} className="mb-6" />
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Active Rooms</p>
              <p className="mt-1 text-2xl font-bold">{activeRooms}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Pending Payments</p>
              <p className="mt-1 text-2xl font-bold text-yellow-700">{billStats.pending}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Verified Payments</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{billStats.verified}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Unpaid</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{billStats.unpaid}</p>
            </Card>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" onClick={() => setShowMaintenance(true)}>
              <Wrench className="mr-2 h-4 w-4" /> Manage Maintenance
            </Button>
            {isPrimaryHost && (
              <Button variant="outline" onClick={() => setShowHosts(true)}>
                <Users className="mr-2 h-4 w-4" /> Manage Hosts
              </Button>
            )}

            <Button variant="outline" className="relative" onClick={() => setShowMonthly(true)}>
              <Wrench className="mr-2 h-4 w-4" /> Monthly Billing
              {billStats.pending > 0 && (
                <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {billStats.pending}
                </span>
              )}
            </Button>

            <Button asChild variant="outline" className="relative">
              <Link to="/building/$id/notifications" params={{ id }}>
                <Bell className="mr-2 h-4 w-4" /> Notifications
                {unreadNotifs > 0 && (
                  <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setShowChat(true)}>
              <MessageCircle className="mr-2 h-4 w-4" /> Chat with Residents
            </Button>
            <Button
              variant={showResidents ? "default" : "outline"}
              onClick={() => setShowResidents((v) => !v)}
              aria-expanded={showResidents}
            >
              <Users className="mr-2 h-4 w-4" />
              Residents ({residents.length})
            </Button>
            <Button variant="outline" onClick={() => setShowContacts(true)}>
              <Phone className="mr-2 h-4 w-4" /> Contact List
            </Button>
          </div>

          <Card className="mb-6 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Join Requests</h2>
              <span className="text-xs text-muted-foreground">{joinRequests.length} pending</span>
            </div>
            {joinRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending requests. Residents will appear here after asking to join.
              </p>
            ) : (
              <ul className="divide-y">
                {joinRequests.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {req.applicant_name}{" "}
                        <span className="text-muted-foreground">→ Room {req.room_number}</span>
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {req.applicant_email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {req.applicant_mobile}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveRequest(req)}
                        disabled={decidingId === req.id}
                      >
                        {decidingId === req.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectRequest(req)}
                        disabled={decidingId === req.id}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Dialog open={showResidents} onOpenChange={setShowResidents}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Residents ({residents.length} active)</DialogTitle>
                <DialogDescription>
                  Approved residents in this building. Remove anyone to revoke their access.
                </DialogDescription>
              </DialogHeader>
              {residents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No residents yet. Approved join requests will appear here.
                </p>
              ) : (
                <ul className="divide-y">
                  {residents.map((r) => (
                    <li
                      key={r.ru_id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {r.name || r.email || "(no name)"}{" "}
                          <span className="text-muted-foreground">→ Room {r.room_number}</span>
                        </p>
                        <p className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {r.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {r.email}
                            </span>
                          )}
                          {r.mobile && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {r.mobile}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {r.is_host ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            Host
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => promoteResident(r)}
                            disabled={promotingId === r.user_id}
                          >
                            {promotingId === r.user_id ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserPlus className="mr-1 h-3.5 w-3.5" />
                            )}
                            Make Host
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeResident(r)}
                          disabled={removingResidentId === r.ru_id}
                        >
                          {removingResidentId === r.ru_id ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="mr-1 h-3.5 w-3.5" />
                          )}
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </DialogContent>
          </Dialog>

          <MaintenanceDialog
            buildingId={id}
            open={showMaintenance}
            onOpenChange={setShowMaintenance}
          />

          <HostsDialog buildingId={id} open={showHosts} onOpenChange={setShowHosts} />

          {showRooms && (
            <Card className="p-5">
              <h2 className="mb-4 text-lg font-semibold">Rooms</h2>
              <form onSubmit={addRoom} className="mb-4 flex gap-2">
                <Input
                  placeholder="Room number (e.g. 101)"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                />
                <Button type="submit">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </form>
              {rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rooms yet.</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {rooms.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-3 py-2">
                      <span className="font-medium">Room {r.room_number}</span>
                      <span
                        className={`text-xs ${r.is_active ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      )}

      {isMember && (
        <Card className="mt-6 p-5">
          <h2 className="text-lg font-semibold">My Room</h2>
          <p className="mt-2 text-muted-foreground">
            View your monthly maintenance bills and pay using QR code.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setShowMyBills(true)}>
              <Wrench className="mr-2 h-4 w-4" /> View My Bills
            </Button>
            <Button variant="outline" onClick={() => setShowChat(true)}>
              <MessageCircle className="mr-2 h-4 w-4" /> Chat with Host
            </Button>
            <Button variant="outline" onClick={() => setShowContacts(true)}>
              <LifeBuoy className="mr-2 h-4 w-4" /> Help
            </Button>

            <Button asChild variant="outline" className="relative">
              <Link to="/building/$id/notifications" params={{ id }}>
                <Bell className="mr-2 h-4 w-4" /> Notifications
                {unreadNotifs > 0 && (
                  <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {!isHost && !isMember && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Join this building</h2>
          {myRequest?.status === "pending" ? (
            <>
              <p className="mt-2 text-muted-foreground">
                Your request for Room <b>{myRequest.room_number}</b> is pending host approval.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={cancelMyRequest}>
                  <X className="mr-1 h-4 w-4" /> Cancel Request
                </Button>
              </div>
            </>
          ) : myRequest?.status === "rejected" ? (
            <>
              <p className="mt-2 text-muted-foreground">
                Your previous request for Room <b>{myRequest.room_number}</b> was rejected. You can
                try again with a different room number.
              </p>
              <div className="mt-4">
                <Button onClick={openJoinDialog}>
                  <UserPlus className="mr-1 h-4 w-4" /> Request Again
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-muted-foreground">
                Send a request to the hosts with your room number. Once they approve, you'll be
                added to that room and can view your bills.
              </p>
              <div className="mt-4">
                <Button onClick={openJoinDialog}>
                  <UserPlus className="mr-1 h-4 w-4" /> Request to Join
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to join</DialogTitle>
            <DialogDescription>
              Provide your room number. Hosts will see your name, email and mobile to approve.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitJoinRequest} className="space-y-3">
            <div>
              <Label>Room number</Label>
              <Input
                placeholder="e.g. 101"
                value={joinForm.room_number}
                onChange={(e) => setJoinForm({ ...joinForm, room_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Your name</Label>
              <Input
                value={joinForm.name}
                onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={joinForm.email}
                onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={joinForm.mobile}
                onChange={(e) => setJoinForm({ ...joinForm, mobile: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJoinOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={joinBusy}>
                {joinBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Building Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
            </div>
            <div>
              <Label>Building Photo</Label>
              {editPreview ? (
                <div className="relative mt-2 overflow-hidden rounded-md border">
                  <img src={editPreview} alt="Preview" className="h-40 w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => {
                      setEditPhoto(null);
                      if (editPreview) URL.revokeObjectURL(editPreview);
                      setEditPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : building.photo_url && !removePhoto ? (
                <div className="relative mt-2 overflow-hidden rounded-md border">
                  <img src={photo!} alt="Current" className="h-40 w-full object-cover" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={() => setRemovePhoto(true)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground hover:bg-accent/30">
                  <Camera className="mb-1 h-5 w-5" />
                  Click to upload (JPG/PNG/WEBP, max 5MB)
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onEditPhoto}
                  />
                </label>
              )}
              {(editPreview || (building.photo_url && !removePhoto)) && (
                <label className="mt-2 inline-flex cursor-pointer text-xs text-primary hover:underline">
                  Choose a different photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onEditPhoto}
                  />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ChatDialog buildingId={id} open={showChat} onOpenChange={setShowChat} />
      {isHost && (
        <MonthlyBillingDialog buildingId={id} open={showMonthly} onOpenChange={setShowMonthly} />
      )}

      <MyBillsDialog buildingId={id} open={showMyBills} onOpenChange={setShowMyBills} />

      <ContactsDialog
        buildingId={id}
        isHost={isHost}
        open={showContacts}
        onOpenChange={setShowContacts}
      />
    </div>
  );
}
