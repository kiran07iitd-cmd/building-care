import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Plus,
  UserPlus,
  UserMinus,
  Search,
  Home,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  addRoomToBuilding,
  assignUserToRoom,
  getManageRoomsData,
  removeRoomUser,
  searchAssignableUser,
  toggleRoomActive,
} from "@/lib/building-management.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRequireHost } from "@/hooks/use-require-host";

export const Route = createFileRoute("/_authenticated/building/$id_/rooms")({
  head: () => ({ meta: [{ title: "Manage Rooms — BuildingCare" }] }),
  component: ManageRoomsPage,
});

type Room = { id: string; room_number: string; is_active: boolean };
type Assignment = { room_id: string; user_id: string; email: string | null; name: string | null; mobile: string | null };

const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Please try again.";

function ManageRoomsPage() {
  const { id } = useParams({ from: "/_authenticated/building/$id_/rooms" });
  useRequireHost(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const fetchRooms = useServerFn(getManageRoomsData);
  const createRoom = useServerFn(addRoomToBuilding);
  const setRoomActive = useServerFn(toggleRoomActive);
  const unassignRoomUser = useServerFn(removeRoomUser);
  const findUser = useServerFn(searchAssignableUser);
  const assignRoomUser = useServerFn(assignUserToRoom);

  const query = useQuery({
    queryKey: ["rooms", id],
    queryFn: async () => {
      try {
        return await fetchRooms({ data: { buildingId: id } });
      } catch (e) {
        toast.error(errorMessage(e));
        navigate({ to: "/building/$id", params: { id } });
        throw e;
      }
    },
    staleTime: 30 * 1000,
  });

  const buildingName = query.data?.buildingName ?? "";
  const rooms: Room[] = (query.data?.rooms as Room[]) ?? [];
  const assignments: Record<string, Assignment> = query.data?.assignments ?? {};
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter((r) => r.is_active).length;
  const inactiveRooms = totalRooms - activeRooms;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["rooms", id] });

  // Add room
  const [addOpen, setAddOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = newRoom.trim();
    setAddError(null);
    if (!num) return setAddError("Room number is required");
    if (rooms.some((r) => r.room_number.toLowerCase() === num.toLowerCase())) {
      return setAddError(`Room ${num} already exists in this building`);
    }
    setAdding(true);
    try {
      await createRoom({ data: { buildingId: id, roomNumber: num } });
      toast.success(`Room ${num} added successfully!`);
      setNewRoom("");
      setAddOpen(false);
      invalidate();
    } catch (e) {
      setAddError(errorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  // Activate / deactivate
  const [confirmToggle, setConfirmToggle] = useState<Room | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const doToggle = async (room: Room) => {
    setBusy(room.id);
    try {
      await setRoomActive({
        data: { buildingId: id, roomId: room.id, isActive: !room.is_active },
      });
      toast.success(room.is_active ? "Room deactivated" : "Room activated");
      setConfirmToggle(null);
      invalidate();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  // Remove user
  const [confirmRemove, setConfirmRemove] = useState<Room | null>(null);
  const doRemoveUser = async (room: Room) => {
    setBusy(room.id);
    try {
      await unassignRoomUser({ data: { buildingId: id, roomId: room.id } });
      toast.success(`User removed from Room ${room.room_number}`);
      setConfirmRemove(null);
      invalidate();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  // Assign
  const [assignRoom, setAssignRoom] = useState<Room | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; name: string | null } | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);

  const openAssign = (room: Room) => {
    setAssignRoom(room);
    setAssignEmail("");
    setFoundUser(null);
    setAssignError(null);
  };

  const searchUser = async () => {
    const email = assignEmail.trim().toLowerCase();
    setAssignError(null);
    setFoundUser(null);
    if (!email) return setAssignError("Enter an email");
    setSearching(true);
    try {
      const data = await findUser({ data: { buildingId: id, email } });
      setFoundUser({ id: data.id, email: data.email ?? email, name: data.name });
    } catch (e) {
      setAssignError(errorMessage(e));
    } finally {
      setSearching(false);
    }
  };

  const confirmAssign = async () => {
    if (!assignRoom || !foundUser) return;
    setBusy(assignRoom.id);
    try {
      await assignRoomUser({
        data: { buildingId: id, roomId: assignRoom.id, userId: foundUser.id },
      });
      toast.success(`User assigned to Room ${assignRoom.room_number} successfully!`);
      setAssignRoom(null);
      setFoundUser(null);
      setAssignEmail("");
      invalidate();
    } catch (e) {
      setAssignError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/building/$id" params={{ id }} className="hover:text-foreground">
          {buildingName || "Building"}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Manage Rooms</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/building/$id", params: { id } })}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Manage Rooms</h1>
        </div>
        <Button onClick={() => { setAddOpen(true); setAddError(null); setNewRoom(""); }}>
          <Plus className="mr-1 h-4 w-4" /> Add Room
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Total Rooms" value={totalRooms} loading={query.isLoading} />
        <StatCard label="Active Rooms" value={activeRooms} loading={query.isLoading} tone="green" />
        <StatCard label="Inactive Rooms" value={inactiveRooms} loading={query.isLoading} tone="red" />
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        {query.isLoading ? (
          <ul className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-40" />
              </li>
            ))}
          </ul>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <Home className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No rooms added yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Add Room" to add the first room
            </p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Room
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {rooms.map((r) => {
              const a = assignments[r.id];
              const isBusy = busy === r.id;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Room {r.room_number}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.is_active ? "🟢 Active" : "🔴 Inactive"}
                      </span>
                    </div>
                    {a ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <div className="text-foreground">{a.name || "(no name)"}</div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {a.email && <span>✉️ {a.email}</span>}
                          {a.mobile && <span>📞 {a.mobile}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-muted-foreground">Not Assigned</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAssign(r)} disabled={isBusy}>
                      <UserPlus className="mr-1 h-3.5 w-3.5" />
                      {a ? "Replace" : "Assign User"}
                    </Button>
                    {a && (
                      <Button size="sm" variant="outline" onClick={() => setConfirmRemove(r)} disabled={isBusy}>
                        <UserMinus className="mr-1 h-3.5 w-3.5" /> Remove
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={r.is_active ? "destructive" : "default"}
                      onClick={() => setConfirmToggle(r)}
                      disabled={isBusy}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : r.is_active ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Add room dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => !adding && setAddOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>e.g. 101, A-201, GF-01</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAdd} className="space-y-3">
            <Input
              placeholder="Room number"
              value={newRoom}
              onChange={(e) => { setNewRoom(e.target.value); setAddError(null); }}
              autoFocus
            />
            {addError && <p className="text-sm text-destructive">{addError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>
                Cancel
              </Button>
              <Button type="submit" disabled={adding}>
                {adding && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Add Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activate/Deactivate confirm */}
      <AlertDialog open={!!confirmToggle} onOpenChange={(o) => !o && setConfirmToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.is_active ? "Deactivate" : "Activate"} Room {confirmToggle?.room_number}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.is_active
                ? "This room will be excluded from maintenance calculations. Amount per room will be recalculated."
                : "This room will be included in maintenance calculations. Amount per room will be recalculated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmToggle && doToggle(confirmToggle); }}
              disabled={!!busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmToggle?.is_active ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove user confirm */}
      <AlertDialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User from Room {confirmRemove?.room_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove && assignments[confirmRemove.id]?.email}
              <br />will be removed from this room. They will lose access to bills.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmRemove && doRemoveUser(confirmRemove); }}
              disabled={!!busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign dialog */}
      <Dialog open={!!assignRoom} onOpenChange={(o) => !o && setAssignRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Room {assignRoom?.room_number}</DialogTitle>
            <DialogDescription>
              User must be registered on BuildingCare.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="owner@example.com"
                value={assignEmail}
                onChange={(e) => { setAssignEmail(e.target.value); setFoundUser(null); setAssignError(null); }}
              />
              <Button type="button" onClick={searchUser} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
            {foundUser && (
              <div className="rounded-md border bg-accent/50 p-3 text-sm">
                <p className="font-medium">✅ {foundUser.name || "(no name)"}</p>
                <p className="text-muted-foreground">{foundUser.email}</p>
              </div>
            )}
            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoom(null)} disabled={!!busy}>
              Cancel
            </Button>
            <Button onClick={confirmAssign} disabled={!foundUser || !!busy}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Assign This User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  tone,
}: {
  label: string;
  value: number;
  loading: boolean;
  tone?: "green" | "red";
}) {
  const color =
    tone === "green" ? "text-green-600" : tone === "red" ? "text-red-600" : "text-foreground";
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mx-auto mt-2 h-7 w-10" />
      ) : (
        <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      )}
    </Card>
  );
}
