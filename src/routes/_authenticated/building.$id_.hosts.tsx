import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, UserPlus, ArrowRightLeft, Users2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  getManageHostsData,
  requestAddBuildingHost,
  requestHostLimitChange,
  transferHostPosition,
  voteOnHostRequest,
} from "@/lib/building-management.functions";
import { useRequireHost } from "@/hooks/use-require-host";

export const Route = createFileRoute("/_authenticated/building/$id_/hosts")({
  head: () => ({ meta: [{ title: "Manage Hosts — BuildingCare" }] }),
  component: ManageHostsPage,
});

type HostRow = {
  id: string;
  user_id: string;
  is_primary: boolean;
  status: string;
  email: string | null;
  name: string | null;
  mobile: string | null;
};
type RequestRow = {
  id: string;
  building_id: string;
  request_type: string;
  status: string;
  requested_by: string;
  new_user_email: string | null;
  new_user_mobile: string | null;
  created_at: string;
};
type VoteRow = { id: string; request_id: string; host_id: string; vote: string };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

function ManageHostsPage() {
  const { id } = useParams({ from: "/_authenticated/building/$id_/hosts" });
  useRequireHost(id);
  const navigate = useNavigate();
  const fetchHosts = useServerFn(getManageHostsData);
  const submitAddHostRequest = useServerFn(requestAddBuildingHost);
  const submitHostLimitRequest = useServerFn(requestHostLimitChange);
  const submitHostVote = useServerFn(voteOnHostRequest);
  const submitHostTransfer = useServerFn(transferHostPosition);
  const [loading, setLoading] = useState(true);
  const [buildingName, setBuildingName] = useState("");
  const [hostCount, setHostCount] = useState(1);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myHostId, setMyHostId] = useState<string | null>(null);
  const [hosts, setHosts] = useState<HostRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);

  // Add host dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", mobile: "", google: "" });
  const [addBusy, setAddBusy] = useState(false);

  // Transfer dialog
  const [transferHost, setTransferHost] = useState<HostRow | null>(null);
  const [transferForm, setTransferForm] = useState({ email: "", mobile: "", google: "" });
  const [transferBusy, setTransferBusy] = useState(false);

  // Change limit dialog
  const [limitOpen, setLimitOpen] = useState(false);
  const [newLimit, setNewLimit] = useState("1");

  // confirm transfer
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHosts({ data: { buildingId: id } });
      setMyUserId(data.myUserId);
      setMyHostId(data.myHostId);
      setBuildingName(data.buildingName);
      setHostCount(data.hostCount);
      setNewLimit(String(data.hostCount));
      setHosts(data.hosts as HostRow[]);
      setRequests(data.requests as RequestRow[]);
      setVotes(data.votes as VoteRow[]);
    } catch (error) {
      toast.error(errorMessage(error));
      navigate({ to: "/building/$id", params: { id } });
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitAddHost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email || !addForm.mobile || !addForm.google) {
      return toast.error("All fields are required");
    }
    setAddBusy(true);
    try {
      await submitAddHostRequest({
        data: {
          buildingId: id,
          email: addForm.email.trim().toLowerCase(),
          mobile: addForm.mobile.trim(),
          google: addForm.google.trim().toLowerCase(),
        },
      });
      toast.success("Request submitted. Awaiting host votes.");
      setAddOpen(false);
      setAddForm({ email: "", mobile: "", google: "" });
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAddBusy(false);
    }
  };

  const submitChangeLimit = async () => {
    const limit = Number.parseInt(newLimit, 10);
    try {
      await submitHostLimitRequest({ data: { buildingId: id, limit } });
      toast.success("Limit change request submitted");
      setLimitOpen(false);
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const vote = async (request: RequestRow, value: "agree" | "disagree") => {
    if (!myHostId) return;
    if (votes.some((v) => v.request_id === request.id && v.host_id === myHostId)) {
      return toast.error("You already voted");
    }
    try {
      await submitHostVote({ data: { buildingId: id, requestId: request.id, vote: value } });
      toast.success(value === "agree" ? "Vote submitted" : "Request rejected");
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const startTransfer = (host: HostRow) => {
    setTransferHost(host);
    setTransferForm({ email: "", mobile: "", google: "" });
  };

  const doTransfer = async () => {
    if (!transferHost) return;
    if (!transferForm.email || !transferForm.mobile || !transferForm.google) {
      return toast.error("All fields are required");
    }
    setTransferBusy(true);
    try {
      await submitHostTransfer({
        data: {
          buildingId: id,
          hostId: transferHost.id,
          email: transferForm.email.trim().toLowerCase(),
          mobile: transferForm.mobile.trim(),
          google: transferForm.google.trim().toLowerCase(),
        },
      });
      toast.success("Host position transferred");
      setTransferHost(null);
      setConfirmTransfer(false);
      load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setTransferBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 py-10 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading hosts…
      </div>
    );
  }

  const requestVoteCount = (req: RequestRow) => {
    const rv = votes.filter((v) => v.request_id === req.id);
    return {
      agree: rv.filter((v) => v.vote === "agree").length,
      total: hosts.length,
      mine: rv.find((v) => v.host_id === myHostId)?.vote,
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/building/$id" params={{ id }} className="hover:text-foreground">
          {buildingName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Hosts</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage Hosts</h1>
          <p className="text-sm text-muted-foreground">
            {hosts.length} active host{hosts.length === 1 ? "" : "s"} · Limit {hostCount}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setLimitOpen(true)}>
            <Users2 className="mr-1 h-4 w-4" /> Change Host Limit
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-1 h-4 w-4" /> Request Add Host
          </Button>
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <ul className="divide-y">
          {hosts.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{h.name || "(no name)"}</span>
                  {h.is_primary ? (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      👑 Primary Host
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Host
                    </span>
                  )}
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {h.email} · {h.mobile || "no mobile"}
                </p>
              </div>
              {h.user_id === myUserId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startTransfer(h)}
                >
                  <ArrowRightLeft className="mr-1 h-3.5 w-3.5" /> Transfer My Position
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Pending Requests</h2>
      {requests.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No pending requests.
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const c = requestVoteCount(r);
            return (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {r.request_type === "add_host"
                        ? `Add new host: ${r.new_user_email}`
                        : `Change host limit to ${r.new_user_email}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.agree}/{c.total} hosts agreed
                      {c.mine && ` · You voted ${c.mine}`}
                    </p>
                  </div>
                  {!c.mine && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => vote(r, "agree")}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Agree
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => vote(r, "disagree")}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Disagree
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add host dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to add a new host</DialogTitle>
            <DialogDescription>
              All current hosts must agree before the new host is added.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAddHost} className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={addForm.mobile}
                onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Google Account email</Label>
              <Input
                type="email"
                value={addForm.google}
                onChange={(e) => setAddForm({ ...addForm, google: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addBusy}>
                {addBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change limit dialog */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change host limit</DialogTitle>
            <DialogDescription>
              Submits a request — all current hosts must agree.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>New limit</Label>
            <Select value={newLimit} onValueChange={setNewLimit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLimitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitChangeLimit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer dialog */}
      <Dialog
        open={!!transferHost}
        onOpenChange={(o) => {
          if (!o) {
            setTransferHost(null);
            setConfirmTransfer(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer my host position</DialogTitle>
            <DialogDescription>
              The new person must already be registered on BuildingCare.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={transferForm.email}
                onChange={(e) => setTransferForm({ ...transferForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input
                value={transferForm.mobile}
                onChange={(e) => setTransferForm({ ...transferForm, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label>Google Account email</Label>
              <Input
                type="email"
                value={transferForm.google}
                onChange={(e) => setTransferForm({ ...transferForm, google: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferHost(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setConfirmTransfer(true)}>
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmTransfer} onOpenChange={setConfirmTransfer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer host position?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose host access to this building immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doTransfer} disabled={transferBusy}>
              {transferBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Confirm Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
