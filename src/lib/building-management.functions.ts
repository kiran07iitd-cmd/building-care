import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "./building-management-admin.server";
import { generateBuildingCode, normalizeBuildingCode } from "./building-code";

const uuidSchema = z.string().uuid();
const buildingInput = z.object({ buildingId: uuidSchema });

async function requireActiveHost(buildingId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("hosts")
    .select("id,user_id,is_primary,status")
    .eq("building_id", buildingId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Only active hosts can manage this building");
  return data;
}

async function requireRoomInBuilding(roomId: string, buildingId: string) {
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select("id,room_number,is_active,building_id")
    .eq("id", roomId)
    .eq("building_id", buildingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Room not found in this building");
  return data;
}

async function getProfileByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,email,name,mobile,google_account")
    .ilike("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function evaluateHostRequest(requestId: string) {
  const { data: request, error: requestError } = await supabaseAdmin
    .from("host_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) throw new Error(requestError.message);
  if (!request || request.status !== "pending") return;

  const { data: latestVotes, error: votesError } = await supabaseAdmin
    .from("host_request_votes")
    .select("vote,host_id")
    .eq("request_id", request.id);

  if (votesError) throw new Error(votesError.message);
  const votes = latestVotes || [];

  if (votes.some((v) => v.vote === "disagree")) {
    const { error } = await supabaseAdmin
      .from("host_requests")
      .update({ status: "rejected" })
      .eq("id", request.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { data: activeHosts, error: hostsError } = await supabaseAdmin
    .from("hosts")
    .select("id")
    .eq("building_id", request.building_id)
    .eq("status", "active");

  if (hostsError) throw new Error(hostsError.message);
  const activeIds = new Set((activeHosts || []).map((host) => host.id));
  const agreedIds = new Set(votes.filter((vote) => vote.vote === "agree").map((vote) => vote.host_id));
  const allAgreed = activeIds.size > 0 && [...activeIds].every((hostId) => agreedIds.has(hostId));
  if (!allAgreed) return;

  if (request.request_type === "add_host") {
    const profile = await getProfileByEmail(request.new_user_email || "");
    if (!profile) {
      const { error } = await supabaseAdmin
        .from("host_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);
      if (error) throw new Error(error.message);
      throw new Error("New host must register before approval can complete");
    }

    const { count, error: countError } = await supabaseAdmin
      .from("hosts")
      .select("id", { count: "exact", head: true })
      .eq("building_id", request.building_id)
      .eq("status", "active");
    if (countError) throw new Error(countError.message);

    const { data: building, error: buildingError } = await supabaseAdmin
      .from("buildings")
      .select("host_count")
      .eq("id", request.building_id)
      .maybeSingle();
    if (buildingError) throw new Error(buildingError.message);
    if ((count || 0) >= (building?.host_count || 1)) {
      throw new Error("Host limit reached. Increase the host limit first.");
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("hosts")
      .select("id,status")
      .eq("building_id", request.building_id)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    if (existing) {
      const { error } = await supabaseAdmin
        .from("hosts")
        .update({ status: "active", is_primary: false })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("hosts").insert({
        building_id: request.building_id,
        user_id: profile.id,
        is_primary: false,
        status: "active",
      });
      if (error) throw new Error(error.message);
    }
  }

  if (request.request_type === "change_host_count") {
    const limit = Number.parseInt(request.new_user_email || "", 10);
    if (!Number.isInteger(limit) || limit < 1 || limit > 5) {
      throw new Error("Host limit must be between 1 and 5");
    }

    const { error } = await supabaseAdmin
      .from("buildings")
      .update({ host_count: limit })
      .eq("id", request.building_id);
    if (error) throw new Error(error.message);
  }

  const { error } = await supabaseAdmin
    .from("host_requests")
    .update({ status: "approved" })
    .eq("id", request.id);
  if (error) throw new Error(error.message);
}

const accessCodeSchema = z
  .string()
  .trim()
  .regex(/^B-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/i);

export const getBuildingPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, accessCode: accessCodeSchema.optional() }))
  .handler(async ({ data, context }) => {
    const [
      { data: building, error: buildingError },
      { data: host, error: hostError },
      { data: assignments, error: assignmentsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("buildings")
        .select("id,name,location,unique_code,host_count,photo_url,created_by")
        .eq("id", data.buildingId)
        .maybeSingle(),
      supabaseAdmin
        .from("hosts")
        .select("is_primary")
        .eq("building_id", data.buildingId)
        .eq("user_id", context.userId)
        .eq("status", "active")
        .maybeSingle(),
      supabaseAdmin.from("room_users").select("room_id").eq("user_id", context.userId).eq("status", "active"),
    ]);
    if (buildingError) throw new Error(buildingError.message);
    if (hostError) throw new Error(hostError.message);
    if (assignmentsError) throw new Error(assignmentsError.message);
    if (!building) throw new Error("Building not found or code invalid");

    let isResident = false;
    const assignedRoomIds = (assignments || []).map((assignment) => assignment.room_id);
    if (assignedRoomIds.length) {
      const { data: residentRoom, error: residentRoomError } = await supabaseAdmin
        .from("rooms")
        .select("id")
        .eq("building_id", data.buildingId)
        .in("id", assignedRoomIds)
        .limit(1)
        .maybeSingle();
      if (residentRoomError) throw new Error(residentRoomError.message);
      isResident = Boolean(residentRoom);
    }

    const isMember = Boolean(host || isResident || building.created_by === context.userId);
    if (!isMember) {
      const { data: attempts, error: rateLimitError } = await supabaseAdmin.rpc(
        "consume_building_code_lookup",
        { _user_id: context.userId },
      );
      if (rateLimitError) throw new Error(rateLimitError.message);
      if (attempts > 20) throw new Error("Too many building-code lookups; try again later");
      if (!data.accessCode || normalizeBuildingCode(data.accessCode) !== building.unique_code) {
        throw new Error("Building not found or code invalid");
      }
    }

    let rooms: { id: string; room_number: string; is_active: boolean }[] = [];
    if (isMember) {
      const { data: memberRooms, error: memberRoomsError } = await supabaseAdmin
        .from("rooms")
        .select("id,room_number,is_active")
        .eq("building_id", data.buildingId)
        .order("room_number");
      if (memberRoomsError) throw new Error(memberRoomsError.message);
      rooms = memberRooms || [];
    }

    return {
      building: {
        id: building.id,
        name: building.name,
        location: building.location,
        unique_code: building.unique_code,
        host_count: building.host_count,
        photo_url: building.photo_url,
      },
      rooms,
      isHost: Boolean(host),
      isPrimaryHost: Boolean(host?.is_primary),
      isMember,
    };
  });

export const submitRoomJoinRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      buildingId: uuidSchema,
      accessCode: accessCodeSchema,
      roomNumber: z.string().trim().min(1).max(30),
      applicantName: z.string().trim().min(1).max(100),
      applicantMobile: z.string().trim().min(5).max(20),
    }),
  )
  .handler(async ({ data, context }) => {
    const { data: attempts, error: rateLimitError } = await supabaseAdmin.rpc(
      "consume_building_code_lookup",
      { _user_id: context.userId },
    );
    if (rateLimitError) throw new Error(rateLimitError.message);
    if (attempts > 20) throw new Error("Too many building-code lookups; try again later");

    const { data: building, error: buildingError } = await supabaseAdmin
      .from("buildings")
      .select("id,name,unique_code")
      .eq("id", data.buildingId)
      .maybeSingle();
    if (buildingError) throw new Error(buildingError.message);
    if (!building || normalizeBuildingCode(data.accessCode) !== building.unique_code) {
      throw new Error("A valid building code is required to request access");
    }

    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    if (authUserError) throw new Error(authUserError.message);

    const { error: requestError } = await supabaseAdmin.from("room_join_requests").insert({
      building_id: data.buildingId,
      requested_by: context.userId,
      room_number: data.roomNumber,
      applicant_name: data.applicantName,
      applicant_email: authUser.user.email ?? "",
      applicant_mobile: data.applicantMobile,
      status: "pending",
    });
    if (requestError) throw new Error(requestError.message);

    const { data: hosts, error: hostsError } = await supabaseAdmin
      .from("hosts")
      .select("user_id")
      .eq("building_id", data.buildingId)
      .eq("status", "active");
    if (hostsError) throw new Error(hostsError.message);

    if (hosts?.length) {
      const { error: notificationError } = await supabaseAdmin.from("notifications").insert(
        hosts.map((host) => ({
          building_id: data.buildingId,
          receiver_id: host.user_id,
          type: "host_request",
          title: "New room join request",
          message: `${data.applicantName} (${authUser.user.email ?? ""}, ${data.applicantMobile}) wants to join Room ${data.roomNumber}.`,
        })),
      );
      if (notificationError) console.error(notificationError.message);
    }

    return { ok: true };
  });

export const cancelRoomJoinRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, requestId: uuidSchema }))
  .handler(async ({ data, context }) => {
    const { data: deleted, error } = await supabaseAdmin
      .from("room_join_requests")
      .delete()
      .eq("id", data.requestId)
      .eq("building_id", data.buildingId)
      .eq("requested_by", context.userId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!deleted) throw new Error("This pending request cannot be cancelled");
    return { ok: true };
  });

export const decideRoomJoinRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      buildingId: uuidSchema,
      requestId: uuidSchema,
      decision: z.enum(["approved", "rejected"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const host = await requireActiveHost(data.buildingId, context.userId);
    const { data: request, error: requestError } = await supabaseAdmin
      .from("room_join_requests")
      .select("id,requested_by,room_number,applicant_name,status")
      .eq("id", data.requestId)
      .eq("building_id", data.buildingId)
      .eq("status", "pending")
      .maybeSingle();
    if (requestError) throw new Error(requestError.message);
    if (!request) throw new Error("This join request is no longer pending");

    let room: { id: string; room_number: string; is_active: boolean } | null = null;
    if (data.decision === "approved") {
      const { data: rooms, error: roomsError } = await supabaseAdmin
        .from("rooms")
        .select("id,room_number,is_active")
        .eq("building_id", data.buildingId);
      if (roomsError) throw new Error(roomsError.message);

      const roomList = rooms || [];
      const roomIds = roomList.map((item) => item.id);
      if (roomIds.length) {
        const { data: assignment, error: assignmentError } = await supabaseAdmin
          .from("room_users")
          .select("room_id")
          .eq("user_id", request.requested_by)
          .eq("status", "active")
          .in("room_id", roomIds)
          .limit(1)
          .maybeSingle();
        if (assignmentError) throw new Error(assignmentError.message);
        if (assignment) throw new Error("This user already has an active room in this building");
      }

      room =
        roomList.find(
          (item) => item.room_number.trim().toLowerCase() === request.room_number.trim().toLowerCase(),
        ) ?? null;
      if (!room) {
        const { data: createdRoom, error: createRoomError } = await supabaseAdmin
          .from("rooms")
          .insert({
            building_id: data.buildingId,
            room_number: request.room_number.trim(),
            is_active: true,
          })
          .select("id,room_number,is_active")
          .single();
        if (createRoomError) throw new Error(createRoomError.message);
        room = createdRoom;
      } else if (!room.is_active) {
        const { error: activateError } = await supabaseAdmin
          .from("rooms")
          .update({ is_active: true })
          .eq("id", room.id)
          .eq("building_id", data.buildingId);
        if (activateError) throw new Error(activateError.message);
      }

      const { error: assignmentError } = await supabaseAdmin.from("room_users").insert({
        room_id: room.id,
        user_id: request.requested_by,
        assigned_by: host.id,
        status: "active",
      });
      if (assignmentError) throw new Error(assignmentError.message);
    }

    const { error: updateError } = await supabaseAdmin
      .from("room_join_requests")
      .update({ status: data.decision, decided_by: context.userId, decided_at: new Date().toISOString() })
      .eq("id", request.id)
      .eq("building_id", data.buildingId)
      .eq("status", "pending");
    if (updateError) throw new Error(updateError.message);

    const { error: notificationError } = await supabaseAdmin.from("notifications").insert({
      building_id: data.buildingId,
      receiver_id: request.requested_by,
      type: data.decision === "approved" ? "payment_verified" : "payment_rejected",
      title: data.decision === "approved" ? "Join request approved" : "Join request rejected",
      message:
        data.decision === "approved"
          ? `You've been added to Room ${room?.room_number}.`
          : `Your request to join Room ${request.room_number} was rejected.`,
      related_room_id: data.decision === "approved" ? room?.id : null,
    });
    if (notificationError) console.error(notificationError.message);

    return { ok: true };
  });

export const removeResidentFromRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, roomUserId: uuidSchema }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("room_users")
      .select("id,user_id,room_id,status")
      .eq("id", data.roomUserId)
      .eq("status", "active")
      .maybeSingle();
    if (membershipError) throw new Error(membershipError.message);
    if (!membership) throw new Error("This resident is no longer active in a room");
    await requireRoomInBuilding(membership.room_id, data.buildingId);

    const { error: updateError } = await supabaseAdmin
      .from("room_users")
      .update({ status: "removed" })
      .eq("id", membership.id)
      .eq("status", "active");
    if (updateError) throw new Error(updateError.message);

    const { error: notificationError } = await supabaseAdmin.from("notifications").insert({
      building_id: data.buildingId,
      receiver_id: membership.user_id,
      type: "payment_rejected",
      title: "Removed from building",
      message: "You have been removed from your room in this building.",
      related_room_id: membership.room_id,
    });
    if (notificationError) console.error(notificationError.message);

    return { ok: true };
  });

export const getManageRoomsData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(buildingInput)
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const [{ data: building, error: buildingError }, { data: rooms, error: roomsError }] = await Promise.all([
      supabaseAdmin.from("buildings").select("name").eq("id", data.buildingId).maybeSingle(),
      supabaseAdmin
        .from("rooms")
        .select("id,room_number,is_active")
        .eq("building_id", data.buildingId)
        .order("room_number"),
    ]);

    if (buildingError) throw new Error(buildingError.message);
    if (roomsError) throw new Error(roomsError.message);

    const roomList = rooms || [];
    const roomIds = roomList.map((room) => room.id);
    const assignments: Record<string, { room_id: string; user_id: string; email: string | null; name: string | null; mobile: string | null }> = {};

    if (roomIds.length) {
      const { data: roomUsers, error: roomUsersError } = await supabaseAdmin
        .from("room_users")
        .select("room_id,user_id")
        .eq("status", "active")
        .in("room_id", roomIds);
      if (roomUsersError) throw new Error(roomUsersError.message);

      const userIds = [...new Set((roomUsers || []).map((row) => row.user_id))];
      let profileMap: Record<string, { email: string | null; name: string | null; mobile: string | null }> = {};
      if (userIds.length) {
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from("profiles")
          .select("id,email,name,mobile")
          .in("id", userIds);
        if (profilesError) throw new Error(profilesError.message);
        profileMap = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
      }

      (roomUsers || []).forEach((row) => {
        assignments[row.room_id] = {
          room_id: row.room_id,
          user_id: row.user_id,
          email: profileMap[row.user_id]?.email ?? null,
          name: profileMap[row.user_id]?.name ?? null,
          mobile: profileMap[row.user_id]?.mobile ?? null,
        };
      });
    }

    return { buildingName: building?.name ?? "", rooms: roomList, assignments };
  });

export const addRoomToBuilding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, roomNumber: z.string().trim().min(1).max(30) }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    const roomNumber = data.roomNumber.trim();

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("rooms")
      .select("id,room_number")
      .eq("building_id", data.buildingId);
    if (existingError) throw new Error(existingError.message);
    if ((existing || []).some((room) => room.room_number.toLowerCase() === roomNumber.toLowerCase())) {
      throw new Error("Room number already exists in this building");
    }

    const { error } = await supabaseAdmin.from("rooms").insert({
      building_id: data.buildingId,
      room_number: roomNumber,
      is_active: true,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleRoomActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, roomId: uuidSchema, isActive: z.boolean() }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    await requireRoomInBuilding(data.roomId, data.buildingId);

    if (!data.isActive) {
      const { count, error: countError } = await supabaseAdmin
        .from("rooms")
        .select("id", { count: "exact", head: true })
        .eq("building_id", data.buildingId)
        .eq("is_active", true);
      if (countError) throw new Error(countError.message);
      if ((count || 0) <= 1) {
        throw new Error("Cannot deactivate. At least 1 room must remain active.");
      }
    }

    const { error } = await supabaseAdmin
      .from("rooms")
      .update({ is_active: data.isActive })
      .eq("id", data.roomId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeRoomUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, roomId: uuidSchema }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    await requireRoomInBuilding(data.roomId, data.buildingId);

    const { error } = await supabaseAdmin
      .from("room_users")
      .update({ status: "removed" })
      .eq("room_id", data.roomId)
      .eq("status", "active");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const searchAssignableUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, email: z.string().trim().email().max(254) }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    const profile = await getProfileByEmail(data.email);
    if (!profile) throw new Error("No registered user found with that email");
    return { id: profile.id, email: profile.email ?? data.email, name: profile.name };
  });

export const assignUserToRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, roomId: uuidSchema, userId: uuidSchema }))
  .handler(async ({ data, context }) => {
    const host = await requireActiveHost(data.buildingId, context.userId);
    await requireRoomInBuilding(data.roomId, data.buildingId);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", data.userId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);
    if (!profile) throw new Error("Selected user is no longer available");

    // Check if this user is already actively assigned to any room in this building
    const { data: buildingRooms, error: brErr } = await supabaseAdmin
      .from("rooms")
      .select("id,room_number")
      .eq("building_id", data.buildingId);
    if (brErr) throw new Error(brErr.message);
    const buildingRoomIds = (buildingRooms || []).map((r) => r.id);
    if (buildingRoomIds.length) {
      const { data: existing, error: exErr } = await supabaseAdmin
        .from("room_users")
        .select("room_id")
        .eq("user_id", data.userId)
        .eq("status", "active")
        .in("room_id", buildingRoomIds);
      if (exErr) throw new Error(exErr.message);
      const conflict = (existing || []).find((row) => row.room_id !== data.roomId);
      if (conflict) {
        const roomNumber = buildingRooms?.find((r) => r.id === conflict.room_id)?.room_number;
        throw new Error(`This user is already assigned to Room ${roomNumber} in this building.`);
      }
    }

    const { error: removeError } = await supabaseAdmin
      .from("room_users")
      .update({ status: "removed" })
      .eq("room_id", data.roomId)
      .eq("status", "active");
    if (removeError) throw new Error(removeError.message);

    const { error } = await supabaseAdmin.from("room_users").insert({
      room_id: data.roomId,
      user_id: data.userId,
      assigned_by: host.id,
      status: "active",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMaintenanceData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(buildingInput)
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const [buildingResult, roomCountResult, categoriesResult] = await Promise.all([
      supabaseAdmin.from("buildings").select("name").eq("id", data.buildingId).maybeSingle(),
      supabaseAdmin
        .from("rooms")
        .select("id", { count: "exact", head: true })
        .eq("building_id", data.buildingId)
        .eq("is_active", true),
      supabaseAdmin
        .from("maintenance_categories")
        .select("*")
        .eq("building_id", data.buildingId)
        .order("created_at"),
    ]);

    if (buildingResult.error) throw new Error(buildingResult.error.message);
    if (roomCountResult.error) throw new Error(roomCountResult.error.message);
    if (categoriesResult.error) throw new Error(categoriesResult.error.message);

    const categories = (categoriesResult.data || []).map((category) => ({
      ...category,
      total_amount: Number(category.total_amount),
      per_room_amount: Number(category.per_room_amount),
      penalty_amount: Number(category.penalty_amount),
    }));

    const qrUrls: Record<string, string> = {};
    for (const category of categories) {
      if (!category.qr_code_image) continue;
      const { data: signed } = await supabaseAdmin.storage
        .from("maintenance-qr")
        .createSignedUrl(category.qr_code_image, 3600);
      if (signed?.signedUrl) qrUrls[category.id] = signed.signedUrl;
    }

    return {
      buildingName: buildingResult.data?.name ?? "",
      activeRoomCount: roomCountResult.count || 0,
      categories,
      qrUrls,
    };
  });

export const saveMaintenanceCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      buildingId: uuidSchema,
      categoryId: uuidSchema.optional(),
      name: z.string().trim().min(1).max(80),
      totalAmount: z.number().min(0),
      penaltyAmount: z.number().min(0),
      upiId: z.string().trim().max(120).nullable(),
      qrCodeImage: z.string().trim().max(500).nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const { count, error: countError } = await supabaseAdmin
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .eq("building_id", data.buildingId)
      .eq("is_active", true);
    if (countError) throw new Error(countError.message);

    const activeRoomCount = count || 0;
    const perRoomAmount = activeRoomCount > 0 ? Math.round((data.totalAmount / activeRoomCount) * 100) / 100 : 0;

    const payload = {
      name: data.name.trim(),
      total_amount: data.totalAmount,
      per_room_amount: perRoomAmount,
      penalty_amount: data.penaltyAmount,
      upi_id: data.upiId?.trim() || null,
      qr_code_image: data.qrCodeImage,
    };

    if (data.categoryId) {
      const { error } = await supabaseAdmin
        .from("maintenance_categories")
        .update(payload)
        .eq("id", data.categoryId)
        .eq("building_id", data.buildingId);
      if (error) throw new Error(error.message);
      return { ok: true, perRoomAmount };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("maintenance_categories")
      .insert({
        ...payload,
        building_id: data.buildingId,
        is_active: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    // Auto-publish this maintenance for the current month to every active room,
    // so residents immediately see it in "View My Bills".
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { data: activeRooms } = await supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("building_id", data.buildingId)
      .eq("is_active", true);
    if (activeRooms && activeRooms.length && inserted) {
      const { data: mm, error: mmErr } = await supabaseAdmin
        .from("monthly_maintenance")
        .upsert(
          {
            building_id: data.buildingId,
            category_id: inserted.id,
            month,
            total_amount: data.totalAmount,
            per_room_amount: perRoomAmount,
            penalty_amount: data.penaltyAmount,
            is_published: true,
            published_at: new Date().toISOString(),
          },
          { onConflict: "category_id,month" },
        )
        .select("id")
        .single();
      if (!mmErr && mm) {
        const rows = activeRooms.map((r) => ({
          building_id: data.buildingId,
          room_id: r.id,
          category_id: inserted.id,
          monthly_maintenance_id: mm.id,
          month,
          amount_due: perRoomAmount,
          penalty_amount: 0,
          total_due: perRoomAmount,
          payment_status: "not_paid",
        }));
        await supabaseAdmin
          .from("room_maintenance_status")
          .upsert(rows, { onConflict: "monthly_maintenance_id,room_id", ignoreDuplicates: true });
      }
    }
    return { ok: true, perRoomAmount };
  });

export const toggleMaintenanceCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, categoryId: uuidSchema, isActive: z.boolean() }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    const { error } = await supabaseAdmin
      .from("maintenance_categories")
      .update({ is_active: data.isActive })
      .eq("id", data.categoryId)
      .eq("building_id", data.buildingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const applyCurrentMonthPenalties = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, month: z.string().trim().min(4).max(30) }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const { data: rows, error } = await supabaseAdmin
      .from("room_maintenance_status")
      .select("id,amount_due,category_id,penalty_applied")
      .eq("building_id", data.buildingId)
      .eq("month", data.month)
      .eq("payment_status", "not_paid");
    if (error) throw new Error(error.message);
    if (!rows?.length) return { updated: 0 };

    const categoryIds = [...new Set(rows.map((row) => row.category_id))];
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("maintenance_categories")
      .select("id,penalty_amount")
      .in("id", categoryIds);
    if (categoriesError) throw new Error(categoriesError.message);

    const penaltyMap = Object.fromEntries((categories || []).map((category) => [category.id, Number(category.penalty_amount)]));
    let updated = 0;
    for (const row of rows) {
      if (row.penalty_applied) continue;
      const penalty = penaltyMap[row.category_id] || 0;
      const { error: updateError } = await supabaseAdmin
        .from("room_maintenance_status")
        .update({
          penalty_applied: true,
          penalty_amount: penalty,
          total_due: Number(row.amount_due) + penalty,
        })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
      updated += 1;
    }

    return { updated };
  });

export const getManageHostsData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(buildingInput)
  .handler(async ({ data, context }) => {
    const myHost = await requireActiveHost(data.buildingId, context.userId);

    const [{ data: building, error: buildingError }, { data: hostRows, error: hostsError }] = await Promise.all([
      supabaseAdmin.from("buildings").select("name,host_count").eq("id", data.buildingId).maybeSingle(),
      supabaseAdmin
        .from("hosts")
        .select("id,user_id,is_primary,status")
        .eq("building_id", data.buildingId),
    ]);
    if (buildingError) throw new Error(buildingError.message);
    if (hostsError) throw new Error(hostsError.message);

    const activeHosts = (hostRows || []).filter((host) => host.status === "active");
    const userIds = activeHosts.map((host) => host.user_id);
    let profileMap: Record<string, { email: string | null; name: string | null; mobile: string | null }> = {};

    if (userIds.length) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id,email,name,mobile")
        .in("id", userIds);
      if (profilesError) throw new Error(profilesError.message);
      profileMap = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
    }

    const hosts = activeHosts.map((host) => ({
      ...host,
      email: profileMap[host.user_id]?.email ?? null,
      name: profileMap[host.user_id]?.name ?? null,
      mobile: profileMap[host.user_id]?.mobile ?? null,
    }));

    const { data: requests, error: requestsError } = await supabaseAdmin
      .from("host_requests")
      .select("*")
      .eq("building_id", data.buildingId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (requestsError) throw new Error(requestsError.message);

    let votes: { id: string; request_id: string; host_id: string; vote: string }[] = [];
    if (requests?.length) {
      const { data: voteRows, error: votesError } = await supabaseAdmin
        .from("host_request_votes")
        .select("id,request_id,host_id,vote")
        .in("request_id", requests.map((request) => request.id));
      if (votesError) throw new Error(votesError.message);
      votes = voteRows || [];
    }

    return {
      buildingName: building?.name ?? "",
      hostCount: building?.host_count ?? 1,
      myUserId: context.userId,
      myHostId: myHost.id,
      hosts,
      requests: requests || [],
      votes,
    };
  });

export const requestAddBuildingHost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      buildingId: uuidSchema,
      email: z.string().trim().email().max(254),
      mobile: z.string().trim().min(5).max(20),
      google: z.string().trim().email().max(254),
    }),
  )
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const profile = await getProfileByEmail(data.email);
    if (!profile) throw new Error("This person must register on BuildingCare first");
    if ((profile.mobile || "").trim() !== data.mobile.trim()) throw new Error("Mobile number does not match this user");
    const googleAccount = (profile.google_account || profile.email || "").trim().toLowerCase();
    if (googleAccount !== data.google.trim().toLowerCase()) throw new Error("Google account email does not match this user");

    const { data: existingHost, error: existingHostError } = await supabaseAdmin
      .from("hosts")
      .select("id,status")
      .eq("building_id", data.buildingId)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existingHostError) throw new Error(existingHostError.message);
    if (existingHost?.status === "active") throw new Error("This user is already an active host");

    const { data: existingRequest, error: existingRequestError } = await supabaseAdmin
      .from("host_requests")
      .select("id")
      .eq("building_id", data.buildingId)
      .eq("request_type", "add_host")
      .eq("status", "pending")
      .ilike("new_user_email", data.email.trim().toLowerCase())
      .maybeSingle();
    if (existingRequestError) throw new Error(existingRequestError.message);
    if (existingRequest) throw new Error("A pending request already exists for this host");

    const { error } = await supabaseAdmin.from("host_requests").insert({
      building_id: data.buildingId,
      request_type: "add_host",
      requested_by: context.userId,
      new_user_email: data.email.trim().toLowerCase(),
      new_user_mobile: data.mobile.trim(),
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestHostLimitChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, limit: z.number().int().min(1).max(5) }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    const { error } = await supabaseAdmin.from("host_requests").insert({
      building_id: data.buildingId,
      request_type: "change_host_count",
      requested_by: context.userId,
      new_user_email: String(data.limit),
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const voteOnHostRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, requestId: uuidSchema, vote: z.enum(["agree", "disagree"]) }))
  .handler(async ({ data, context }) => {
    const host = await requireActiveHost(data.buildingId, context.userId);

    const { data: request, error: requestError } = await supabaseAdmin
      .from("host_requests")
      .select("id,building_id,status")
      .eq("id", data.requestId)
      .eq("building_id", data.buildingId)
      .maybeSingle();
    if (requestError) throw new Error(requestError.message);
    if (!request || request.status !== "pending") throw new Error("This request is no longer pending");

    const { data: existingVote, error: existingVoteError } = await supabaseAdmin
      .from("host_request_votes")
      .select("id")
      .eq("request_id", data.requestId)
      .eq("host_id", host.id)
      .maybeSingle();
    if (existingVoteError) throw new Error(existingVoteError.message);
    if (existingVote) throw new Error("You already voted on this request");

    const { error } = await supabaseAdmin.from("host_request_votes").insert({
      request_id: data.requestId,
      host_id: host.id,
      vote: data.vote,
    });
    if (error) throw new Error(error.message);

    await evaluateHostRequest(data.requestId);
    return { ok: true };
  });

export const transferHostPosition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      buildingId: uuidSchema,
      hostId: uuidSchema,
      email: z.string().trim().email().max(254),
      mobile: z.string().trim().min(5).max(20),
      google: z.string().trim().email().max(254),
    }),
  )
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    const { data: hostToTransfer, error: hostError } = await supabaseAdmin
      .from("hosts")
      .select("id,user_id,is_primary,status")
      .eq("id", data.hostId)
      .eq("building_id", data.buildingId)
      .eq("user_id", context.userId)
      .eq("status", "active")
      .maybeSingle();
    if (hostError) throw new Error(hostError.message);
    if (!hostToTransfer) throw new Error("You can only transfer your own active host position");

    const profile = await getProfileByEmail(data.email);
    if (!profile) throw new Error("This person must register on BuildingCare first");
    if ((profile.mobile || "").trim() !== data.mobile.trim()) throw new Error("Mobile number does not match this user");
    const googleAccount = (profile.google_account || profile.email || "").trim().toLowerCase();
    if (googleAccount !== data.google.trim().toLowerCase()) throw new Error("Google account email does not match this user");

    const { error: removeError } = await supabaseAdmin
      .from("hosts")
      .update({ status: "removed", is_primary: false })
      .eq("id", hostToTransfer.id);
    if (removeError) throw new Error(removeError.message);

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("hosts")
      .select("id")
      .eq("building_id", data.buildingId)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    if (existing) {
      const { error } = await supabaseAdmin
        .from("hosts")
        .update({ status: "active", is_primary: hostToTransfer.is_primary })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("hosts").insert({
        building_id: data.buildingId,
        user_id: profile.id,
        is_primary: hostToTransfer.is_primary,
        status: "active",
      });
      if (error) throw new Error(error.message);
    }

    return { ok: true };
  });
// Ensures the signed-in resident's room has bill rows for the given month,
// generated from the building's active maintenance categories.
export const ensureMyBills = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ buildingId: uuidSchema, month: z.string().trim().min(6).max(10) }),
  )
  .handler(async ({ data, context }) => {
    const { data: assignments, error: assignmentError } = await supabaseAdmin
      .from("room_users")
      .select("room_id")
      .eq("user_id", context.userId)
      .eq("status", "active");
    if (assignmentError) throw new Error(assignmentError.message);

    const assignedRoomIds = (assignments || []).map((assignment) => assignment.room_id);
    if (!assignedRoomIds.length) return { created: 0 };

    const { data: rooms, error: roomError } = await supabaseAdmin
      .from("rooms")
      .select("id")
      .in("id", assignedRoomIds)
      .eq("building_id", data.buildingId)
      .eq("is_active", true)
      .limit(1);
    if (roomError) throw new Error(roomError.message);
    const room = rooms?.[0];
    if (!room) return { created: 0 };

    const { data: cats } = await supabaseAdmin
      .from("maintenance_categories")
      .select("id,per_room_amount,total_amount,penalty_amount")
      .eq("building_id", data.buildingId)
      .eq("is_active", true);
    if (!cats?.length) return { created: 0 };

    let created = 0;
    for (const cat of cats) {
      let { data: mm } = await supabaseAdmin
        .from("monthly_maintenance")
        .select("id")
        .eq("category_id", cat.id)
        .eq("month", data.month)
        .maybeSingle();
      if (!mm) {
        const { data: ins, error: monthlyError } = await supabaseAdmin
          .from("monthly_maintenance")
          .insert({
            building_id: data.buildingId,
            category_id: cat.id,
            month: data.month,
            total_amount: cat.total_amount,
            per_room_amount: cat.per_room_amount,
            penalty_amount: cat.penalty_amount,
            is_published: true,
            published_at: new Date().toISOString(),
          })
          .select("id")
          .maybeSingle();
        if (monthlyError) throw new Error(monthlyError.message);
        mm = ins ?? null;
      }
      if (!mm) continue;

      const { data: existing } = await supabaseAdmin
        .from("room_maintenance_status")
        .select("id")
        .eq("monthly_maintenance_id", mm.id)
        .eq("room_id", room.id)
        .maybeSingle();
      if (existing) continue;

      const amount = Number(cat.per_room_amount) || 0;
      const { error } = await supabaseAdmin.from("room_maintenance_status").insert({
        building_id: data.buildingId,
        room_id: room.id,
        category_id: cat.id,
        monthly_maintenance_id: mm.id,
        month: data.month,
        amount_due: amount,
        penalty_amount: 0,
        total_due: amount,
        payment_status: "not_paid",
      });
      if (error) throw new Error(error.message);
      created += 1;
    }
    return { created };
  });

const monthInput = z.object({
  buildingId: uuidSchema,
  month: z.string().trim().min(6).max(10),
});

async function syncBillingForMonth(buildingId: string, month: string) {
  const [{ data: cats }, { data: rooms }] = await Promise.all([
    supabaseAdmin
      .from("maintenance_categories")
      .select("id,name,total_amount,per_room_amount,penalty_amount")
      .eq("building_id", buildingId)
      .eq("is_active", true),
    supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("building_id", buildingId)
      .eq("is_active", true),
  ]);

  const activeRooms = rooms || [];
  let created = 0;
  for (const cat of cats || []) {
    const perRoom =
      activeRooms.length > 0
        ? Math.round((Number(cat.total_amount) / activeRooms.length) * 100) / 100
        : Number(cat.per_room_amount) || 0;

    let { data: mm } = await supabaseAdmin
      .from("monthly_maintenance")
      .select("id")
      .eq("category_id", cat.id)
      .eq("month", month)
      .maybeSingle();

    if (!mm) {
      const { data: ins, error } = await supabaseAdmin
        .from("monthly_maintenance")
        .insert({
          building_id: buildingId,
          category_id: cat.id,
          month,
          total_amount: Number(cat.total_amount),
          per_room_amount: perRoom,
          penalty_amount: Number(cat.penalty_amount),
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      mm = ins ?? null;
    }
    if (!mm) continue;

    const { data: existing } = await supabaseAdmin
      .from("room_maintenance_status")
      .select("room_id")
      .eq("monthly_maintenance_id", mm.id);
    const have = new Set((existing || []).map((r) => r.room_id));
    const missing = activeRooms.filter((r) => !have.has(r.id));
    if (missing.length) {
      const { error } = await supabaseAdmin.from("room_maintenance_status").insert(
        missing.map((r) => ({
          building_id: buildingId,
          room_id: r.id,
          category_id: cat.id,
          monthly_maintenance_id: mm!.id,
          month,
          amount_due: perRoom,
          penalty_amount: 0,
          total_due: perRoom,
          payment_status: "not_paid",
        })),
      );
      if (error) throw new Error(error.message);
      created += missing.length;
    }
  }
  return created;
}

export const getMonthlyBillingData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(monthInput)
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    await syncBillingForMonth(data.buildingId, data.month);

    const [{ data: cats }, { data: rooms }, { data: statuses }] = await Promise.all([
      supabaseAdmin
        .from("maintenance_categories")
        .select("id,name,total_amount,per_room_amount,penalty_amount")
        .eq("building_id", data.buildingId)
        .eq("is_active", true)
        .order("created_at"),
      supabaseAdmin
        .from("rooms")
        .select("id,room_number")
        .eq("building_id", data.buildingId)
        .eq("is_active", true),
      supabaseAdmin
        .from("room_maintenance_status")
        .select(
          "id,room_id,category_id,amount_due,penalty_amount,total_due,payment_status,payment_requested_at,verified_at",
        )
        .eq("building_id", data.buildingId)
        .eq("month", data.month),
    ]);

    const roomMap = Object.fromEntries((rooms || []).map((r) => [r.id, r.room_number]));
    const catMap = Object.fromEntries((cats || []).map((c) => [c.id, c.name]));

    return {
      activeRoomCount: (rooms || []).length,
      categories: (cats || []).map((c) => ({
        id: c.id,
        name: c.name,
        total_amount: Number(c.total_amount),
        per_room_amount: Number(c.per_room_amount),
        penalty_amount: Number(c.penalty_amount),
      })),
      rows: (statuses || []).map((s) => ({
        id: s.id,
        room_number: roomMap[s.room_id] || "?",
        category_id: s.category_id,
        category_name: catMap[s.category_id] || "?",
        amount_due: Number(s.amount_due),
        penalty_amount: Number(s.penalty_amount),
        total_due: Number(s.total_due),
        payment_status: s.payment_status,
        payment_requested_at: s.payment_requested_at,
        verified_at: s.verified_at,
      })),
    };
  });

export const getBillingStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(monthInput)
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("room_maintenance_status")
      .select("payment_status,total_due")
      .eq("building_id", data.buildingId)
      .eq("month", data.month);
    if (error) throw new Error(error.message);
    const list = rows || [];
    return {
      pending: list.filter((r) => r.payment_status === "pending_verification").length,
      verified: list.filter((r) => r.payment_status === "paid").length,
      unpaid: list.filter((r) => r.payment_status === "not_paid").length,
      collected: list
        .filter((r) => r.payment_status === "paid")
        .reduce((sum, r) => sum + Number(r.total_due), 0),
      expected: list.reduce((sum, r) => sum + Number(r.total_due), 0),
    };
  });

export const decidePaymentVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      buildingId: uuidSchema,
      statusId: uuidSchema,
      approve: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    const host = await requireActiveHost(data.buildingId, context.userId);
    const payload = data.approve
      ? {
          payment_status: "paid",
          verified_at: new Date().toISOString(),
          verified_by: host.user_id,
        }
      : { payment_status: "not_paid", payment_requested_at: null, verified_at: null };
    const { error } = await supabaseAdmin
      .from("room_maintenance_status")
      .update(payload)
      .eq("id", data.statusId)
      .eq("building_id", data.buildingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetMonthlyBilling = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(monthInput)
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const { error: statusError } = await supabaseAdmin
      .from("room_maintenance_status")
      .delete()
      .eq("building_id", data.buildingId)
      .eq("month", data.month);
    if (statusError) throw new Error(statusError.message);

    const { error: monthlyError } = await supabaseAdmin
      .from("monthly_maintenance")
      .delete()
      .eq("building_id", data.buildingId)
      .eq("month", data.month);
    if (monthlyError) throw new Error(monthlyError.message);

    const created = await syncBillingForMonth(data.buildingId, data.month);
    return { created };
  });

/**
 * Display names for the people in a building, readable by any active member
 * (host or resident). Browser-side RLS only exposes a user's own profile row,
 * so chat lists must resolve names through this trusted path.
 */
export const getBuildingDirectory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(buildingInput)
  .handler(async ({ data, context }) => {
    const { data: hostRows, error: hostError } = await supabaseAdmin
      .from("hosts")
      .select("user_id,is_primary,status")
      .eq("building_id", data.buildingId)
      .eq("status", "active");
    if (hostError) throw new Error(hostError.message);

    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from("rooms")
      .select("id,room_number")
      .eq("building_id", data.buildingId);
    if (roomsError) throw new Error(roomsError.message);

    const roomIds = (rooms || []).map((room) => room.id);
    let residentRows: { user_id: string; room_id: string }[] = [];
    if (roomIds.length) {
      const { data: ru, error: ruError } = await supabaseAdmin
        .from("room_users")
        .select("user_id,room_id")
        .eq("status", "active")
        .in("room_id", roomIds);
      if (ruError) throw new Error(ruError.message);
      residentRows = ru || [];
    }

    const isMember =
      (hostRows || []).some((h) => h.user_id === context.userId) ||
      residentRows.some((r) => r.user_id === context.userId);
    if (!isMember) throw new Error("You are not a member of this building");

    const userIds = [
      ...new Set([...(hostRows || []).map((h) => h.user_id), ...residentRows.map((r) => r.user_id)]),
    ];
    let profileMap: Record<string, { name: string | null; email: string | null }> = {};
    if (userIds.length) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id,name,email")
        .in("id", userIds);
      if (profilesError) throw new Error(profilesError.message);
      profileMap = Object.fromEntries(
        (profiles || []).map((p) => [p.id, { name: p.name, email: p.email }]),
      );
    }

    const roomNumberById = Object.fromEntries((rooms || []).map((r) => [r.id, r.room_number]));

    return {
      hosts: (hostRows || []).map((h) => ({
        user_id: h.user_id,
        is_primary: h.is_primary,
        name: profileMap[h.user_id]?.name ?? null,
        email: profileMap[h.user_id]?.email ?? null,
      })),
      residents: residentRows.map((r) => ({
        user_id: r.user_id,
        room_number: roomNumberById[r.room_id] ?? null,
        name: profileMap[r.user_id]?.name ?? null,
        email: profileMap[r.user_id]?.email ?? null,
      })),
    };
  });

/**
 * Residents of a building with their contact details, for hosts only.
 * Browser RLS exposes only a user's own profile row, so names/emails must be
 * resolved through this trusted path.
 */
export const getBuildingResidents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(buildingInput)
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from("rooms")
      .select("id,room_number")
      .eq("building_id", data.buildingId);
    if (roomsError) throw new Error(roomsError.message);

    const roomIds = (rooms || []).map((r) => r.id);
    if (!roomIds.length) return { residents: [] };

    const { data: ru, error: ruError } = await supabaseAdmin
      .from("room_users")
      .select("id,user_id,room_id")
      .eq("status", "active")
      .in("room_id", roomIds);
    if (ruError) throw new Error(ruError.message);

    const userIds = [...new Set((ru || []).map((r) => r.user_id))];
    let profileMap: Record<string, { name: string | null; email: string | null; mobile: string | null }> = {};
    if (userIds.length) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id,name,email,mobile")
        .in("id", userIds);
      if (profilesError) throw new Error(profilesError.message);
      profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    }

    const { data: hostRows, error: hostRowsError } = await supabaseAdmin
      .from("hosts")
      .select("user_id,status")
      .eq("building_id", data.buildingId)
      .eq("status", "active");
    if (hostRowsError) throw new Error(hostRowsError.message);
    const hostIds = new Set((hostRows || []).map((h) => h.user_id));

    const roomNumberById = Object.fromEntries((rooms || []).map((r) => [r.id, r.room_number]));

    return {
      residents: (ru || []).map((r) => ({
        ru_id: r.id,
        user_id: r.user_id,
        room_id: r.room_id,
        room_number: roomNumberById[r.room_id] ?? "?",
        name: profileMap[r.user_id]?.name ?? null,
        email: profileMap[r.user_id]?.email ?? null,
        mobile: profileMap[r.user_id]?.mobile ?? null,
        is_host: hostIds.has(r.user_id),
      })),
    };
  });

/**
 * Promote an existing active resident to a secondary host of the same
 * building. The resident keeps their room; host powers apply building-wide.
 */
export const promoteResidentToHost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ buildingId: uuidSchema, userId: uuidSchema }))
  .handler(async ({ data, context }) => {
    await requireActiveHost(data.buildingId, context.userId);

    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from("rooms")
      .select("id")
      .eq("building_id", data.buildingId);
    if (roomsError) throw new Error(roomsError.message);
    const roomIds = (rooms || []).map((r) => r.id);

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("room_users")
      .select("id")
      .eq("user_id", data.userId)
      .eq("status", "active")
      .in("room_id", roomIds.length ? roomIds : ["00000000-0000-0000-0000-000000000000"])
      .maybeSingle();
    if (membershipError) throw new Error(membershipError.message);
    if (!membership) throw new Error("This person is not an active resident of this building");

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("hosts")
      .select("id,status")
      .eq("building_id", data.buildingId)
      .eq("user_id", data.userId)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (existing?.status === "active") throw new Error("This person is already a host");

    // Make room for the new host if the building's limit is already reached.
    const { count, error: countError } = await supabaseAdmin
      .from("hosts")
      .select("id", { count: "exact", head: true })
      .eq("building_id", data.buildingId)
      .eq("status", "active");
    if (countError) throw new Error(countError.message);

    const { data: building, error: buildingError } = await supabaseAdmin
      .from("buildings")
      .select("host_count,name")
      .eq("id", data.buildingId)
      .maybeSingle();
    if (buildingError) throw new Error(buildingError.message);

    const nextCount = (count || 0) + 1;
    if (nextCount > (building?.host_count || 1)) {
      if (nextCount > 5) throw new Error("A building can have at most 5 hosts");
      const { error } = await supabaseAdmin
        .from("buildings")
        .update({ host_count: nextCount })
        .eq("id", data.buildingId);
      if (error) throw new Error(error.message);
    }

    if (existing) {
      const { error } = await supabaseAdmin
        .from("hosts")
        .update({ status: "active", is_primary: false })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("hosts").insert({
        building_id: data.buildingId,
        user_id: data.userId,
        is_primary: false,
        status: "active",
      });
      if (error) throw new Error(error.message);
    }

    const { error: notifError } = await supabaseAdmin.from("notifications").insert({
      building_id: data.buildingId,
      receiver_id: data.userId,
      type: "host_request",
      title: "You are now a host",
      message: `You've been made a host of ${building?.name ?? "this building"}. You can manage rooms, maintenance and payments.`,
    });
    if (notifError) throw new Error(notifError.message);

    return { ok: true };
  });

/**
 * Register a new building.
 * Requires an authenticated user and always assigns the new building to that user.
 */
export const registerNewBuilding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().trim().min(1).max(100),
      location: z.string().trim().min(1).max(200),
      hostCount: z.number().int().min(1).max(5).default(1),
    }),
  )
  .handler(async ({ data, context }) => {
    // Host/resident is a user-selectable app mode, not an authorization claim.
    // The authenticated context supplies created_by for every new building.
    let createdBuilding: { id: string; name: string; unique_code: string } | null = null;
    let lastError: string | null = null;

    for (let i = 0; i < 10; i++) {
      const code = generateBuildingCode();
      const { data: b, error } = await supabaseAdmin
        .from("buildings")
        .insert({
          name: data.name.trim(),
          location: data.location.trim(),
          unique_code: code,
          host_count: data.hostCount,
          created_by: context.userId,
        })
        .select("id, name, unique_code")
        .single();

      if (error) {
        lastError = error.message;
        if (error.code !== "23505") break;
        continue;
      }

      // 3. Assign creator as primary host
      const { error: hostErr } = await supabaseAdmin.from("hosts").insert({
        building_id: b.id,
        user_id: context.userId,
        is_primary: true,
        status: "active",
      });

      if (hostErr) {
        throw new Error(hostErr.message);
      }

      createdBuilding = b;
      break;
    }

    if (!createdBuilding) {
      throw new Error(lastError || "Could not create building");
    }

    return {
      ok: true,
      building: createdBuilding,
    };
  });
